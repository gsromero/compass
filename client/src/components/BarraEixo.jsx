import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";

/** Um eixo secundario: posicao, margem e os dois polos nomeados. */
export default function BarraEixo({ eixo, meta, dados }) {
  const { t, lang } = useLang();

  // De -10 a +10 para 0% a 100%.
  const paraPercentual = (valor) => ((valor + 10) / 20) * 100;
  const centro = paraPercentual(dados.posicao);
  const inicio = paraPercentual(Math.max(-10, dados.posicao - dados.margem));
  const fim = paraPercentual(Math.min(10, dados.posicao + dados.margem));

  return (
    <div className="barra-eixo">
      <div className="linha" style={{ justifyContent: "space-between" }}>
        <span className="rotulo">{t(`eixo_${eixo}`)}</span>
        <span className="apoio" style={{ fontSize: "13px" }}>
          {t("res_margem", num(lang, dados.margem, 1))}
        </span>
      </div>
      <div className="barra-trilho">
        <div className="barra-centro" />
        <div className="barra-margem" style={{ left: `${inicio}%`, width: `${fim - inicio}%` }} />
        <div className="barra-ponto" style={{ left: `${centro}%` }} />
      </div>
      <div className="barra-pontas">
        <span>{t(`polo_${meta.neg}`)}</span>
        <span>{t(`polo_${meta.pos}`)}</span>
      </div>
    </div>
  );
}
