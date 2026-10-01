import { useEffect, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { LAYOUTS } from "../lib/shareCard.js";

/**
 * A vitrine do card de compartilhar: o modelo escolhido grande, os outros dois
 * menores dos lados, e os botoes embaixo. Antes a pessoa escolhia o modelo sem
 * ver como ele ficava.
 *
 * As imagens sao o PROPRIO card (o mesmo Canvas que vai ser compartilhado),
 * gerado depois da primeira pintura da pagina para nao atrasar o resultado.
 *
 * @param {(layout: string) => HTMLCanvasElement} gerar monta o card de um modelo
 */
export default function VitrineCards({ gerar, layout, setLayout, chave }) {
  const { t } = useLang();
  const [imagens, setImagens] = useState({});

  useEffect(() => {
    let vivo = true;
    const espera = setTimeout(() => {
      const prontas = {};
      for (const nome of LAYOUTS) {
        try {
          prontas[nome] = gerar(nome).toDataURL("image/png");
        } catch {
          /* sem canvas (navegador muito antigo): os botoes continuam valendo */
        }
      }
      if (vivo) setImagens(prontas);
    }, 300);
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
    // `chave` muda quando o resultado ou o idioma mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const indice = LAYOUTS.indexOf(layout);
  const anterior = LAYOUTS[(indice + LAYOUTS.length - 1) % LAYOUTS.length];
  const proximo = LAYOUTS[(indice + 1) % LAYOUTS.length];

  return (
    <div className="vitrine">
      <div className="vitrine-palco">
        {[anterior, layout, proximo].map((nome, i) => (
          <button
            key={`${nome}-${i}`}
            type="button"
            className={`vitrine-card${i === 1 ? " vitrine-card-atual" : ""}`}
            aria-label={t("res_escolher_card", t(`res_layout_${nome}`))}
            aria-pressed={i === 1}
            tabIndex={i === 1 ? -1 : 0}
            onClick={() => setLayout(nome)}
          >
            {imagens[nome] ? (
              <img src={imagens[nome]} alt="" />
            ) : (
              <span className="vitrine-vazio" />
            )}
          </button>
        ))}
      </div>
      <div className="linha" style={{ justifyContent: "center", gap: "6px" }}>
        {LAYOUTS.map((nome) => (
          <button
            key={nome}
            type="button"
            className="chip"
            aria-pressed={layout === nome}
            onClick={() => setLayout(nome)}
          >
            {t(`res_layout_${nome}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
