import { useLang } from "../lib/lang.jsx";
import { num, numSinal } from "../lib/i18n.js";
import { intensidade } from "../lib/manchete.js";

// De -10 a +10 para 0% a 100% da regua.
const paraPercentual = (valor) => ((Math.max(-10, Math.min(10, valor)) + 10) / 20) * 100;

/**
 * Um eixo como REGUA: linha fina com marcas a cada 2 pontos, a margem de erro
 * como um traco e o seu ponto no meio dele, e o polo para onde voce pende em
 * negrito. Antes era um trilho cinza que parecia campo de formulario
 * desativado.
 *
 * `destaque`: versao em cartao, com o numero grande e uma frase de leitura
 * ("Bem para Nacao"), usada no painel dos seis eixos.
 * `semMargem`: a margem ja foi dita uma vez na manchete (igual em todos os
 * eixos), entao nao se repete aqui.
 */
export default function BarraEixo({ eixo, meta, dados, semMargem = false, destaque = false }) {
  const { t, lang } = useLang();

  const { posicao, margem } = dados;
  const ladoPos = posicao > 0;
  const polo = t(`polo_${ladoPos ? meta.pos : meta.neg}`);
  const nivel = intensidade(posicao);
  const inicio = paraPercentual(posicao - margem);
  const fim = paraPercentual(posicao + margem);

  return (
    <div className={`barra-eixo${destaque ? " barra-eixo-destaque" : ""}`}>
      <div className="linha" style={{ justifyContent: "space-between" }}>
        <span className="rotulo">{t(`eixo_${eixo}`)}</span>
        {!semMargem && !destaque && (
          <span className="apoio" style={{ fontSize: "13px" }}>
            {t("res_margem", num(lang, margem, 1))}
          </span>
        )}
      </div>

      {destaque && (
        <div className="barra-numero">
          <strong>{numSinal(lang, posicao)}</strong>
          {nivel !== "centro" && <span>{polo}</span>}
        </div>
      )}

      <div className="regua" aria-hidden="true">
        <span className="regua-margem" style={{ left: `${inicio}%`, width: `${fim - inicio}%` }} />
        <span className="regua-ponto" style={{ left: `${paraPercentual(posicao)}%` }} />
      </div>

      <div className="barra-pontas">
        <span data-ativo={!ladoPos && nivel !== "centro"}>{t(`polo_${meta.neg}`)}</span>
        <span data-ativo={ladoPos && nivel !== "centro"}>{t(`polo_${meta.pos}`)}</span>
      </div>

      {/* O polo ja esta ao lado do numero: aqui so a intensidade. */}
      {destaque && <span className="barra-leitura">{t(`nivel_${nivel}`)}</span>}
    </div>
  );
}
