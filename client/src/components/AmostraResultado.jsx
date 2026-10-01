import { useEffect, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { numSinal } from "../lib/i18n.js";
import { EIXOS_META } from "../lib/questions.js";
import { quadrante } from "../lib/scoring.js";
import { intensidade, partesDaManchete } from "../lib/manchete.js";
import Bussola from "./Bussola.jsx";

// Quatro resultados de exemplo, um em cada quadrante e com intensidades
// diferentes. Um ponto parado num quadrante sugeriria um lado; passeando pelos
// quatro, a amostra mostra o resultado de verdade sem sugerir nenhum.
const EXEMPLOS = [
  { economico: -4.6, autoridade: -2.9, me: 1.3, ma: 1.7 },
  { economico: 5.2, autoridade: 4.4, me: 1.5, ma: 1.2 },
  { economico: -2.1, autoridade: 5.6, me: 1.1, ma: 1.6 },
  { economico: 7.6, autoridade: -5.3, me: 1.4, ma: 1.8 },
].map((ex) => ({
  economico: { posicao: ex.economico, margem: ex.me },
  autoridade: { posicao: ex.autoridade, margem: ex.ma },
}));

const INTERVALO = 3600;
// O texto troca no meio do apagar e acender (ver .amostra-trocando).
const MEIO_DA_TROCA = 550;

/**
 * A previa do resultado na pagina inicial: manchete, os dois numeros e a
 * bussola de verdade (modo `amostra`), trocando de exemplo a cada poucos
 * segundos. Com prefers-reduced-motion fica parada no primeiro.
 */
export default function AmostraResultado() {
  const { t, lang } = useLang();
  const [ponto, setPonto] = useState(0);
  const [texto, setTexto] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let meio;
    const passo = setInterval(() => {
      setPonto((k) => {
        const proximo = (k + 1) % EXEMPLOS.length;
        meio = setTimeout(() => setTexto(proximo), MEIO_DA_TROCA);
        return proximo;
      });
    }, INTERVALO);
    return () => {
      clearInterval(passo);
      clearTimeout(meio);
    };
  }, []);

  const exemplo = EXEMPLOS[texto];
  const [econ, aut] = partesDaManchete(exemplo, EIXOS_META).map((parte) =>
    t(`manchete_${parte.eixo}_${parte.intensidade}`, t(`polo_${parte.polo}`)),
  );
  const trocando = ponto !== texto ? " amostra-trocando" : "";

  return (
    <aside className="amostra-viva" aria-label={t("home_amostra_exemplo")}>
      <div className="amostra-topo">
        <span className="rotulo">{t("home_amostra_exemplo")}</span>
        <span className="amostra-passos" aria-hidden="true">
          {EXEMPLOS.map((_, i) => (
            <i key={i} data-ativo={i === ponto || undefined} />
          ))}
        </span>
      </div>
      <p className={`amostra-manchete${trocando}`}>{t("res_manchete", econ, aut)}</p>
      <div className={`amostra-numeros${trocando}`}>
        {["economico", "autoridade"].map((eixo) => {
          const { posicao } = exemplo[eixo];
          const polo = t(`polo_${posicao > 0 ? EIXOS_META[eixo].pos : EIXOS_META[eixo].neg}`);
          return (
            <div key={eixo}>
              <span className="rotulo">{t(`eixo_${eixo}`)}</span>
              <strong>{numSinal(lang, posicao)}</strong>
              <small>{t(`leitura_${intensidade(posicao)}`, polo)}</small>
            </div>
          );
        })}
      </div>
      <Bussola resultado={EXEMPLOS[ponto]} quadrante={quadrante(EXEMPLOS[ponto])} amostra />
      <ul className="amostra-recebe">
        {["posicao", "eixos", "fontes", "tradicoes"].map((chave) => (
          <li key={chave}>{t(`home_amostra_${chave}`)}</li>
        ))}
      </ul>
    </aside>
  );
}
