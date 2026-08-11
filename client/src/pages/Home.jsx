import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { carregar, limpar, quantasRespondidas } from "../lib/sessao.js";

const MODOS_ORDEM = ["rapido", "padrao", "completo"];

export default function Home() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [modo, setModo] = useState("padrao");
  const [emAndamento] = useState(() => carregar());

  const respondidas = quantasRespondidas(emAndamento);
  const temTeste = emAndamento && respondidas > 0;

  function recomecar() {
    limpar();
    navigate("/teste", { state: { modo } });
  }

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "48px 64px" }}>
      <div className="pilha">
        <h1 style={{ fontSize: "clamp(30px, 6vw, 44px)", textWrap: "balance" }}>
          {t("home_titulo")}
        </h1>
        <p className="apoio" style={{ fontSize: "17px", maxWidth: "34rem" }}>
          {t("home_intro")}
        </p>
      </div>

      <div className="grade grade-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="cartao pilha" style={{ gap: "6px" }}>
            <strong style={{ fontSize: "15.5px" }}>{t(`home_diferenca_${n}_titulo`)}</strong>
            <p className="apoio">{t(`home_diferenca_${n}`)}</p>
          </div>
        ))}
      </div>

      <div className="pilha">
        <span className="rotulo">{t("home_escolha_modo")}</span>
        <div className="escala">
          {MODOS_ORDEM.map((chave) => (
            <button
              key={chave}
              type="button"
              className="opcao"
              aria-pressed={modo === chave}
              onClick={() => setModo(chave)}
            >
              <span className="pilha" style={{ gap: "1px" }}>
                <strong>{t(`modo_${chave}`)}</strong>
                <span className="apoio" style={{ fontSize: "13.5px" }}>
                  {t(`modo_${chave}_desc`)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {temTeste ? (
        <div className="pilha">
          <p className="apoio">{t("home_tem_teste", respondidas)}</p>
          <div className="linha">
            <button
              type="button"
              className="botao"
              onClick={() => navigate("/teste", { state: { retomar: true } })}
            >
              {t("home_retomar")}
            </button>
            <button type="button" className="botao botao-secundario" onClick={recomecar}>
              {t("home_recomecar")}
            </button>
          </div>
        </div>
      ) : (
        <div className="linha">
          <button
            type="button"
            className="botao"
            onClick={() => navigate("/teste", { state: { modo } })}
          >
            {t("home_comecar")}
          </button>
          <span className="apoio" style={{ fontSize: "13.5px" }}>
            {t(`modo_${modo}_desc`)}
          </span>
        </div>
      )}

      <p className="apoio" style={{ fontSize: "13.5px" }}>
        {t("rodape_privacidade")}
      </p>
    </main>
  );
}
