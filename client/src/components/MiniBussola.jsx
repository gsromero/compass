/**
 * Bussola pequena do cartao de tradicao: dois pontos, o seu (cheio) e o da
 * tradicao (vazado), ligados por um tracejado. Mostra a proximidade que antes
 * era so texto. So os dois eixos do grafico: o cartao diz isso na legenda.
 */
const QUADRANTES = [
  { id: "igualdade-autoridade", x: 0, y: 0 },
  { id: "mercado-autoridade", x: 1, y: 0 },
  { id: "igualdade-liberdade", x: 0, y: 1 },
  { id: "mercado-liberdade", x: 1, y: 1 },
];

export default function MiniBussola({ voce, tradicao, tamanho = 96 }) {
  const m = 5;
  const lado = tamanho - 2 * m;
  const X = (v) => m + ((v + 10) / 20) * lado;
  const Y = (v) => m + ((10 - v) / 20) * lado;
  return (
    <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`} aria-hidden="true">
      {QUADRANTES.map((q) => (
        <rect
          key={q.id}
          x={m + (q.x * lado) / 2}
          y={m + (q.y * lado) / 2}
          width={lado / 2}
          height={lado / 2}
          fill={`var(--q-${q.id})`}
          opacity="0.24"
        />
      ))}
      <line x1={tamanho / 2} y1={m} x2={tamanho / 2} y2={tamanho - m} stroke="var(--line-forte)" />
      <line x1={m} y1={tamanho / 2} x2={tamanho - m} y2={tamanho / 2} stroke="var(--line-forte)" />
      <rect x={m} y={m} width={lado} height={lado} rx="4" fill="none" stroke="var(--line-forte)" />
      <line
        x1={X(voce.economico)}
        y1={Y(voce.autoridade)}
        x2={X(tradicao.economico)}
        y2={Y(tradicao.autoridade)}
        stroke="var(--ink)"
        strokeOpacity="0.5"
        strokeDasharray="2.5 2.5"
      />
      <circle
        cx={X(tradicao.economico)}
        cy={Y(tradicao.autoridade)}
        r="4.6"
        fill="var(--panel)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <circle
        cx={X(voce.economico)}
        cy={Y(voce.autoridade)}
        r="4.6"
        fill="var(--voce)"
        stroke="var(--panel)"
        strokeWidth="2"
      />
    </svg>
  );
}
