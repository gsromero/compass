import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { carregar, limpar, quantasRespondidas } from "../lib/sessao.js";
import BussolaAmostra from "../components/BussolaAmostra.jsx";

const MODOS_ORDEM = ["rapido", "padrao", "completo"];
const AMOSTRA = ["posicao", "eixos", "fontes", "tradicoes"];

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
    <main className="coluna inicio">
      <div className="pilha-larga">
        <div className="pilha">
          <h1 className="inicio-titulo">{t("home_titulo")}</h1>
          <p className="apoio" style={{ fontSize: "17px", maxWidth: "34rem" }}>
            {t("home_intro")}
          </p>
        </div>

        <div className="pilha" style={{ gap: "8px" }}>
          <span className="rotulo">{t("home_escolha_modo")}</span>
          {/* Tres partes numa linha so: antes eram tres cartoes altos, e a
              descricao do modo escolhido ainda se repetia ao lado do botao. */}
          <div className="seletor-modo">
            {MODOS_ORDEM.map((chave) => (
              <button
                key={chave}
                type="button"
                aria-pressed={modo === chave}
                onClick={() => setModo(chave)}
              >
                <strong>{t(`modo_${chave}`)}</strong>
                <span>{t(`modo_${chave}_qtd`)}</span>
                <span>{t(`modo_${chave}_tempo`)}</span>
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
          <button
            type="button"
            className="botao botao-comecar"
            onClick={() => navigate("/teste", { state: { modo } })}
          >
            {t("home_comecar")}
          </button>
        )}
      </div>

      {/* Mostra o que a pessoa recebe no fim, em vez de explicar: os cartoes de
          diferenciais que ficavam aqui sairam em agosto por repetir o Sobre. */}
      <aside className="amostra">
        <BussolaAmostra />
        <div className="pilha" style={{ gap: "8px" }}>
          <span className="rotulo">{t("home_amostra_titulo")}</span>
          <ul>
            {AMOSTRA.map((chave) => (
              <li key={chave}>{t(`home_amostra_${chave}`)}</li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
