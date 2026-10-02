import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Bussola from "../components/Bussola.jsx";
import BarraEixo from "../components/BarraEixo.jsx";
import Radar from "../components/Radar.jsx";
import Polegar from "../components/Polegar.jsx";
import AtalhosSecoes from "../components/AtalhosSecoes.jsx";
import CabecalhoSecao from "../components/CabecalhoSecao.jsx";
import MiniBussola from "../components/MiniBussola.jsx";
import VitrineCards from "../components/VitrineCards.jsx";
import {
  IconeBaixar,
  IconeCadeado,
  IconeCompartilhar,
  IconeLink,
  IconeWhatsApp,
} from "../components/Icones.jsx";
import SeletorModo from "../components/SeletorModo.jsx";
import ResultadoBloqueado from "../components/ResultadoBloqueado.jsx";
import { useLang } from "../lib/lang.jsx";
import { num, numSinal } from "../lib/i18n.js";
import {
  EIXOS,
  EIXOS_PRINCIPAIS,
  NAO_SEI,
  confianca,
  contribuicoes,
  pontuar,
  quadrante,
  respondeuTudoIgual,
} from "../lib/scoring.js";
import { EIXOS_META, VERSAO_BANCO, enunciado, perguntasDoIdioma } from "../lib/questions.js";
import { decodificar, versaoDoCodigo } from "../lib/permalink.js";
import { TRADICOES, maisProximas } from "../lib/tradicoes.js";
import { intensidade, margemUnica, partesDaManchete } from "../lib/manchete.js";
import { carregarAgregados, enviarResposta, ondeDestoa, percentil } from "../lib/agregados.js";
import { verificarPessoa } from "../lib/turnstile.js";
import { eMeuResultado } from "../lib/meusResultados.js";
import { limpar } from "../lib/sessao.js";
import { LAYOUTS, montarCard } from "../lib/shareCard.js";
import { baixarCanvasPng, compartilharCanvasPng } from "../lib/shareImage.js";

const SECUNDARIOS = EIXOS.filter((eixo) => !EIXOS_PRINCIPAIS.includes(eixo));
// Os ids das secoes, na ordem da pagina. Fora do componente de proposito: a
// fileira de atalhos observa estes ids, e uma lista nova a cada render
// religaria o observador o tempo todo.
// Sem respostas suficientes a comparacao nem aparece (um medidor "4 de 50" nao
// dizia nada a quem acabou de fazer o teste), e quem so recebeu o link ve "Sua
// vez" no lugar de "Compartilhar". As quatro combinacoes ficam prontas aqui.
const SECOES = {};
for (const comparacao of [true, false]) {
  for (const visitante of [true, false]) {
    SECOES[`${comparacao}-${visitante}`] = [
      "grafico",
      "eixos",
      "porque",
      "tradicoes",
      ...(comparacao ? ["comparar"] : []),
      visitante ? "suavez" : "compartilhar",
    ];
  }
}

export default function Resultado() {
  const { codigo } = useParams();
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, pick } = useLang();

  const perguntas = useMemo(() => perguntasDoIdioma(lang), [lang]);
  const respostas = useMemo(
    () => decodificar(perguntas, codigo, VERSAO_BANCO),
    [perguntas, codigo],
  );

  const [agregados, setAgregados] = useState(null);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [comTradicao, setComTradicao] = useState(false);
  const [modoConvite, setModoConvite] = useState("padrao");
  // Quem acabou de fazer o teste, ou fez neste aparelho, e o dono. Os demais
  // abriram o link de outra pessoa: veem o convite para fazer o teste.
  const visitante = useMemo(
    () => !state?.doTeste && !eMeuResultado(codigo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codigo],
  );
  const [copiado, setCopiado] = useState(false);
  const enviado = useRef(false);
  const caixaVerificacao = useRef(null);

  const resultado = useMemo(
    () => (respostas ? pontuar(perguntas, respostas) : null),
    [perguntas, respostas],
  );
  const quad = resultado ? quadrante(resultado) : null;
  const proximas = resultado ? maisProximas(resultado) : [];
  // Resultado pouco confiavel tem que se anunciar. Sem isto, quem responde
  // tudo igual cai no centro e acha que o site quebrou, quando na verdade o
  // teste esta funcionando exatamente como deveria.
  const confiavel = resultado ? confianca(resultado) : "alta";
  const tudoIgual = respostas ? respondeuTudoIgual(respostas) : false;
  // E quando nao mede nada, nao mostra nada: a tela fica borrada atras de um
  // aviso que so deixa refazer, e a resposta nao e gravada (decisao do dono,
  // 2026-10-01). Um ponto no centro com margem enorme nao e resultado.
  const bloqueado = confiavel === "baixa" || tudoIgual;
  const pagina = useRef(null);

  // Manda a resposta anonima UMA vez, e so quando a pessoa acabou de terminar
  // o teste (o `state.doTeste` que Teste.jsx poe na navegacao). Abrir um link
  // compartilhado, ou recarregar, NAO grava: sem isso cada amigo que abre o
  // seu link virava uma copia das suas respostas nos agregados.
  //
  // O state do react-router vive no history do navegador e SOBREVIVE a um F5,
  // por isso ele e apagado logo depois do envio. O ref segura o StrictMode,
  // que roda este efeito duas vezes em desenvolvimento.
  useEffect(() => {
    if (!resultado || !respostas || !state?.doTeste || enviado.current) return;
    enviado.current = true;
    if (bloqueado) {
      // Nao entra nos numeros do site. So limpa o state, como no envio.
      navigate(pathname, { replace: true, state: null });
      return;
    }
    const corpo = {
      versao: VERSAO_BANCO,
      idioma: lang,
      quadrante: quad,
      eixos: Object.fromEntries(EIXOS.map((e) => [e, Number(resultado[e].posicao.toFixed(3))])),
      itens: Object.entries(respostas).map(([id, r]) => ({
        id,
        r: r.r,
        via: state.vias?.[id] ?? null,
      })),
      faixaEtaria: state.faixaEtaria ?? null,
      genero: state.genero ?? null,
    };
    // Antes de contar, a verificacao contra robo. Falhou (script bloqueado,
    // desafio recusado): a pessoa ve o resultado igual, so nao entra na conta.
    verificarPessoa(caixaVerificacao.current, lang)
      .then((turnstileToken) => {
        // Se a caixinha chegou a aparecer, o "Sucesso!" fica um instante e sai.
        setTimeout(() => {
          if (caixaVerificacao.current) caixaVerificacao.current.hidden = true;
        }, 1500);
        return enviarResposta({ ...corpo, turnstileToken });
      })
      .catch(() => {});
    navigate(pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  // Os numeros da populacao: para qualquer um que abra a tela.
  useEffect(() => {
    if (!resultado) return;
    let vivo = true;
    carregarAgregados().then((dados) => vivo && setAgregados(dados));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  if (!respostas || !resultado) {
    // Versao diferente da atual: o link era bom, o teste e que mudou.
    const versao = versaoDoCodigo(codigo);
    const tipo = versao !== null && versao !== (VERSAO_BANCO & 0xff) ? "antigo" : "invalido";
    return (
      <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
        <h1>{t(`res_link_${tipo}_titulo`)}</h1>
        <p className="apoio">{t(`res_link_${tipo}_corpo`)}</p>
        <Link to="/" className="botao" style={{ justifySelf: "start" }}>
          {t("res_fazer_teste")}
        </Link>
      </main>
    );
  }

  const tradicaoTopo = proximas[0]?.tradicao ?? null;

  const manchete = (() => {
    const [econ, aut] = partesDaManchete(resultado, EIXOS_META).map((parte) =>
      t(`manchete_${parte.eixo}_${parte.intensidade}`, t(`polo_${parte.polo}`)),
    );
    return t("res_manchete", econ, aut);
  })();
  // Margem igual nos seis eixos vira uma linha so na manchete, em vez de se
  // repetir em cada barra.
  const margemComum = margemUnica(resultado, EIXOS);

  /** A resposta da pessoa, do jeito que ela viu na tela do teste. */
  function suaResposta(r) {
    return (
      <span className="sua-resposta">
        <Polegar nota={r} tamanho={14} />
        {t(
          visitante ? "res_resposta" : "res_voce_respondeu",
          r === NAO_SEI ? t("teste_nao_sei") : t(`resposta${r}`),
        )}
      </span>
    );
  }

  function gerarCanvas(qual = layout, tradicaoNoCard = comTradicao) {
    return montarCard({
      resultado,
      quadrante: quad,
      tradicao: tradicaoTopo,
      lang,
      layout: qual,
      eixosMeta: EIXOS_META,
      comTradicao: tradicaoNoCard,
    });
  }

  /** Numero grande de um eixo principal, com a leitura embaixo. */
  function destaqueEixo(eixo) {
    const { posicao } = resultado[eixo];
    const polo = t(`polo_${posicao > 0 ? EIXOS_META[eixo].pos : EIXOS_META[eixo].neg}`);
    return (
      <div key={eixo} className="destaque-eixo">
        <span className="rotulo">{t(`eixo_${eixo}`)}</span>
        <strong>{numSinal(lang, posicao)}</strong>
        <span>{t(`leitura_${intensidade(posicao)}`, polo)}</span>
      </div>
    );
  }

  const comparacao = agregados?.suficiente === true;

  const textoMargem =
    margemComum !== null
      ? t("res_margem_todas", num(lang, margemComum, 1))
      : t(
          "res_margem_principais",
          num(lang, resultado.economico.margem, 1),
          num(lang, resultado.autoridade.margem, 1),
        );
  const acoesTopo = visitante ? (
    <button type="button" className="botao botao-secundario" style={{ width: "100%" }} onClick={copiarLink}>
      {copiado ? t("res_link_copiado") : t("res_copiar_link")}
    </button>
  ) : (
    <div className="acoes-topo">
      <button
        type="button"
        className="botao"
        onClick={() => compartilharCanvasPng(gerarCanvas(), "compass.png")}
      >
        {t("res_compartilhar")}
      </button>
      <button type="button" className="botao botao-secundario" onClick={copiarLink}>
        {copiado ? t("res_link_copiado") : t("res_copiar_link")}
      </button>
    </div>
  );

  function abrirWhatsApp() {
    const texto = `${t("res_whatsapp_texto")} ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissao: o link esta na barra de enderecos mesmo */
    }
  }

  const destoa = agregados?.suficiente
    ? ondeDestoa(agregados, respostas, perguntas, quad)
    : [];

  // Refazer comeca direto um teste novo, da mesma duracao (pela quantidade de
  // respostas). Quem abriu o link de outra pessoa comeca o padrao.
  function refazer() {
    limpar();
    const modo = !visitante && Object.keys(respostas).length >= 48 ? "completo" : "padrao";
    navigate("/teste", { state: { modo } });
  }

  return (
    <>
    {bloqueado && (
      <ResultadoBloqueado
        alvo={pagina}
        titulo={t(visitante ? "res_bloqueio_vis_titulo" : "res_bloqueio_titulo")}
        texto={t(visitante ? "res_bloqueio_vis_texto" : tudoIgual ? "res_uniforme" : "res_contraditorio")}
        nota={visitante ? null : t("res_bloqueio_nao_conta")}
        acao={t(visitante ? "vis_comecar" : "res_refazer_lendo")}
        onAcao={refazer}
      />
    )}
    <main ref={pagina} className="coluna resultado" aria-hidden={bloqueado || undefined}>
      {/* Quem abriu o link de outra pessoa: o convite vem antes de tudo. */}
      {visitante && (
        <section className="faixa faixa-visitante">
          <div className="pilha" style={{ gap: "4px" }}>
            <span className="faixa-visitante-texto">{t("vis_faixa_texto")}</span>
            <strong className="faixa-visitante-titulo">{t("vis_faixa_titulo")}</strong>
          </div>
          <div className="linha faixa-visitante-acao">
            <Link to="/" className="botao botao-invertido">
              {t("vis_fazer_teste")}
            </Link>
            <span className="faixa-visitante-texto">{t("vis_tempo")}</span>
          </div>
        </section>
      )}

      {/* A capa: manchete, a bussola grande, os dois numeros e Compartilhar,
          tudo no primeiro andar. Faixa de ponta a ponta, em outro tom. */}
      <section id="grafico" className="faixa faixa-capa secao-resultado">
        <div className="capa">
          <div className="capa-texto">
            <div className="pilha" style={{ gap: "10px" }}>
              <span className="rotulo">{t(visitante ? "vis_rotulo" : "res_titulo")}</span>
              <h1 className="manchete">{manchete}</h1>
              <p className="apoio capa-subtitulo">
                {tradicaoTopo && <>{t("res_tradicao_topo", pick(tradicaoTopo.nome))} </>}
                {textoMargem}
              </p>
            </div>
            <div className="capa-destaques">{EIXOS_PRINCIPAIS.map(destaqueEixo)}</div>
            <div className="capa-acoes-largo">{acoesTopo}</div>
          </div>
          <Bussola
            resultado={resultado}
            quadrante={quad}
            populacao={agregados?.suficiente ? agregados.mapa : null}
            proximas={proximas}
            etiqueta={visitante ? t("bus_esta_pessoa") : null}
          />
          <div className="capa-acoes-estreito">{acoesTopo}</div>
        </div>
      </section>

      {/* Onde a verificacao contra robo aparece, se precisar aparecer: no canto
          da tela, por cima da pagina. Quase sempre fica vazia. */}
      <div ref={caixaVerificacao} className="caixa-verificacao" />

      <AtalhosSecoes secoes={SECOES[`${comparacao}-${visitante}`]} />

      <section id="eixos" className="faixa secao-resultado">
        <CabecalhoSecao
          rotulo={t("sec_perfil")}
          titulo={t("res_perfil")}
          intro={t("res_perfil_intro")}
          ajuda={[t("res_perfil_legenda"), t("res_esquerda_direita"), t("res_area_explicacao")]}
        />
        <div className="eixos-painel">
          <Radar resultado={resultado} />
          <div className="eixos-grade">
            {EIXOS.map((eixo) => (
              <BarraEixo
                key={eixo}
                eixo={eixo}
                meta={EIXOS_META[eixo]}
                dados={resultado[eixo]}
                semMargem={margemComum !== null}
                destaque
              />
            ))}
          </div>
        </div>
      </section>

      <section id="porque" className="faixa faixa-tom secao-resultado">
        <CabecalhoSecao
          rotulo={t("sec_explicacao")}
          titulo={t(visitante ? "res_por_que_vis" : "res_por_que")}
          intro={t(visitante ? "res_por_que_intro_vis" : "res_por_que_intro")}
        />
        <div className="citacoes">
          {EIXOS.map((eixo) => {
            const top = contribuicoes(perguntas, respostas, eixo)[0];
            if (!top) return null;
            const polo = top.empurrao < 0 ? EIXOS_META[eixo].neg : EIXOS_META[eixo].pos;
            return (
              <figure key={eixo} className="citacao">
                <span className="rotulo">{t(`eixo_${eixo}`)}</span>
                <blockquote>{enunciado(top.pergunta, lang)}</blockquote>
                <figcaption className="citacao-rodape">
                  {suaResposta(respostas[top.pergunta.id].r)}
                  <strong>→ {t(`polo_${polo}`)}</strong>
                  <span className="fonte-tag">
                    {top.pergunta.derivacao === "adaptado"
                      ? t("fonte_adaptado")
                      : t("fonte_construto")}{" "}
                    {top.pergunta.fonte.instrumento} {top.pergunta.fonte.item}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
        {/* Todas as respostas, recolhidas: e o que transforma "por que caí
            aqui" numa explicacao que da para conferir. Vem do proprio link,
            sem banco. */}
        <details className="todas-respostas">
          <summary>{t("res_todas_respostas")}</summary>
          <div className="cartao">
            {perguntas
              .filter((p) => respostas[p.id])
              .map((p) => (
                <div key={p.id} className="contribuicao">
                  <span style={{ fontFamily: "var(--fonte-texto)", fontSize: "15.5px" }}>
                    {enunciado(p, lang)}
                  </span>
                  {suaResposta(respostas[p.id].r)}
                </div>
              ))}
          </div>
        </details>
        <Link to="/metodologia" className="botao-discreto" style={{ justifySelf: "start" }}>
          {t("res_ver_metodologia")}
        </Link>
      </section>

      <section id="tradicoes" className="faixa secao-resultado">
        <CabecalhoSecao
          rotulo={t("sec_tradicoes")}
          titulo={t("res_tradicoes")}
          intro={t("res_tradicoes_intro")}
        />
        <div className="tradicoes-grade">
          {proximas.map(({ tradicao }, i) => (
            <Link key={tradicao.id} to={`/tradicoes/${tradicao.id}`} className="cartao cartao-link tradicao-cartao">
              <div className="tradicao-topo">
                <div className="pilha" style={{ gap: "4px", minWidth: 0 }}>
                  <span className="tradicao-posicao">{i + 1}</span>
                  <strong className="tradicao-nome">{pick(tradicao.nome)}</strong>
                  <span className="fonte-tag">{t("res_proximidade", i + 1)}</span>
                </div>
                <MiniBussola
                  voce={{
                    economico: resultado.economico.posicao,
                    autoridade: resultado.autoridade.posicao,
                  }}
                  tradicao={{
                    economico: tradicao.eixos.economico ?? 0,
                    autoridade: tradicao.eixos.autoridade ?? 0,
                  }}
                />
              </div>
              <p className="apoio">{pick(tradicao.resumo)}</p>
              <div className="tradicao-legenda">
                <span>
                  <i className="tradicao-legenda-voce" aria-hidden="true" />
                  {t("trad_voce")}
                </span>
                <span>
                  <i className="tradicao-legenda-ela" aria-hidden="true" />
                  {t("trad_ela")}
                </span>
              </div>
              <span className="cartao-link-acao">{t("res_ler_tradicao")}</span>
            </Link>
          ))}
        </div>
        <div className="linha" style={{ gap: "8px 18px" }}>
          <Link to="/tradicoes" className="botao-discreto">
            {t("res_todas_tradicoes", TRADICOES.length)}
          </Link>
        </div>
        {/* A pagina de partidos e separada de proposito: os dados vem de outra
            pesquisa e medem outra coisa. O eixo economico vai junto so para o
            ponto "Voce" de la, nunca guardado. */}
        <Link
          to="/partidos"
          // O ponto "Voce" de la e o da pessoa que fez o teste: visitante nao leva.
          state={visitante ? null : { economico: resultado.economico.posicao }}
          className="cartao cartao-link partidos-chamada"
        >
          <strong>{t("partidos_link")}</strong>
          <span className="apoio">{t("partidos_link_texto")}</span>
        </Link>
      </section>

      {(comparacao || visitante) && (
      <section
        className={`faixa${visitante ? " faixa-tom" : ""} fim-resultado${comparacao && visitante ? "" : " fim-so-card"}`}
      >
        {comparacao && (
          <div id="comparar" className="pilha secao-resultado" style={{ gap: "18px", minWidth: 0 }}>
            <CabecalhoSecao rotulo={t("sec_comparacao")} titulo={t("pop_titulo")} />
            <div className="pilha">
              <p className="apoio">{t("pop_total", agregados.total)}</p>
              <p className="apoio">{t("pop_aviso")}</p>
              {EIXOS_PRINCIPAIS.map((eixo) => {
                const pct = percentil(agregados, eixo, resultado[eixo].posicao);
                if (pct === null) return null;
                const polo =
                  resultado[eixo].posicao > 0 ? EIXOS_META[eixo].pos : EIXOS_META[eixo].neg;
                const valor = resultado[eixo].posicao > 0 ? pct : 100 - pct;
                return <p key={eixo}>{t("pop_percentil", valor, t(`polo_${polo}`))}</p>;
              })}
              {destoa.length > 0 && (
                <div className="pilha" style={{ marginTop: "10px" }}>
                  <h3 style={{ fontSize: "16px" }}>{t("pop_destoa")}</h3>
                  <p className="apoio">{t("pop_destoa_intro")}</p>
                  <div className="cartao">
                    {destoa.map((item) => (
                      <div key={item.pergunta.id} className="contribuicao">
                        <span style={{ fontFamily: "var(--fonte-texto)", fontSize: "16px" }}>
                          {enunciado(item.pergunta, lang)}
                        </span>
                        <span className="fonte-tag">
                          {t("pop_sua_resposta")}: {num(lang, item.sua, 0)} ·{" "}
                          {t("pop_media_quadrante")}: {num(lang, item.media, 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {visitante && (
          <div id="suavez" className="pilha secao-resultado sua-vez" style={{ gap: "18px", minWidth: 0 }}>
            <CabecalhoSecao
              rotulo={t("vis_sua_vez_rotulo")}
              titulo={t("vis_sua_vez")}
              intro={t("vis_sua_vez_texto")}
            />
            <SeletorModo modo={modoConvite} setModo={setModoConvite} />
            <button
              type="button"
              className="botao botao-comecar"
              onClick={() => navigate("/teste", { state: { modo: modoConvite } })}
            >
              {t("vis_comecar")}
            </button>
            <button type="button" className="botao-discreto" style={{ justifySelf: "center" }} onClick={copiarLink}>
              {copiado ? t("res_link_copiado") : t("vis_copiar")}
            </button>
          </div>
        )}
      </section>
      )}

      {!visitante && (
        <section id="compartilhar" className="faixa faixa-compartilhar secao-resultado">
          <VitrineCards
            gerar={gerarCanvas}
            layout={layout}
            setLayout={setLayout}
            comTradicao={comTradicao}
            setComTradicao={setComTradicao}
            chave={`${codigo}-${lang}`}
            cabecalho={
              <CabecalhoSecao
                rotulo={t("sec_compartilhar")}
                titulo={t("res_compartilhar_titulo")}
                intro={t("res_compartilhar_intro")}
              />
            }
          >
            <div className="acoes-card">
              <button
                type="button"
                className="botao"
                onClick={() => compartilharCanvasPng(gerarCanvas(), "compass.png")}
              >
                <IconeCompartilhar />
                {t("res_compartilhar_imagem")}
              </button>
              <button type="button" className="botao botao-secundario" onClick={abrirWhatsApp}>
                <IconeWhatsApp />
                {t("res_whatsapp")}
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => baixarCanvasPng(gerarCanvas(), "compass.png")}
              >
                <IconeBaixar />
                {t("res_baixar")}
              </button>
              <button type="button" className="botao botao-secundario" onClick={copiarLink}>
                <IconeLink />
                {copiado ? t("res_link_copiado") : t("res_copiar_link")}
              </button>
            </div>
            <p className="vitrine-privacidade">
              <IconeCadeado />
              <span>
                {t("res_privacidade_link")} <strong>{t("res_privacidade_forte")}</strong>
              </span>
            </p>
            <Link to="/" className="botao-discreto" style={{ justifySelf: "start" }}>
              {t("res_refazer")}
            </Link>
          </VitrineCards>
        </section>
      )}
    </main>
    </>
  );
}
