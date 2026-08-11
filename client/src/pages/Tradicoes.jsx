import { Link, useParams } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { TRADICOES, tradicaoPorId } from "../lib/tradicoes.js";
import { EIXOS_META } from "../lib/questions.js";
import { EIXOS } from "../lib/scoring.js";
import BarraEixo from "../components/BarraEixo.jsx";

/** Uma tradicao vira um "resultado" para reusar a mesma barra da tela de resultado. */
function comoResultado(tradicao) {
  return Object.fromEntries(
    EIXOS.map((eixo) => [eixo, { posicao: tradicao.eixos[eixo] ?? 0, margem: 0, n: 8 }]),
  );
}

export default function Tradicoes() {
  const { id } = useParams();
  const { t, pick } = useLang();
  const tradicao = id ? tradicaoPorId(id) : null;

  if (id && !tradicao) {
    return (
      <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
        <h1>{t("nao_encontrado")}</h1>
        <Link to="/tradicoes" className="botao" style={{ justifySelf: "start" }}>
          {t("tradicoes_titulo")}
        </Link>
      </main>
    );
  }

  if (tradicao) {
    const resultado = comoResultado(tradicao);
    return (
      <main className="coluna pilha-larga" style={{ paddingBlock: "40px 64px" }}>
        <div className="pilha">
          <Link to="/tradicoes" className="rotulo" style={{ textDecoration: "none" }}>
            {t("tradicoes_titulo")}
          </Link>
          <h1>{pick(tradicao.nome)}</h1>
          <p style={{ fontSize: "17px", fontFamily: "var(--fonte-texto)" }}>
            {pick(tradicao.resumo)}
          </p>
        </div>

        <div className="grade grade-2">
          {EIXOS.map((eixo) => (
            <BarraEixo
              key={eixo}
              eixo={eixo}
              meta={EIXOS_META[eixo]}
              dados={resultado[eixo]}
            />
          ))}
        </div>

        <div className="pilha">
          <span className="rotulo">{pick({ pt: "Para ler", en: "Further reading" })}</span>
          <ul className="pilha" style={{ margin: 0, paddingLeft: "18px", gap: "4px" }}>
            {pick(tradicao.leituras).map((leitura) => (
              <li key={leitura} className="apoio">
                {leitura}
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "40px 64px" }}>
      <h1>{t("tradicoes_titulo")}</h1>
      <div className="pilha">
        {TRADICOES.map((item) => (
          <Link
            key={item.id}
            to={`/tradicoes/${item.id}`}
            className="cartao pilha"
            style={{ gap: "5px", textDecoration: "none" }}
          >
            <strong style={{ fontSize: "16.5px" }}>{pick(item.nome)}</strong>
            <p className="apoio">{pick(item.resumo)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
