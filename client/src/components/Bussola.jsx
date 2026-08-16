import { useId } from "react";
import { linhasDaGrade, paraCoordenada, paraRaios } from "../lib/compass.js";
import { useLang } from "../lib/lang.jsx";

const LADO = 100;
const BORDA = 11;
const FIM = LADO - BORDA;
const AREA = FIM - BORDA;
// Um passo do eixo (de -10 a +10) em unidades do desenho.
const POR_UNIDADE = AREA / 20;

/**
 * A bussola: quadrantes, grade, a mancha de quem ja respondeu e a sua posicao
 * como ELIPSE, nao como ponto. A elipse e a margem de erro, e ela existe
 * porque um ponto com duas casas decimais promete uma precisao que nenhum
 * questionario de 48 perguntas tem.
 *
 * A mancha da populacao e desenhada como celulas BORRADAS, e nao como um ponto
 * por celula. Com pontos soltos o grafico parecia ter defeito: bolinha
 * espalhada nao se le como densidade, se le como sujeira. Borrada, a mesma
 * informacao vira uma nuvem, que e o que ela e.
 */
export default function Bussola({ resultado, quadrante, populacao = null }) {
  const { t } = useLang();
  const id = useId();
  const borrao = `borrao-${id}`;
  const recorte = `recorte-${id}`;

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
  const metade = meio - BORDA;
  const quadrantes = [
    { id: "igualdade-autoridade", x: BORDA, y: BORDA },
    { id: "mercado-autoridade", x: meio, y: BORDA },
    { id: "igualdade-liberdade", x: BORDA, y: meio },
    { id: "mercado-liberdade", x: meio, y: meio },
  ];

  const celulas = populacao?.celulas ?? [];
  const lado = 2 * POR_UNIDADE;

  return (
    <figure className="grafico">
      <svg
        className="bussola"
        viewBox={`0 0 ${LADO} ${LADO}`}
        role="img"
        aria-label={`${t("eixo_economico")} ${resultado.economico.posicao.toFixed(1)}, ${t(
          "eixo_autoridade",
        )} ${resultado.autoridade.posicao.toFixed(1)}`}
      >
        <defs>
          <filter id={borrao} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation={lado * 0.38} />
          </filter>
          <clipPath id={recorte}>
            <rect x={BORDA} y={BORDA} width={AREA} height={AREA} rx="1" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${recorte})`}>
          {quadrantes.map((q) => (
            <rect
              key={q.id}
              x={q.x}
              y={q.y}
              width={metade}
              height={metade}
              fill={`var(--q-${q.id})`}
              opacity={quadrante === q.id ? 0.34 : 0.24}
            />
          ))}

          {celulas.length > 0 && (
            <g filter={`url(#${borrao})`}>
              {celulas.map((celula, i) => {
                const p = paraCoordenada(celula.economico, celula.autoridade, LADO);
                return (
                  <rect
                    key={i}
                    x={p.x - lado / 2}
                    y={p.y - lado / 2}
                    width={lado}
                    height={lado}
                    fill="var(--populacao)"
                    opacity={0.12 + celula.densidade * 0.42}
                  />
                );
              })}
            </g>
          )}

          {linhasDaGrade(LADO).map((linha, i) =>
            linha.central ? null : (
              <g key={i}>
                <line
                  x1={linha.pos}
                  y1={BORDA}
                  x2={linha.pos}
                  y2={FIM}
                  stroke="var(--line)"
                  strokeWidth="0.25"
                />
                <line
                  x1={BORDA}
                  y1={linha.pos}
                  x2={FIM}
                  y2={linha.pos}
                  stroke="var(--line)"
                  strokeWidth="0.25"
                />
              </g>
            ),
          )}

          <line x1={meio} y1={BORDA} x2={meio} y2={FIM} stroke="var(--line-forte)" strokeWidth="0.4" />
          <line x1={BORDA} y1={meio} x2={FIM} y2={meio} stroke="var(--line-forte)" strokeWidth="0.4" />
        </g>

        <rect
          x={BORDA}
          y={BORDA}
          width={AREA}
          height={AREA}
          rx="1"
          fill="none"
          stroke="var(--line-forte)"
          strokeWidth="0.35"
        />

        <ellipse
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="var(--voce)"
          strokeWidth="0.45"
          strokeOpacity="0.55"
          strokeDasharray="1.8 1.4"
        />
        {/* Anel do fundo para o ponto nao sumir por cima da mancha. */}
        <circle cx={x} cy={y} r="2.1" fill="var(--panel)" />
        <circle cx={x} cy={y} r="1.5" fill="var(--voce)" />

        {/* Cada rotulo fica na ponta do SEU eixo: os do economico deitados nas
            laterais, os da autoridade em cima e embaixo. Com os quatro na linha
            de cima nao dava para saber qual pertence a qual eixo. */}
        <g fontSize="3.2" fill="var(--ink-mid)" fontWeight="600">
          <text x={meio} y={BORDA - 3.5} textAnchor="middle">
            {t("polo_autoridade")}
          </text>
          <text x={meio} y={FIM + 6} textAnchor="middle">
            {t("polo_liberdade")}
          </text>
          <text
            x={BORDA - 4.5}
            y={meio}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(-90 ${BORDA - 4.5} ${meio})`}
          >
            {t("polo_igualdade")}
          </text>
          <text
            x={FIM + 4.5}
            y={meio}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(90 ${FIM + 4.5} ${meio})`}
          >
            {t("polo_mercado")}
          </text>
        </g>
      </svg>

      {celulas.length > 0 && (
        <figcaption className="grafico-legenda">
          <span className="grafico-amostra" aria-hidden="true" />
          {t("res_mancha")}
        </figcaption>
      )}
    </figure>
  );
}
