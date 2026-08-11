import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { enunciado, perguntasDoIdioma, VERSAO_BANCO } from "../lib/questions.js";
import { IMPORTANCIAS, proximoPar, totalPrevisto } from "../lib/scoring.js";
import { codificar } from "../lib/permalink.js";
import { carregar, limpar, salvar } from "../lib/sessao.js";

const NOTAS = [-2, -1, 0, 1, 2];
const IMPORTANCIA_ORDEM = ["baixa", "normal", "alta"];
const DISTANCIA_SWIPE = 60;

export default function Teste() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { state } = useLocation();

  const perguntas = useMemo(() => perguntasDoIdioma(lang), [lang]);

  const [modo, setModo] = useState("padrao");
  const [respostas, setRespostas] = useState({});
  const [historico, setHistorico] = useState([]);
  const [posicao, setPosicao] = useState(0);
  const [importancia, setImportancia] = useState("normal");
  const [pronto, setPronto] = useState(false);

  // Retoma o teste guardado ou comeca um novo. Roda uma vez.
  useEffect(() => {
    const guardada = state?.retomar ? carregar() : null;
    if (guardada) {
      const modoGuardado = guardada.modo ?? "padrao";
      const respostasGuardadas = guardada.respostas ?? {};
      let historicoGuardado = guardada.historico ?? [];
      let alvo = historicoGuardado.findIndex((id) => !respostasGuardadas[id]);

      // Parou logo depois de responder a ultima da fila: a proxima pergunta
      // ainda nao existe, e sem isto a tela ficaria presa em "carregando".
      if (alvo === -1) {
        const proximo = proximoPar(perguntas, respostasGuardadas, modoGuardado);
        const novos = (proximo?.perguntas ?? [])
          .map((p) => p.id)
          .filter((id) => !historicoGuardado.includes(id));
        alvo = historicoGuardado.length;
        historicoGuardado = [...historicoGuardado, ...novos];
      }

      setModo(modoGuardado);
      setRespostas(respostasGuardadas);
      setHistorico(historicoGuardado);
      setPosicao(Math.max(0, Math.min(alvo, historicoGuardado.length - 1)));
      setImportancia(nomeDaImportancia(respostasGuardadas[historicoGuardado[alvo]]?.m));
    } else {
      limpar();
      const escolhido = state?.modo ?? "padrao";
      setModo(escolhido);
      const primeiro = proximoPar(perguntas, {}, escolhido);
      setHistorico(primeiro ? primeiro.perguntas.map((p) => p.id) : []);
    }
    setPronto(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva a cada mudanca: fechar o navegador no meio nao pode custar o teste.
  useEffect(() => {
    if (!pronto) return;
    salvar({ modo, respostas, historico });
  }, [pronto, modo, respostas, historico]);

  const idAtual = historico[posicao];
  const perguntaAtual = perguntas.find((p) => p.id === idAtual);
  const respondidas = Object.keys(respostas).length;
  const total = totalPrevisto(perguntas, modo);

  const terminar = useCallback(
    (finais) => {
      limpar();
      navigate(`/resultado/${codificar(perguntas, finais, VERSAO_BANCO)}`, { replace: true });
    },
    [navigate, perguntas],
  );

  const responder = useCallback(
    (nota) => {
      if (!idAtual) return;
      const finais = { ...respostas, [idAtual]: { r: nota, m: IMPORTANCIAS[importancia] } };
      setRespostas(finais);
      setImportancia("normal");

      if (posicao + 1 < historico.length) {
        setPosicao(posicao + 1);
        return;
      }
      const proximo = proximoPar(perguntas, finais, modo);
      if (!proximo) {
        terminar(finais);
        return;
      }
      const novos = proximo.perguntas.map((p) => p.id).filter((id) => !historico.includes(id));
      setHistorico([...historico, ...novos]);
      setPosicao(posicao + 1);
    },
    [idAtual, respostas, importancia, posicao, historico, perguntas, modo, terminar],
  );

  const voltar = useCallback(() => {
    if (posicao === 0) return;
    const anterior = historico[posicao - 1];
    setImportancia(nomeDaImportancia(respostas[anterior]?.m));
    setPosicao(posicao - 1);
  }, [posicao, historico, respostas]);

  const avancar = useCallback(() => {
    if (posicao + 1 < historico.length && respostas[idAtual]) setPosicao(posicao + 1);
  }, [posicao, historico, respostas, idAtual]);

  // Teclado: responder com 1 a 5, voltar com Backspace ou seta.
  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
      if (evento.key >= "1" && evento.key <= "5") {
        evento.preventDefault();
        responder(NOTAS[Number(evento.key) - 1]);
      } else if (evento.key === "Backspace" || evento.key === "ArrowLeft") {
        evento.preventDefault();
        voltar();
      } else if (evento.key === "ArrowRight") {
        evento.preventDefault();
        avancar();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [responder, voltar, avancar]);

  // Swipe no celular navega entre perguntas. Nao responde: arrastar para
  // escolher uma nota de cinco pontos seria adivinhacao.
  const toqueX = useRef(null);
  function aoTocar(evento) {
    toqueX.current = evento.changedTouches[0].clientX;
  }
  function aoSoltar(evento) {
    if (toqueX.current === null) return;
    const delta = evento.changedTouches[0].clientX - toqueX.current;
    if (delta > DISTANCIA_SWIPE) voltar();
    else if (delta < -DISTANCIA_SWIPE) avancar();
    toqueX.current = null;
  }

  if (!pronto || !perguntaAtual) {
    return (
      <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
        <p className="apoio">{t("teste_calculando")}</p>
      </main>
    );
  }

  const respostaAtual = respostas[idAtual];

  return (
    <main
      className="coluna pilha-larga"
      style={{ paddingBlock: "20px 48px" }}
      onTouchStart={aoTocar}
      onTouchEnd={aoSoltar}
    >
      <div className="pilha" style={{ gap: "10px" }}>
        <div className="linha" style={{ justifyContent: "space-between" }}>
          <button type="button" className="botao-discreto" onClick={() => navigate("/")}>
            {t("teste_sair")}
          </button>
          <span className="rotulo">{t("teste_progresso", respondidas, total)}</span>
        </div>
        <div className="progresso">
          <i style={{ width: `${Math.min(100, (respondidas / total) * 100)}%` }} />
        </div>
      </div>

      <div key={idAtual} className="entrando pilha-larga">
        <h1 className="afirmacao">{enunciado(perguntaAtual, lang)}</h1>

        <div className="escala">
          {NOTAS.map((nota, i) => (
            <button
              key={nota}
              type="button"
              className="opcao"
              aria-pressed={respostaAtual?.r === nota}
              onClick={() => responder(nota)}
            >
              <kbd aria-hidden="true">{i + 1}</kbd>
              <span>{t(`resposta${nota}`)}</span>
            </button>
          ))}
        </div>

        <div className="pilha" style={{ gap: "8px" }}>
          <span className="rotulo">{t("teste_importancia")}</span>
          <div className="importancia">
            {IMPORTANCIA_ORDEM.map((chave) => (
              <button
                key={chave}
                type="button"
                className="chip"
                aria-pressed={importancia === chave}
                onClick={() => {
                  setImportancia(chave);
                  // Ja respondeu e voltou para ajustar: aplica na hora.
                  if (respostaAtual) {
                    setRespostas({
                      ...respostas,
                      [idAtual]: { ...respostaAtual, m: IMPORTANCIAS[chave] },
                    });
                  }
                }}
              >
                {t(`teste_importancia_${chave}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="linha" style={{ justifyContent: "space-between" }}>
        <button
          type="button"
          className="botao botao-secundario"
          onClick={voltar}
          disabled={posicao === 0}
        >
          {t("teste_voltar")}
        </button>
        <span className="apoio" style={{ fontSize: "13px" }}>
          {t("teste_dica_teclado")}
        </span>
      </div>
    </main>
  );
}

function nomeDaImportancia(valor) {
  const encontrado = Object.entries(IMPORTANCIAS).find(([, v]) => v === valor);
  return encontrado ? encontrado[0] : "normal";
}
