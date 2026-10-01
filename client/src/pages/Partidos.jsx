import { Link, useLocation } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";
import dados from "../data/partidos-bls.json";

// De 1 a 10 para 0% a 100% da regua.
const posicao = (valor) => ((Math.min(10, Math.max(1, valor)) - 1) / 9) * 100;
// O eixo economico do Compass (-10 a +10) levado para a mesma regua de 1 a 10.
const paraRegua = (economico) => 5.5 + economico * 0.45;
const MARCAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Onde ficam os partidos, segundo os proprios parlamentares (Brazilian
 * Legislative Surveys, rodada de 2021). O Compass NAO posiciona partido nenhum:
 * a pagina so mostra o que a pesquisa mediu, numa regua so, de esquerda a
 * direita. Os numeros vem de data/partidos-bls.json, gerado por
 * scripts/partidos-bls.mjs a partir dos dados brutos.
 *
 * O ponto "Voce" so aparece vindo da tela de resultado (state da navegacao):
 * a pagina nao guarda nem le resultado de lugar nenhum.
 */
export default function Partidos() {
  const { t, lang } = useLang();
  const { state } = useLocation();
  const economico = typeof state?.economico === "number" ? state.economico : null;
  const { fonte, partidos, fora, minimo } = dados;

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "40px 64px" }}>
      <div className="pilha" style={{ maxWidth: "44rem" }}>
        <span className="rotulo">{t("partidos_rotulo", fonte.rodada)}</span>
        <h1 className="manchete">{t("partidos_titulo")}</h1>
        <p className="apoio" style={{ fontSize: "16px" }}>
          {t("partidos_intro", fonte.respondentes, fonte.rodada)}
        </p>
        <p className="partidos-aviso">{t("partidos_aviso")}</p>
      </div>

      <div className="partidos-grade">
        <figure className="partidos-grafico" aria-label={t("partidos_grafico")}>
          <div className="partidos-linha partidos-escala" aria-hidden="true">
            <span />
            <div className="partidos-trilho">
              {MARCAS.map((m) => (
                <span key={m} className="partidos-marca" style={{ left: `${posicao(m)}%` }}>
                  {m}
                </span>
              ))}
            </div>
            <span />
          </div>

          <ol className="partidos-lista">
            {economico !== null && (
              <li className="partidos-linha partidos-voce">
                <span className="partidos-nome">
                  <strong>{t("partidos_voce")}</strong>
                  <small>{t("partidos_voce_eixo")}</small>
                </span>
                <div className="partidos-trilho">
                  <span
                    className="partidos-losango"
                    style={{ left: `${posicao(paraRegua(economico))}%` }}
                  />
                </div>
                <span className="partidos-valor">
                  <strong>{num(lang, paraRegua(economico), 1)}</strong>
                </span>
              </li>
            )}
            {partidos.map((p) => (
              <li key={p.sigla} className="partidos-linha">
                <span className="partidos-nome">
                  <strong>{p.sigla}</strong>
                  {p.hoje && <small>{t("partidos_hoje", p.hoje)}</small>}
                </span>
                <div className="partidos-trilho">
                  <span
                    className="partidos-margem"
                    style={{
                      left: `${posicao(p.media - p.margem)}%`,
                      width: `${posicao(p.media + p.margem) - posicao(p.media - p.margem)}%`,
                    }}
                  />
                  <span className="partidos-ponto" style={{ left: `${posicao(p.media)}%` }} />
                </div>
                <span className="partidos-valor">
                  <strong>{num(lang, p.media, 1)}</strong>
                  <small>{t("partidos_notas", p.n)}</small>
                </span>
              </li>
            ))}
          </ol>

          <div className="partidos-linha partidos-pontas" aria-hidden="true">
            <span />
            <div className="partidos-pontas-texto">
              <span>{t("partidos_esquerda")}</span>
              <span>{t("partidos_direita")}</span>
            </div>
            <span />
          </div>
        </figure>

        <div className="pilha">
          <div className="cartao pilha" style={{ gap: "6px" }}>
            <strong>{t("partidos_como_ler")}</strong>
            <p className="apoio">{t("partidos_como_ler_texto")}</p>
          </div>
          <div className="cartao pilha" style={{ gap: "6px" }}>
            <strong>{t("partidos_mudou", fonte.rodada)}</strong>
            <p className="apoio">{t("partidos_mudou_texto")}</p>
          </div>
          <div className="cartao pilha" style={{ gap: "6px" }}>
            <strong>{t("partidos_fora")}</strong>
            <p className="apoio">
              {t(
                "partidos_fora_texto",
                minimo,
                fora.map((p) => t("partidos_fora_item", p.sigla, p.n)).join(", "),
              )}
            </p>
          </div>
          {economico !== null && (
            <div className="cartao pilha" style={{ gap: "6px" }}>
              <strong>{t("partidos_voce_titulo")}</strong>
              <p className="apoio">{t("partidos_voce_texto")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pilha" style={{ gap: "6px", paddingTop: "18px", borderTop: "1px solid var(--line)" }}>
        <span className="rotulo">{t("partidos_fonte")}</span>
        <p style={{ fontFamily: "var(--fonte-texto)", fontSize: "14.5px", color: "var(--ink-mid)" }}>
          {fonte.citacao}{" "}
          <a href={`https://doi.org/${fonte.doi}`} target="_blank" rel="noreferrer">
            doi:{fonte.doi}
          </a>
          . {t("partidos_coordenacao", fonte.coordenacao)}
        </p>
      </div>

      <Link to="/" className="botao-discreto" style={{ justifySelf: "start" }}>
        {t("voltar_inicio")}
      </Link>
    </main>
  );
}
