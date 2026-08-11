import { linhasDaGrade, paraCoordenada, paraRaios } from "../lib/compass.js";
import { useLang } from "../lib/lang.jsx";

const LADO = 100;
const BORDA = 10;
const FIM = LADO - BORDA;

/**
 * A bussola: quadrantes, grade, mancha de quem ja respondeu, e a sua posicao
 * como ELIPSE, nao como ponto. A elipse e a margem de erro, e ela existe
 * porque um ponto com duas casas decimais promete uma precisao que nenhum
 * questionario de 48 perguntas tem.
 */
export default function Bussola({ resultado, quadrante, populacao = null }) {
  const { t } = useLang();

  const { x, y } = paraCoordenada(
    resultado.economico.posicao,
    resultado.autoridade.posicao,
    LADO,
  );
  const { rx, ry } = paraRaios(
    resultado.economico.margem,
    resultado.autoridade.margem,
    LADO,
  );

  const meio = LADO / 2;
  const quadrantes = [
    { id: "igualdade-autoridade", x: BORDA, y: BORDA },
    { id: "mercado-autoridade", x: meio, y: BORDA },
    { id: "igualdade-liberdade", x: BORDA, y: meio },
    { id: "mercado-liberdade", x: meio, y: meio },
  ];

  return (
    <svg
      className="bussola"
      viewBox={`0 0 ${LADO} ${LADO}`}
      role="img"
      aria-label={`${t("eixo_economico")} ${resultado.economico.posicao.toFixed(1)}, ${t(
        "eixo_autoridade",
      )} ${resultado.autoridade.posicao.toFixed(1)}`}
    >
      {quadrantes.map((q) => (
        <rect
          key={q.id}
          x={q.x}
          y={q.y}
          width={meio - BORDA}
          height={meio - BORDA}
          fill={`var(--q-${q.id})`}
          opacity={quadrante === q.id ? 0.22 : 0.09}
        />
      ))}

      {linhasDaGrade(LADO).map((linha, i) => (
        <g key={i}>
          <line
            x1={linha.pos}
            y1={BORDA}
            x2={linha.pos}
            y2={FIM}
            stroke={linha.central ? "var(--line-forte)" : "var(--line)"}
            strokeWidth={linha.central ? 0.4 : 0.2}
          />
          <line
            x1={BORDA}
            y1={linha.pos}
            x2={FIM}
            y2={linha.pos}
            stroke={linha.central ? "var(--line-forte)" : "var(--line)"}
            strokeWidth={linha.central ? 0.4 : 0.2}
          />
        </g>
      ))}

      {/* Mancha de quem ja respondeu. So aparece com gente suficiente. */}
      {populacao?.celulas?.map((celula, i) => {
        const p = paraCoordenada(celula.economico, celula.autoridade, LADO);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.4}
            fill="var(--populacao)"
            opacity={Math.min(0.5, 0.06 + celula.densidade * 0.44)}
          />
        );
      })}

      <ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        fill="var(--voce)"
        opacity={0.14}
        stroke="var(--voce)"
        strokeWidth={0.3}
        strokeOpacity={0.5}
      />
      <circle cx={x} cy={y} r={1.6} fill="var(--voce)" />

      <g fontSize="3.4" fill="var(--ink-dim)" fontWeight="600">
        <text x={BORDA} y={BORDA - 3}>
          {t("polo_igualdade")}
        </text>
        <text x={FIM} y={BORDA - 3} textAnchor="end">
          {t("polo_mercado")}
        </text>
        <text x={meio} y={BORDA - 3} textAnchor="middle" fill="var(--ink-mid)">
          {t("polo_autoridade")}
        </text>
        <text x={meio} y={FIM + 6} textAnchor="middle" fill="var(--ink-mid)">
          {t("polo_liberdade")}
        </text>
      </g>
    </svg>
  );
}
