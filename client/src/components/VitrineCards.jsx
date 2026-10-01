import { useEffect, useId, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { LAYOUTS } from "../lib/shareCard.js";

/**
 * A previa do card de compartilhar: o formato escolhido, a escolha entre
 * Quadrado, Story e Minimo, e a chave da tradicao (so no Story, e desligada:
 * um nome de tradicao num card publico pode expor mais do que a pessoa quer).
 *
 * A imagem e o PROPRIO card (o mesmo Canvas que vai ser compartilhado), gerado
 * depois da primeira pintura da pagina para nao atrasar o resultado.
 *
 * @param {(layout: string, comTradicao: boolean) => HTMLCanvasElement} gerar
 */
export default function VitrineCards({ gerar, layout, setLayout, comTradicao, setComTradicao, chave }) {
  const { t } = useLang();
  const id = useId();
  const [imagem, setImagem] = useState(null);

  useEffect(() => {
    let vivo = true;
    const espera = setTimeout(() => {
      try {
        const url = gerar(layout, comTradicao).toDataURL("image/png");
        if (vivo) setImagem(url);
      } catch {
        /* sem canvas: os botoes de compartilhar continuam valendo */
      }
    }, 120);
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
    // `chave` muda quando o resultado ou o idioma mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, layout, comTradicao]);

  return (
    <div className="vitrine">
      <div className={`vitrine-previa vitrine-${layout}`}>
        {imagem ? <img src={imagem} alt="" /> : <span className="vitrine-vazio" />}
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
      <div className="vitrine-chave">
        <span id={`${id}-tradicao`}>{t("res_incluir_tradicao")}</span>
        <button
          type="button"
          role="switch"
          className="chave"
          aria-checked={comTradicao}
          aria-labelledby={`${id}-tradicao`}
          onClick={() => setComTradicao((v) => !v)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      {comTradicao && layout !== "story" && (
        <p className="apoio" style={{ fontSize: "13px", textAlign: "center" }}>
          {t("res_tradicao_so_story")}
        </p>
      )}
    </div>
  );
}
