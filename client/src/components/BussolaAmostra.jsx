/**
 * A bussola pequena da pagina inicial: so mostra o que a pessoa recebe no fim.
 *
 * O ponto fica no CENTRO de proposito, como na imagem de previa do link: um
 * ponto de exemplo dentro de um quadrante sugeriria um lado, num site cuja
 * razao de existir e nao sugerir. Os quatro quadrantes com o mesmo peso.
 */
const QUADRANTES = [
  { id: "igualdade-autoridade", x: 6, y: 6 },
  { id: "mercado-autoridade", x: 50, y: 6 },
  { id: "igualdade-liberdade", x: 6, y: 50 },
  { id: "mercado-liberdade", x: 50, y: 50 },
];

export default function BussolaAmostra({ tamanho = 104 }) {
  return (
    <svg
      className="bussola-amostra"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {QUADRANTES.map((q) => (
        <rect
          key={q.id}
          x={q.x}
          y={q.y}
          width="44"
          height="44"
          fill={`var(--q-${q.id})`}
          opacity="0.24"
        />
      ))}
      <line x1="50" y1="6" x2="50" y2="94" stroke="var(--line-forte)" strokeWidth="0.8" />
      <line x1="6" y1="50" x2="94" y2="50" stroke="var(--line-forte)" strokeWidth="0.8" />
      <ellipse
        cx="50"
        cy="50"
        rx="13"
        ry="9"
        fill="none"
        stroke="var(--ink-mid)"
        strokeWidth="0.8"
        strokeDasharray="2.5 2.5"
      />
      <circle cx="50" cy="50" r="4.5" fill="var(--voce)" stroke="var(--panel)" strokeWidth="1.6" />
    </svg>
  );
}
