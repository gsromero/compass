import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Bussola from "../components/Bussola.jsx";
import BarraEixo from "../components/BarraEixo.jsx";
import Radar from "../components/Radar.jsx";
import Polegar from "../components/Polegar.jsx";
import AtalhosSecoes from "../components/AtalhosSecoes.jsx";
import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";
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
import { margemUnica, partesDaManchete } from "../lib/manchete.js";
import { carregarAgregados, enviarResposta, ondeDestoa, percentil } from "../lib/agregados.js";
import { LAYOUTS, montarCard } from "../lib/shareCard.js";
import { baixarCanvasPng, compartilharCanvasPng } from "../lib/shareImage.js";

const SECUNDARIOS = EIXOS.filter((eixo) => !EIXOS_PRINCIPAIS.includes(eixo));
// Os ids das secoes, na ordem da pagina. Fora do componente de proposito: a
// fileira de atalhos observa estes ids, e uma lista nova a cada render
// religaria o observador o tempo todo.
const SECOES = ["grafico", "eixos", "porque", "tradicoes", "comparar"];

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
  const [copiado, setCopiado] = useState(false);
  const enviado = useRef(false);

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
    enviarResposta({
      versao: VERSAO_BANCO,
      idioma: lang,
      quadrante: quad,
      eixos: Object.fromEntries(EIXOS.map((e) => [e, Number(resultado[e].posicao.toFixed(3))])),
      itens: Object.entries(respostas).map(([id, r]) => ({ id, r: r.r })),
      faixaEtaria: state.faixaEtaria ?? null,
      genero: state.genero ?? null,
    });
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
        {t("res_voce_respondeu", r === NAO_SEI ? t("teste_nao_sei") : t(`resposta${r}`))}
      </span>
    );
  }

  function gerarCanvas() {
    return montarCard({
      resultado,
      quadrante: quad,
      tradicao: tradicaoTopo,
      lang,
      layout,
      eixosMeta: EIXOS_META,
    });
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

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "36px 64px" }}>
      {(confiavel === "baixa" || tudoIgual) && (
        <div className="aviso aviso-forte pilha" style={{ gap: "8px" }}>
          <strong>{t("res_confianca_baixa_titulo")}</strong>
          <p>{t(tudoIgual ? "res_uniforme" : "res_contraditorio")}</p>
          <Link to="/" className="botao" style={{ justifySelf: "start", marginTop: "4px" }}>
            {t("res_refazer_lendo")}
          </Link>
        </div>
      )}

      <div className="pilha resultado-manchete">
        <span className="rotulo">{t("res_titulo")}</span>
        <h1 className="manchete">{manchete}</h1>
        <p className="apoio">
          {tradicaoTopo && <>{t("res_tradicao_topo", pick(tradicaoTopo.nome))} </>}
          {margemComum !== null
            ? t("res_margem_todas", num(lang, margemComum, 1))
            : t(
                "res_margem_principais",
                num(lang, resultado.economico.margem, 1),
                num(lang, resultado.autoridade.margem, 1),
              )}
        </p>
      </div>

      <AtalhosSecoes secoes={SECOES} />

      <section id="grafico" className="secao-resultado">
        <div className="grade grade-2" style={{ alignItems: "center", gap: "26px" }}>
          <Bussola
            resultado={resultado}
            quadrante={quad}
            populacao={agregados?.suficiente ? agregados.mapa : null}
          />
          <div className="pilha">
            {/* Compartilhar logo abaixo do grafico: e a primeira coisa que muita
                gente quer fazer, e antes ficava no ultimo andar da pagina. */}
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
            {EIXOS_PRINCIPAIS.map((eixo) => (
              <BarraEixo
                key={eixo}
                eixo={eixo}
                meta={EIXOS_META[eixo]}
                dados={resultado[eixo]}
                semMargem={margemComum !== null}
              />
            ))}
            <p className="apoio" style={{ fontSize: "13.5px" }}>
              {t("res_esquerda_direita")}
            </p>
            <p className="apoio" style={{ fontSize: "13.5px" }}>
              {t("res_area_explicacao")}
            </p>
          </div>
        </div>
      </section>

      <section id="eixos" className="pilha secao-resultado">
        <h2 style={{ fontSize: "20px" }}>{t("res_perfil")}</h2>
        <p className="apoio">{t("res_perfil_intro")}</p>
        <div className="grade grade-2" style={{ alignItems: "center", gap: "26px" }}>
          <Radar resultado={resultado} />
          <div className="pilha">
            {SECUNDARIOS.map((eixo) => (
              <BarraEixo
                key={eixo}
                eixo={eixo}
                meta={EIXOS_META[eixo]}
                dados={resultado[eixo]}
                semMargem={margemComum !== null}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="porque" className="pilha secao-resultado">
        <h2 style={{ fontSize: "20px" }}>{t("res_por_que")}</h2>
        <p className="apoio">{t("res_por_que_intro")}</p>
        <div className="cartao">
          {EIXOS.map((eixo) => {
            const top = contribuicoes(perguntas, respostas, eixo)[0];
            if (!top) return null;
            const polo = top.empurrao < 0 ? EIXOS_META[eixo].neg : EIXOS_META[eixo].pos;
            return (
              <div key={eixo} className="contribuicao">
                <span className="rotulo">{t(`eixo_${eixo}`)}</span>
                <span style={{ fontFamily: "var(--fonte-texto)", fontSize: "16px" }}>
                  {enunciado(top.pergunta, lang)}
                </span>
                {suaResposta(respostas[top.pergunta.id].r)}
                <span className="fonte-tag">
                  {t("res_puxou_para", t(`polo_${polo}`))} ·{" "}
                  {top.pergunta.derivacao === "adaptado"
                    ? t("fonte_adaptado")
                    : t("fonte_construto")}{" "}
                  {top.pergunta.fonte.instrumento} {top.pergunta.fonte.item}
                </span>
              </div>
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

      <section id="tradicoes" className="pilha secao-resultado">
        <h2 style={{ fontSize: "20px" }}>{t("res_tradicoes")}</h2>
        <p className="apoio">{t("res_tradicoes_intro")}</p>
        <div className="pilha">
          {proximas.map(({ tradicao }, i) => (
            <Link
              key={tradicao.id}
              to={`/tradicoes/${tradicao.id}`}
              className="cartao pilha cartao-link"
              style={{ gap: "6px" }}
            >
              <div className="linha" style={{ justifyContent: "space-between" }}>
                <strong style={{ fontSize: "16.5px" }}>{pick(tradicao.nome)}</strong>
                <span className="fonte-tag">
                  {t("res_proximidade", i + 1)}
                </span>
              </div>
              <p className="apoio">{pick(tradicao.resumo)}</p>
              <p className="fonte-tag">{pick(tradicao.leituras).join(" · ")}</p>
              <span className="cartao-link-acao">{t("res_ler_tradicao")}</span>
            </Link>
          ))}
        </div>
        <Link to="/tradicoes" className="botao-discreto" style={{ justifySelf: "start" }}>
          {t("res_todas_tradicoes", TRADICOES.length)}
        </Link>
      </section>

      <section id="comparar" className="pilha secao-resultado">
        <h2 style={{ fontSize: "20px" }}>{t("pop_titulo")}</h2>
        {!agregados ? (
          <p className="apoio">{t("carregando")}</p>
        ) : !agregados.suficiente ? (
          <p className="aviso">{t("pop_insuficiente", agregados.total, agregados.minimo)}</p>
        ) : (
          <div className="pilha">
            <p className="apoio">{t("pop_total", agregados.total)}</p>
            {EIXOS_PRINCIPAIS.map((eixo) => {
              const pct = percentil(agregados, eixo, resultado[eixo].posicao);
              if (pct === null) return null;
              const polo =
                resultado[eixo].posicao > 0 ? EIXOS_META[eixo].pos : EIXOS_META[eixo].neg;
              const valor = resultado[eixo].posicao > 0 ? pct : 100 - pct;
              return (
                <p key={eixo}>{t("pop_percentil", valor, t(`polo_${polo}`))}</p>
              );
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
        )}
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{t("res_compartilhar")}</h2>
        <div className="pilha" style={{ gap: "8px" }}>
          <span className="rotulo">{t("res_layout")}</span>
          <div className="linha">
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
        <div className="linha">
          <button
            type="button"
            className="botao"
            onClick={() => compartilharCanvasPng(gerarCanvas(), "compass.png")}
          >
            {t("res_compartilhar")}
          </button>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => baixarCanvasPng(gerarCanvas(), "compass.png")}
          >
            {t("res_baixar")}
          </button>
          <button type="button" className="botao botao-secundario" onClick={copiarLink}>
            {copiado ? t("res_link_copiado") : t("res_copiar_link")}
          </button>
          <Link to="/" className="botao-discreto">
            {t("res_refazer")}
          </Link>
        </div>
      </section>
    </main>
  );
}
