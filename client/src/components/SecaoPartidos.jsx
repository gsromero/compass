import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";
import { empilharSiglas, maisProximos, naRegua, paraRegua } from "../lib/partidos.js";
import CabecalhoSecao from "./CabecalhoSecao.jsx";
import dados from "../data/partidos-bls.json";

const MARCAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Altura de cada linha de siglas e o espaco entre a de baixo e a regua.
const LINHA = 24;
const BASE = 14;
// Largura estimada de uma etiqueta (11,5px em negrito, com folga dos lados).
const larguraDaSigla = (sigla) => sigla.length * 7.2 + 16;

/**
 * Onde ficam os partidos, dentro do resultado (mockup aprovado em 2026-10-03;
 * antes era a pagina /partidos). Fechada: a regua com as 20 siglas empilhadas,
 * a pessoa, os tres mais proximos e o aviso. Aberta: uma linha por partido,
 * com a margem de erro.
 *
 * A regua de cima e a lista de baixo usam as MESMAS colunas (.pt-grade), para o
 * mesmo numero cair no mesmo lugar nas duas.
 *
 * O Compass NAO posiciona partido nenhum: os numeros sao do Brazilian
 * Legislative Surveys 2021, gerados por scripts/partidos-bls.mjs.
 */
export default function SecaoPartidos({ economico, visitante }) {
  const { t, lang } = useLang();
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const { fonte, partidos, fora, minimo } = dados;
  const voce = paraRegua(economico);
  const perto = maisProximos(partidos, voce);
  const destaque = new Set(perto.map((p) => p.sigla));
  const nome = visitante ? t("bus_esta_pessoa") : t("partidos_voce");

  return (
    <section id="partidos" className="faixa secao-resultado">
      <CabecalhoSecao
        rotulo={t("partidos_sec_rotulo")}
        titulo={t(visitante ? "partidos_sec_titulo_vis" : "partidos_sec_titulo")}
        intro={t(visitante ? "partidos_sec_intro_vis" : "partidos_sec_intro", fonte.rodada)}
      />
      <div className="pt-cartao">
        <div className="pt-grade">
          <span className="pt-nome">
            <strong>{t("partidos_sec_rotulo")}</strong>
            <small>{t("partidos_nota_escala")}</small>
          </span>
          <Pilha partidos={partidos} voce={voce} destaque={destaque} rotulo={t("partidos_grafico")} />
          <span />
        </div>
        <div className="pt-grade pt-linha-voce">
          <span className="pt-nome">
            <strong>{nome}</strong>
            <small>{t("partidos_voce_eixo")}</small>
          </span>
          <Trilho voce={voce}>
            <span className="pt-losango" style={{ left: `${naRegua(voce)}%` }} />
          </Trilho>
          <span className="pt-valor">{num(lang, voce, 1)}</span>
        </div>
        <div className="pt-grade" aria-hidden="true">
          <span />
          <div className="pt-escala">
            {MARCAS.map((m) => (
              <span key={m} style={{ left: `${naRegua(m)}%` }}>
                {m}
              </span>
            ))}
          </div>
          <span />
        </div>
        <div className="pt-grade" aria-hidden="true">
          <span />
          <div className="pt-pontas">
            <span>{t("partidos_esquerda")}</span>
            <span>{t("partidos_direita")}</span>
          </div>
          <span />
        </div>

        <div className="pilha" style={{ gap: "10px" }}>
          <span className="rotulo">{t(visitante ? "partidos_perto_vis" : "partidos_perto")}</span>
          <ul className="pt-proximos">
            {perto.map((p) => (
              <li key={p.sigla}>
                <strong>{p.sigla}</strong>
                <span>
                  {num(lang, p.media, 1)}
                  {p.hoje && ` · ${t("partidos_hoje_curto", p.hoje)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="pt-cuidado">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.5" />
          </svg>
          <span>{t("partidos_cuidado")}</span>
        </p>

        <button
          type="button"
          className="pt-abrir"
          aria-expanded={aberto}
          aria-controls={`${id}-lista`}
          onClick={() => setAberto((v) => !v)}
        >
          <span>{aberto ? t("partidos_fechar") : t("partidos_ver_todos", partidos.length)}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div id={`${id}-lista`} className="pt-completa" hidden={!aberto}>
          <ol className="pt-lista">
            {partidos.map((p) => (
              <li key={p.sigla} className="pt-grade">
                <span className="pt-nome">
                  <strong>{p.sigla}</strong>
                  <small>{p.hoje ? t("partidos_hoje", p.hoje) : t("partidos_notas", p.n)}</small>
                </span>
                <Trilho voce={voce}>
                  <span
                    className="pt-margem"
                    style={{
                      left: `${naRegua(p.media - p.margem)}%`,
                      width: `${naRegua(p.media + p.margem) - naRegua(p.media - p.margem)}%`,
                    }}
                  />
                  <span className="pt-ponto" style={{ left: `${naRegua(p.media)}%` }} />
                </Trilho>
                <span className="pt-valor">{num(lang, p.media, 1)}</span>
              </li>
            ))}
          </ol>
          <div className="pt-notas">
            <div>
              <strong>{t("partidos_como_ler")}</strong>
              {t("partidos_como_ler_texto")}
            </div>
            <div>
              <strong>{t("partidos_mudou", fonte.rodada)}</strong>
              {t("partidos_mudou_texto")}
            </div>
            <div>
              <strong>{t("partidos_fora")}</strong>
              {t(
                "partidos_fora_texto",
                minimo,
                fora.map((p) => t("partidos_fora_item", p.sigla, p.n)).join(", "),
              )}
            </div>
          </div>
          <p className="pt-fonte">
            {t("partidos_fonte")}: {fonte.citacao}{" "}
            <a href={`https://doi.org/${fonte.doi}`} target="_blank" rel="noreferrer">
              doi:{fonte.doi}
            </a>
            . {t("partidos_coordenacao", fonte.coordenacao)}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Uma regua de linha da lista: a base, o centro tracejado e a linha da pessoa. */
function Trilho({ voce, children }) {
  return (
    <div className="pt-trilho" aria-hidden="true">
      <span className="pt-base" />
      <span className="pt-meio" />
      <span className="pt-vline" style={{ left: `${naRegua(voce)}%` }} />
      {children}
    </div>
  );
}

/**
 * As siglas empilhadas sobre a regua. A largura em pixels so existe depois de
 * desenhar, entao mede com ResizeObserver e reempilha quando a tela muda.
 */
function Pilha({ partidos, voce, destaque, rotulo }) {
  const ref = useRef(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => setLargura(el.getBoundingClientRect().width);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const itens = partidos.map((p) => ({ sigla: p.sigla, media: p.media, x: (naRegua(p.media) / 100) * largura }));
  const { etiquetas, linhas } = largura
    ? empilharSiglas(itens, largura, larguraDaSigla)
    : { etiquetas: [], linhas: 0 };
  const altura = Math.max(1, linhas) * LINHA + BASE;
  const topo = (linha) => altura - BASE - (linha + 1) * LINHA + 2;

  return (
    <div ref={ref} className="pt-pilha" style={{ height: `${altura}px` }} role="img" aria-label={rotulo}>
      <span className="pt-eixo" />
      {etiquetas.map((e) => (
        <span key={`f-${e.sigla}`} className="pt-fio" style={{ left: `${e.x}px`, top: `${topo(e.linha) + 18}px` }} />
      ))}
      <span className="pt-vline" style={{ left: `${naRegua(voce)}%` }} />
      {etiquetas.map((e) => {
        const perto = destaque.has(e.sigla) ? " pt-perto" : "";
        return (
          <span key={e.sigla}>
            <span className={`pt-pino${perto}`} style={{ left: `${e.x}px` }} />
            <span className={`pt-sigla${perto}`} style={{ left: `${e.centro}px`, top: `${topo(e.linha)}px` }}>
              {e.sigla}
            </span>
          </span>
        );
      })}
    </div>
  );
}
