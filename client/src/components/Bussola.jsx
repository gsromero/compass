import { useEffect, useId, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { numSinal } from "../lib/i18n.js";
import { TRADICOES } from "../lib/tradicoes.js";
import { lugarDaEtiqueta } from "../lib/compass.js";

// Coordenadas do desenho (viewBox). O quadrado do grafico fica entre as
// margens; a esquerda e embaixo sobra espaco para os numeros da escala.
const LARGURA = 400;
const M_ESQ = 46;
const M_DIR = 30;
const M_TOPO = 16;
const M_BAIXO = 32;
const LADO = LARGURA - M_ESQ - M_DIR;
const ALTURA = M_TOPO + LADO + M_BAIXO;
const X = (v) => M_ESQ + ((v + 10) / 20) * LADO;
const Y = (v) => M_TOPO + ((10 - v) / 20) * LADO;
const CX = X(0);
const CY = Y(0);
const ESCALA = [-10, -5, 0, 5, 10];
const GRADE = [-7.5, -5, -2.5, 2.5, 5, 7.5];

// Os quatro quadrantes, cada um com o canto de FORA (onde a cor e mais forte).
const QUADRANTES = [
  { id: "igualdade-autoridade", x: -10, y: 10 },
  { id: "mercado-autoridade", x: 10, y: 10 },
  { id: "igualdade-liberdade", x: -10, y: -10 },
  { id: "mercado-liberdade", x: 10, y: -10 },
];

// De que lado do ponto vai o nome de cada tradicao, para os nomes nao se
// atropelarem nem cairem em cima das etiquetas dos polos. Conferido no desenho.
const LADO_DO_NOME = {
  "social-democracia": "dir",
  "socialismo-democratico": "baixo",
  "socialismo-libertario": "dir",
  "socialismo-de-estado": "dir",
  "liberalismo-classico": "esq",
  libertarianismo: "esq",
  ordoliberalismo: "dir",
  conservadorismo: "cima",
  "democracia-crista": "dir",
  "nacional-desenvolvimentismo": "baixo",
  "ecologismo-politico": "baixo",
  "populismo-autoritario": "dir",
};

/**
 * A bussola: quadrantes, escala, a mancha de quem ja respondeu, e a sua posicao
 * como ELIPSE, nao como ponto. A elipse e a margem de erro, e ela existe
 * porque um ponto com duas casas decimais promete uma precisao que nenhum
 * questionario de 48 perguntas tem.
 *
 * Os quatro nomes de polo ficam DENTRO do grafico, na ponta de cada eixo, e
 * deitados na horizontal: deitados de lado, as setas de Esquerda e Direita
 * apontavam para baixo e para cima.
 *
 * A cor de cada quadrante e mais clara perto do centro e mais forte na borda
 * de fora, igual nos quatro: e o desenho dizendo que longe do centro e posicao
 * mais forte, sem dizer que um lado e melhor. O quadrante da pessoa so fica um
 * pouco mais forte que os outros (ver DESIGN-SYSTEM.md).
 *
 * As tradicoes sao opcionais e comecam DESLIGADAS: no grafico elas so tem os
 * dois eixos, e a proximidade de verdade e medida nos seis.
 */
export default function Bussola({
  resultado,
  quadrante,
  populacao = null,
  proximas = [],
  etiqueta = null,
}) {
  const { t, lang, pick } = useLang();
  const id = useId();
  const [comTradicoes, setComTradicoes] = useState(false);
  // O ponto sai do centro e desliza ate a posicao ao abrir. Sob
  // prefers-reduced-motion a transicao e zerada pelo CSS global.
  const [chegou, setChegou] = useState(false);
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setChegou(true));
    return () => cancelAnimationFrame(quadro);
  }, []);

  const econ = resultado.economico.posicao;
  const aut = resultado.autoridade.posicao;
  const vx = X(econ);
  const vy = Y(aut);
  const rx = (resultado.economico.margem / 20) * LADO;
  const ry = (resultado.autoridade.margem / 20) * LADO;
  const celulas = populacao?.celulas ?? [];
  const topo = new Set(proximas.map((p) => p.tradicao.id));

  // Etiqueta "Voce": em cima e a esquerda da margem de erro, e vira para o
  // outro lado quando nao cabe. A conta usa a margem de verdade: com margem
  // grande e ponto alto, "em cima" saia para fora do desenho.
  // Mesma regra do card (lib/shareCard.js): a primeira das quatro posicoes em
  // volta da margem que nao encosta nos nomes dos polos.
  const larguraEtiqueta = (etiqueta ?? t("bus_voce")).length * 6.4 + 20;
  const pilulas = [
    caixaPilula(CX, Y(10) + 30, `↑ ${t("polo_autoridade")}`, "meio"),
    caixaPilula(CX, Y(-10) - 24, `↓ ${t("polo_liberdade")}`, "meio"),
    caixaPilula(X(-10) + 6, CY + 4, `← ${t("polo_igualdade")}`, "inicio"),
    caixaPilula(X(10) - 6, CY + 4, `${t("polo_mercado")} →`, "fim"),
  ];
  const { x: voceX, y: voceY } = lugarDaEtiqueta({
    vx, vy, rx, ry, largura: larguraEtiqueta, altura: 20, folga: 6,
    limites: { x0: X(-10), y0: Y(10), x1: X(10), y1: Y(-10) }, ocupados: pilulas,
  });

  // Os numeros da escala somem onde a etiqueta com o seu valor aparece.
  const longe = (a, b) => Math.abs(a - b) > 26;

  return (
    <figure className="bussola-cartao">
      <svg
        className="bussola"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-label={`${t("eixo_economico")} ${numSinal(lang, econ)}, ${t(
          "eixo_autoridade",
        )} ${numSinal(lang, aut)}`}
      >
        <defs>
          {QUADRANTES.map((q) => (
            <linearGradient
              key={q.id}
              id={`${id}-${q.id}`}
              gradientUnits="userSpaceOnUse"
              x1={CX}
              y1={CY}
              x2={X(q.x)}
              y2={Y(q.y)}
            >
              <stop
                offset="0"
                style={{ stopColor: `var(--q-${q.id})`, stopOpacity: q.id === quadrante ? 0.12 : 0.08 }}
              />
              <stop
                offset="1"
                style={{ stopColor: `var(--q-${q.id})`, stopOpacity: q.id === quadrante ? 0.56 : 0.46 }}
              />
            </linearGradient>
          ))}
          <filter id={`${id}-borrao`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <clipPath id={`${id}-recorte`}>
            <rect x={X(-10)} y={Y(10)} width={LADO} height={LADO} rx="6" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}-recorte)`}>
          {QUADRANTES.map((q) => (
            <rect
              key={q.id}
              x={Math.min(CX, X(q.x))}
              y={Math.min(CY, Y(q.y))}
              width={LADO / 2}
              height={LADO / 2}
              fill={`url(#${id}-${q.id})`}
            />
          ))}

          {celulas.length > 0 && (
            <g filter={`url(#${id}-borrao)`}>
              {celulas.map((c, i) => (
                <rect
                  key={i}
                  x={X(c.economico - 1)}
                  y={Y(c.autoridade + 1)}
                  width={LADO / 10}
                  height={LADO / 10}
                  fill="var(--populacao)"
                  opacity={0.1 + c.densidade * 0.4}
                />
              ))}
            </g>
          )}

          {GRADE.map((v) => (
            <g key={v} stroke="var(--panel)" strokeOpacity="0.55" strokeWidth="1">
              <line x1={X(v)} y1={Y(10)} x2={X(v)} y2={Y(-10)} />
              <line x1={X(-10)} y1={Y(v)} x2={X(10)} y2={Y(v)} />
            </g>
          ))}
        </g>

        <line x1={CX} y1={Y(10)} x2={CX} y2={Y(-10)} stroke="var(--line-forte)" strokeWidth="1.4" />
        <line x1={X(-10)} y1={CY} x2={X(10)} y2={CY} stroke="var(--line-forte)" strokeWidth="1.4" />
        <rect
          x={X(-10)}
          y={Y(10)}
          width={LADO}
          height={LADO}
          rx="6"
          fill="none"
          stroke="var(--line-forte)"
          strokeWidth="1.2"
        />

        {/* Nome de cada quadrante, no canto de fora. */}
        <g fontSize="8.6" fontWeight="650" letterSpacing="0.4" fill="var(--ink-mid)">
          <text x={X(-10) + 8} y={Y(10) + 15}>
            {t("quadrante_igualdade_autoridade").toLocaleUpperCase(lang)}
          </text>
          <text x={X(10) - 8} y={Y(10) + 15} textAnchor="end">
            {t("quadrante_mercado_autoridade").toLocaleUpperCase(lang)}
          </text>
          <text x={X(-10) + 8} y={Y(-10) - 8}>
            {t("quadrante_igualdade_liberdade").toLocaleUpperCase(lang)}
          </text>
          <text x={X(10) - 8} y={Y(-10) - 8} textAnchor="end">
            {t("quadrante_mercado_liberdade").toLocaleUpperCase(lang)}
          </text>
        </g>

        {/* Escala: marcas e numeros na base e na lateral esquerda. */}
        <g fontSize="10" fill="var(--ink-dim)">
          {ESCALA.map((v) => (
            <g key={v}>
              <line x1={X(v)} y1={Y(-10)} x2={X(v)} y2={Y(-10) + 5} stroke="var(--line-forte)" />
              <line x1={X(-10) - 5} y1={Y(v)} x2={X(-10)} y2={Y(v)} stroke="var(--line-forte)" />
              {longe(X(v), vx) && (
                <text x={X(v)} y={Y(-10) + 18} textAnchor="middle">
                  {v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0"}
                </text>
              )}
              {longe(Y(v), vy) && (
                <text x={X(-10) - 9} y={Y(v) + 3.5} textAnchor="end">
                  {v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0"}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* Os quatro polos, dentro do grafico, na ponta de cada eixo. */}
        <Pilula x={CX} y={Y(10) + 30} texto={`↑ ${t("polo_autoridade")}`} ancora="meio" />
        <Pilula x={CX} y={Y(-10) - 24} texto={`↓ ${t("polo_liberdade")}`} ancora="meio" />
        <Pilula x={X(-10) + 6} y={CY + 4} texto={`← ${t("polo_igualdade")}`} ancora="inicio" />
        <Pilula x={X(10) - 6} y={CY + 4} texto={`${t("polo_mercado")} →`} ancora="fim" />

        {comTradicoes &&
          TRADICOES.map((tr) => {
            const destaque = topo.has(tr.id);
            const tx = X(tr.eixos.economico ?? 0);
            const ty = Y(tr.eixos.autoridade ?? 0);
            const lado = LADO_DO_NOME[tr.id] ?? "dir";
            const pos = {
              dir: { x: tx + 8, y: ty + 3.5, a: "start" },
              esq: { x: tx - 8, y: ty + 3.5, a: "end" },
              cima: { x: tx, y: ty - 9, a: "middle" },
              baixo: { x: tx, y: ty + 16, a: "middle" },
            }[lado];
            return (
              <g key={tr.id}>
                <circle
                  cx={tx}
                  cy={ty}
                  r={destaque ? 4.5 : 3.6}
                  fill="var(--panel)"
                  stroke={destaque ? "var(--ink)" : "var(--ink-mid)"}
                  strokeOpacity={destaque ? 1 : 0.6}
                  strokeWidth={destaque ? 1.8 : 1.2}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.a}
                  fontSize={destaque ? 10 : 8.6}
                  fontWeight={destaque ? 700 : 500}
                  fill={destaque ? "var(--ink)" : "var(--ink-mid)"}
                  fillOpacity={destaque ? 1 : 0.8}
                  // Contorno da cor do painel: o nome continua legivel por cima
                  // das cores, da grade e das etiquetas dos polos.
                  stroke="var(--panel)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {pick(tr.nome)}
                </text>
              </g>
            );
          })}

        {/* Voce: linhas-guia ate os eixos, os seus valores nas bordas, a margem
            de erro e o ponto. Tudo num grupo so, que desliza do centro. */}
        <g
          className="bussola-voce"
          style={{ transform: chegou ? "none" : `translate(${CX - vx}px, ${CY - vy}px)` }}
        >
          <line
            x1={vx}
            y1={vy}
            x2={vx}
            y2={Y(-10)}
            stroke="var(--ink)"
            strokeOpacity="0.4"
            strokeWidth="1.1"
            strokeDasharray="3 4"
          />
          <line
            x1={vx}
            y1={vy}
            x2={X(-10)}
            y2={vy}
            stroke="var(--ink)"
            strokeOpacity="0.4"
            strokeWidth="1.1"
            strokeDasharray="3 4"
          />
          <ValorNaBorda x={vx} y={Y(-10) + 14} texto={numSinal(lang, econ)} />
          <ValorNaBorda x={X(-10) - 22} y={vy} texto={numSinal(lang, aut)} />
          <circle cx={vx} cy={vy} r={Math.max(rx, ry) + 10} fill="var(--voce)" fillOpacity="0.07" />
          <ellipse
            cx={vx}
            cy={vy}
            rx={Math.max(rx, 3)}
            ry={Math.max(ry, 3)}
            fill="none"
            stroke="var(--voce)"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <circle cx={vx} cy={vy} r="7.5" fill="var(--voce)" stroke="var(--panel)" strokeWidth="3" />
          <g>
            <rect x={voceX} y={voceY} width={larguraEtiqueta} height="20" rx="10" fill="var(--ink)" />
            <text
              x={voceX + larguraEtiqueta / 2}
              y={voceY + 14}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="var(--bg)"
            >
              {etiqueta ?? t("bus_voce")}
            </text>
          </g>
        </g>
      </svg>

      <figcaption className="bussola-legenda">
        <span className="bussola-legenda-item">
          <svg width="18" height="12" aria-hidden="true">
            <ellipse
              cx="9"
              cy="6"
              rx="7"
              ry="4.5"
              fill="none"
              stroke="var(--ink)"
              strokeOpacity="0.7"
              strokeWidth="1.4"
              strokeDasharray="3 2"
            />
          </svg>
          {t("bus_margem")}
        </span>
        {celulas.length > 0 && (
          <span className="bussola-legenda-item">
            <span className="grafico-amostra" aria-hidden="true" />
            {t("bus_populacao")}
          </span>
        )}
        {comTradicoes && (
          <span className="bussola-legenda-item">
            <svg width="12" height="12" aria-hidden="true">
              <circle cx="6" cy="6" r="4.4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            </svg>
            {t("bus_tradicoes_legenda")}
          </span>
        )}
      </figcaption>

      <div className="bussola-chave">
        <span id={`${id}-rotulo`}>{t("bus_tradicoes")}</span>
        <button
          type="button"
          role="switch"
          className="chave"
          aria-checked={comTradicoes}
          aria-labelledby={`${id}-rotulo`}
          onClick={() => setComTradicoes((v) => !v)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      {comTradicoes && <p className="bussola-aviso">{t("bus_tradicoes_aviso")}</p>}
    </figure>
  );
}

/** O retangulo que uma pilula de polo ocupa (mesma conta do desenho). */
function caixaPilula(x, y, texto, ancora) {
  const largura = texto.length * 6.6 + 16;
  const x0 = ancora === "inicio" ? x : ancora === "fim" ? x - largura : x - largura / 2;
  return { x: x0, y: y - 13, w: largura, h: 19 };
}

/** Nome de polo com fundo, para ler por cima das cores. */
function Pilula({ x, y, texto, ancora }) {
  const { x: x0, w: largura } = caixaPilula(x, y, texto, ancora);
  return (
    <g>
      <rect x={x0} y={y - 13} width={largura} height="19" rx="9.5" fill="var(--panel)" fillOpacity="0.92" />
      <text
        x={x0 + largura / 2}
        y={y}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="700"
        fill="var(--ink)"
      >
        {texto}
      </text>
    </g>
  );
}

/** O seu valor num eixo, destacado na borda do grafico. */
function ValorNaBorda({ x, y, texto }) {
  const largura = texto.length * 6.4 + 12;
  return (
    <g>
      <rect x={x - largura / 2} y={y - 9} width={largura} height="18" rx="9" fill="var(--ink)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--bg)">
        {texto}
      </text>
    </g>
  );
}

