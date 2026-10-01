import { useId, useState } from "react";
import { useLang } from "../lib/lang.jsx";

/**
 * Cabecalho de secao do resultado: rotulo pequeno, titulo e uma frase curta.
 * Os paragrafos explicativos longos (que deixavam a pagina cinza de texto)
 * ficam atras do "?", e so abrem para quem quiser.
 */
export default function CabecalhoSecao({ rotulo, titulo, intro = null, ajuda = [] }) {
  const { t } = useLang();
  const id = useId();
  const [aberta, setAberta] = useState(false);

  return (
    <div className="cabecalho-secao">
      <span className="rotulo">{rotulo}</span>
      <div className="cabecalho-secao-titulo">
        <h2>{titulo}</h2>
        {ajuda.length > 0 && (
          <button
            type="button"
            className="botao-ajuda"
            aria-expanded={aberta}
            aria-controls={`${id}-ajuda`}
            aria-label={t("sec_ajuda")}
            title={t("sec_ajuda")}
            onClick={() => setAberta((v) => !v)}
          >
            ?
          </button>
        )}
      </div>
      {intro && <p className="apoio">{intro}</p>}
      {aberta && (
        <div id={`${id}-ajuda`} className="ajuda pilha" style={{ gap: "8px" }}>
          {ajuda.map((texto) => (
            <p key={texto}>{texto}</p>
          ))}
        </div>
      )}
    </div>
  );
}
