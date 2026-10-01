import { useEffect, useId, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { LAYOUTS } from "../lib/shareCard.js";

// Quem fica de cada lado do escolhido no leque, na ordem de LAYOUTS.
function posicoes(escolhido) {
  const outros = LAYOUTS.filter((nome) => nome !== escolhido);
  return { [escolhido]: "centro", [outros[0]]: "esq", [outros[1]]: "dir" };
}

/**
 * A vitrine do card de compartilhar: os tres formatos em leque (o escolhido na
 * frente, os outros inclinados atras), e ao lado o cabecalho, a escolha de
 * formato, a chave da tradicao e as acoes (`children`).
 *
 * As imagens sao o PROPRIO card (o mesmo Canvas que vai ser compartilhado),
 * geradas depois da primeira pintura da pagina para nao atrasar o resultado.
 *
 * A chave da tradicao fica sempre no lugar, apagada fora do Story: se ela
 * aparecesse e sumisse, a secao mudaria de altura a cada troca de formato.
 * Comeca desligada: um nome de tradicao num card publico pode expor mais do
 * que a pessoa quer.
 *
 * @param {(layout: string, comTradicao: boolean) => HTMLCanvasElement} gerar
 */
export default function VitrineCards({
  gerar,
  layout,
  setLayout,
  comTradicao,
  setComTradicao,
  chave,
  cabecalho,
  children,
}) {
  const { t } = useLang();
  const id = useId();
  const [imagens, setImagens] = useState({});

  useEffect(() => {
    let vivo = true;
    const espera = setTimeout(() => {
      const novas = {};
      for (const nome of LAYOUTS) {
        try {
          novas[nome] = gerar(nome, nome === "story" && comTradicao).toDataURL("image/png");
        } catch {
          /* sem canvas: os botoes de compartilhar continuam valendo */
        }
      }
      if (vivo) setImagens(novas);
    }, 120);
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
    // `chave` muda quando o resultado ou o idioma mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, comTradicao]);

  const pos = posicoes(layout);
  const soStory = layout !== "story";

  return (
    <>
      <div className="vitrine-palco">
        {LAYOUTS.map((nome) => (
          <button
            key={nome}
            type="button"
            className={`vitrine-carta vitrine-${nome}`}
            data-pos={pos[nome]}
            aria-label={t(`res_layout_${nome}`)}
            aria-pressed={layout === nome}
            tabIndex={layout === nome ? -1 : 0}
            onClick={() => setLayout(nome)}
          >
            {imagens[nome] ? <img src={imagens[nome]} alt="" /> : <span className="vitrine-vazio" />}
          </button>
        ))}
      </div>

      <div className="vitrine-lado">
        {cabecalho}
        <div className="vitrine-formato" role="group" aria-label={t("res_formato")}>
          {LAYOUTS.map((nome) => (
            <button
              key={nome}
              type="button"
              aria-pressed={layout === nome}
              onClick={() => setLayout(nome)}
            >
              {t(`res_layout_${nome}`)}
              {nome !== "minimo" && <small>{t(`res_layout_${nome}_proporcao`)}</small>}
            </button>
          ))}
        </div>
        <div className="vitrine-chave" data-apagada={soStory || undefined}>
          <button
            type="button"
            role="switch"
            className="chave"
            aria-checked={comTradicao}
            aria-labelledby={`${id}-tradicao`}
            disabled={soStory}
            onClick={() => setComTradicao((v) => !v)}
          >
            <span aria-hidden="true" />
          </button>
          <span id={`${id}-tradicao`}>
            {t("res_incluir_tradicao")} <small>{t("res_tradicao_so_story")}</small>
          </span>
        </div>
        {children}
      </div>
    </>
  );
}
