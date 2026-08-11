import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { enunciado, perguntasDoIdioma, VERSAO_BANCO } from "../lib/questions.js";
import { IMPORTANCIAS, NAO_SEI, RESPOSTAS, proximoPar, totalPrevisto } from "../lib/scoring.js";
import { intencaoDoArrasto, progressoDoArrasto } from "../lib/gesto.js";
import { codificar } from "../lib/permalink.js";
import { carregar, limpar, salvar } from "../lib/sessao.js";

// A escala vem de scoring.js. Nunca escrever a mao aqui.
const NOTAS = RESPOSTAS;
const IMPORTANCIA_ORDEM = ["baixa", "normal", "alta"];
const SEM_ARRASTO = { dx: 0, dy: 0, largura: 0, ativo: false };
// Tempo do cartao voar para fora antes da proxima pergunta entrar.
const VOO = 170;

function prefereMenosMovimento() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

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
  const [arrasto, setArrasto] = useState(SEM_ARRASTO);
  const [saindoPara, setSaindoPara] = useState(0);

  const cartao = useRef(null);
  const inicio = useRef(null);
  const relogio = useRef(null);

  useEffect(() => () => clearTimeout(relogio.current), []);

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

  /** Responde deixando o cartao voar para o lado escolhido antes de trocar. */
  const responderComVoo = useCallback(
    (nota, direcao) => {
      if (prefereMenosMovimento()) {
        setArrasto(SEM_ARRASTO);
        responder(nota);
        return;
      }
      setArrasto(SEM_ARRASTO);
      setSaindoPara(direcao);
      clearTimeout(relogio.current);
      relogio.current = setTimeout(() => {
        setSaindoPara(0);
        responder(nota);
      }, VOO);
    },
    [responder],
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

  // Teclado: 1 a 4 respondem, 0 e "nao sei", Backspace volta.
  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
      const indice = Number(evento.key) - 1;
      if (indice >= 0 && indice < NOTAS.length) {
        evento.preventDefault();
        responder(NOTAS[indice]);
      } else if (evento.key === "0") {
        evento.preventDefault();
        responder(NAO_SEI);
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

  // --- arrasto ------------------------------------------------------------
  // A decisao de qual resposta um arrasto virou mora em lib/gesto.js. Aqui so
  // se mede o dedo e se aplica o que aquela funcao disse.

  function aoPressionar(evento) {
    if (evento.pointerType === "mouse" && evento.button !== 0) return;
    inicio.current = { x: evento.clientX, y: evento.clientY };
    setArrasto({ dx: 0, dy: 0, largura: cartao.current?.offsetWidth ?? 0, ativo: true });
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
  }

  function aoMover(evento) {
    if (!inicio.current) return;
    setArrasto((atual) => ({
      ...atual,
      dx: evento.clientX - inicio.current.x,
      dy: evento.clientY - inicio.current.y,
    }));
  }

  function aoSoltar(evento) {
    if (!inicio.current) return;
    // Vem do evento, e nao do estado: o ultimo movimento pode nao ter chegado
    // ao React ainda, e responder com a posicao errada seria pior que nada.
    const dx = evento.clientX - inicio.current.x;
    const dy = evento.clientY - inicio.current.y;
    const largura = arrasto.largura || cartao.current?.offsetWidth || 0;
    inicio.current = null;

    const intencao = intencaoDoArrasto(dx, dy, largura);
    if (intencao === null) {
      setArrasto(SEM_ARRASTO);
      return;
    }
    responderComVoo(intencao, Math.sign(dx));
  }

  if (!pronto || !perguntaAtual) {
    return (
      <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
        <p className="apoio">{t("teste_calculando")}</p>
      </main>
    );
  }

  const respostaAtual = respostas[idAtual];
  const progresso = arrasto.ativo ? progressoDoArrasto(arrasto.dx, arrasto.largura) : 0;
  const previa = arrasto.ativo ? intencaoDoArrasto(arrasto.dx, arrasto.dy, arrasto.largura) : null;

  const estiloCartao = saindoPara
    ? { transform: `translateX(${saindoPara * 120}%) rotate(${saindoPara * 12}deg)`, opacity: 0 }
    : arrasto.ativo
      ? { transform: `translateX(${arrasto.dx}px) rotate(${progresso * 5}deg)` }
      : undefined;

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "20px 48px" }}>
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

      <div className="pilha-larga">
        <div className="palco">
          <div className="palco-lados" aria-hidden="true">
            <span>&larr; {t("resposta-1")}</span>
            <span>{t("resposta1")} &rarr;</span>
          </div>

          <div
            key={idAtual}
            ref={cartao}
            className={`cartao-pergunta ${arrasto.ativo || saindoPara ? "arrastando" : "entrando"}`}
            style={estiloCartao}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={() => {
              inicio.current = null;
              setArrasto(SEM_ARRASTO);
            }}
          >
            <h1 className="afirmacao">{enunciado(perguntaAtual, lang)}</h1>
            <span className="previa" data-visivel={previa !== null}>
              {previa !== null ? t(`resposta${previa}`) : ""}
            </span>
          </div>
        </div>

        <p className="apoio dica-arrasto">{t("teste_dica_arrasto")}</p>

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

        {/* "Nao sei" e discreto de proposito. O defeito da resposta do meio
            nunca foi ela existir, foi ser o botao mais facil de apertar. */}
        <button
          type="button"
          className="botao-discreto nao-sei"
          aria-pressed={respostaAtual?.r === NAO_SEI}
          title={t("teste_nao_sei_ajuda")}
          onClick={() => responder(NAO_SEI)}
        >
          {t("teste_nao_sei")}
        </button>

        {/* A lista fica por ultimo: no celular ela e a alternativa, e no
            desktop e o teclado e o mouse que mandam. Ela NAO pode sumir: e o
            unico caminho para quem usa leitor de tela ou so o teclado. */}
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
