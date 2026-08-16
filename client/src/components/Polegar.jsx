/**
 * O polegar da resposta: um para "concordo", dois para "concordo muito", e
 * virados para baixo no lado de discordar.
 *
 * Desenhado a mao em SVG, e nao trazido de uma biblioteca de icones: a regra do
 * projeto e nao adicionar dependencia sem necessidade, e sao dois tracos.
 *
 * E DECORATIVO. Quem carrega o significado e o texto ao lado, porque icone
 * sozinho nao e lido por leitor de tela nem entendido por todo mundo do mesmo
 * jeito. Por isso `aria-hidden`.
 */
export default function Polegar({ nota, tamanho = 17 }) {
  if (!nota) return null;
  const paraBaixo = nota < 0;
  const quantos = Math.abs(nota) >= 2 ? 2 : 1;

  return (
    <span className="polegares" aria-hidden="true">
      {Array.from({ length: quantos }, (_, i) => (
        <svg
          key={i}
          width={tamanho}
          height={tamanho}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={paraBaixo ? { transform: "rotate(180deg)" } : undefined}
        >
          <path d="M7 21.5V10l4.6-7.4a2.1 2.1 0 0 1 1.9 2.3L12.9 9h5.5a2 2 0 0 1 2 2.4l-1.6 8a2 2 0 0 1-2 1.6H7Z" />
          <path d="M7 10H4.4a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1H7" />
        </svg>
      ))}
    </span>
  );
}
