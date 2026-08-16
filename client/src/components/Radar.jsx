import { useLang } from "../lib/lang.jsx";
import { EIXOS_META } from "../lib/questions.js";
import { EIXOS } from "../lib/scoring.js";
import { ANEIS, DIRECAO, PASSO, petala, petalasDoResultado, polar } from "../lib/perfil.js";

const LARGURA = 134;
const ALTURA = 126;
const CX = LARGURA / 2;
const CY = ALTURA / 2;
const RAIO = 34;

/**
 * O perfil nos seis eixos: uma petala por eixo, apontando para o polo em que a
 * pessoa pende, do tamanho da conviccao. A geometria e o porque de ser assim
 * moram em lib/perfil.js, que o card social tambem usa.
 *
 * A petala clara por baixo e a margem de erro. Quando ela aparece TAMBEM do
 * lado oposto, esta dizendo o que a elipse da bussola nao conseguia: nem de
 * que lado desse eixo a pessoa esta ficou definido.
 */
export default function Radar({ resultado }) {
  const { t } = useLang();

  const petalas = petalasDoResultado(resultado);
  const pontos = (indice, fracao) =>
    petala(CX, CY, RAIO, indice, fracao)
      .map((p) => `${p.x},${p.y}`)
      .join(" ");

  return (
    <figure className="grafico">
      <svg
        className="bussola"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-label={EIXOS.map(
          (eixo) => `${t(`eixo_${eixo}`)} ${resultado[eixo].posicao.toFixed(1)}`,
        ).join(", ")}
      >
        {ANEIS.map((anel) => (
          <circle
            key={anel}
            cx={CX}
            cy={CY}
            r={RAIO * anel}
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.25"
            strokeDasharray={anel === 1 ? "none" : "1 1.2"}
          />
        ))}

        {Object.values(DIRECAO).map((indice) => {
          const fim = polar(CX, CY, RAIO, indice * PASSO, 1);
          return (
            <line
              key={indice}
              x1={CX}
              y1={CY}
              x2={fim.x}
              y2={fim.y}
              stroke="var(--line)"
              strokeWidth="0.22"
            />
          );
        })}

        {petalas.map((p) => (
          <g key={p.eixo}>
            <polygon points={pontos(p.indice, p.limite)} fill="var(--voce)" opacity="0.13" />
            {p.vazamento > 0 && (
              <polygon
                points={pontos(p.indiceOposto, p.vazamento)}
                fill="var(--voce)"
                opacity="0.13"
              />
            )}
            <polygon
              points={pontos(p.indice, p.forca)}
              fill="var(--voce)"
              opacity="0.34"
              stroke="var(--voce)"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </g>
        ))}

        <circle cx={CX} cy={CY} r="0.9" fill="var(--ink-dim)" />

        <g fontSize="2.9" fontWeight="600">
          {Object.entries(DIRECAO).map(([chave, indice]) => {
            const [eixo, lado] = chave.split(":");
            const dono = petalas.find((p) => p.eixo === eixo);
            const ativo = dono.indice === indice && dono.forca > 0.02;
            const p = polar(CX, CY, RAIO, indice * PASSO, 1.13);
            const cos = Math.cos((indice * PASSO - 90) * (Math.PI / 180));
            return (
              <text
                key={chave}
                x={p.x}
                y={p.y}
                textAnchor={cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle"}
                dominantBaseline="central"
                fill={ativo ? "var(--ink)" : "var(--ink-dim)"}
                opacity={ativo ? 1 : 0.5}
              >
                {t(`polo_${EIXOS_META[eixo][lado]}`)}
              </text>
            );
          })}
        </g>
      </svg>

      <figcaption className="grafico-legenda">
        <span className="grafico-amostra grafico-amostra-voce" aria-hidden="true" />
        {t("res_perfil_legenda")}
      </figcaption>
    </figure>
  );
}
