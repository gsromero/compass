import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Bussola from "../components/Bussola.jsx";
import BarraEixo from "../components/BarraEixo.jsx";
import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";
import {
  EIXOS,
  EIXOS_PRINCIPAIS,
  confianca,
  contribuicoes,
  pontuar,
  quadrante,
  respondeuTudoIgual,
} from "../lib/scoring.js";
import { EIXOS_META, VERSAO_BANCO, enunciado, perguntasDoIdioma } from "../lib/questions.js";
import { decodificar } from "../lib/permalink.js";
import { maisProximas } from "../lib/tradicoes.js";
import { carregarAgregados, enviarResposta, ondeDestoa, percentil } from "../lib/agregados.js";
import { LAYOUTS, montarCard } from "../lib/shareCard.js";
import { baixarCanvasPng, compartilharCanvasPng } from "../lib/shareImage.js";

const SECUNDARIOS = EIXOS.filter((eixo) => !EIXOS_PRINCIPAIS.includes(eixo));

export default function Resultado() {
  const { codigo } = useParams();
  const { t, lang, pick } = useLang();

  const perguntas = useMemo(() => perguntasDoIdioma(lang), [lang]);
  const respostas = useMemo(
    () => decodificar(perguntas, codigo, VERSAO_BANCO),
    [perguntas, codigo],
  );

  const [agregados, setAgregados] = useState(null);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [copiado, setCopiado] = useState(false);

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

  // Manda a resposta anonima uma vez, e busca os numeros da populacao.
  useEffect(() => {
    if (!resultado || !respostas) return;
    let vivo = true;
    enviarResposta({
      versao: VERSAO_BANCO,
      idioma: lang,
      quadrante: quad,
      eixos: Object.fromEntries(EIXOS.map((e) => [e, Number(resultado[e].posicao.toFixed(3))])),
      itens: Object.entries(respostas).map(([id, r]) => ({ id, r: r.r })),
    });
    carregarAgregados().then((dados) => vivo && setAgregados(dados));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  if (!respostas || !resultado) {
    return (
      <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
        <h1>{t("erro_titulo")}</h1>
        <p className="apoio">{t("nao_encontrado")}</p>
        <Link to="/" className="botao" style={{ justifySelf: "start" }}>
          {t("voltar_inicio")}
        </Link>
      </main>
    );
  }

  const tradicaoTopo = proximas[0]?.tradicao ?? null;

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
    <main className="coluna coluna-larga pilha-larga" style={{ paddingBlock: "36px 64px" }}>
      {(confiavel === "baixa" || tudoIgual) && (
        <div className="aviso aviso-forte pilha" style={{ gap: "8px" }}>
          <strong>{t("res_confianca_baixa_titulo")}</strong>
          <p>{t(tudoIgual ? "res_uniforme" : "res_contraditorio")}</p>
          <Link to="/" className="botao" style={{ justifySelf: "start", marginTop: "4px" }}>
            {t("res_refazer_lendo")}
          </Link>
        </div>
      )}

      <div className="pilha">
        <span className="rotulo">{t("res_titulo")}</span>
        <div className="grade grade-2" style={{ alignItems: "center", gap: "26px" }}>
          <Bussola
            resultado={resultado}
            quadrante={quad}
            populacao={agregados?.suficiente ? agregados.mapa : null}
          />
          <div className="pilha">
            {EIXOS_PRINCIPAIS.map((eixo) => (
              <BarraEixo key={eixo} eixo={eixo} meta={EIXOS_META[eixo]} dados={resultado[eixo]} />
            ))}
            <p className="apoio" style={{ fontSize: "13.5px" }}>
              {t("res_esquerda_direita")}
            </p>
            <p className="apoio" style={{ fontSize: "13.5px" }}>
              {t("res_area_explicacao")}
            </p>
          </div>
        </div>
      </div>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{t("res_eixos_secundarios")}</h2>
        <div className="grade grade-2">
          {SECUNDARIOS.map((eixo) => (
            <BarraEixo key={eixo} eixo={eixo} meta={EIXOS_META[eixo]} dados={resultado[eixo]} />
          ))}
        </div>
      </section>

      <section className="pilha">
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
        <Link to="/metodologia" className="botao-discreto" style={{ justifySelf: "start" }}>
          {t("res_ver_metodologia")}
        </Link>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{t("res_tradicoes")}</h2>
        <p className="apoio">{t("res_tradicoes_intro")}</p>
        <div className="pilha">
          {proximas.map(({ tradicao, distancia }) => (
            <div key={tradicao.id} className="cartao pilha" style={{ gap: "6px" }}>
              <div className="linha" style={{ justifyContent: "space-between" }}>
                <strong style={{ fontSize: "16.5px" }}>{pick(tradicao.nome)}</strong>
                <span className="fonte-tag">
                  {t("res_proximidade", num(lang, (1 - distancia) * 100, 0))}
                </span>
              </div>
              <p className="apoio">{pick(tradicao.resumo)}</p>
              <p className="fonte-tag">{pick(tradicao.leituras).join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pilha">
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
        <div className="linha">
          <span className="rotulo">{t("res_layout")}</span>
          {LAYOUTS.map((nome) => (
            <button
              key={nome}
              type="button"
              className="chip"
              aria-pressed={layout === nome}
              onClick={() => setLayout(nome)}
            >
              {nome}
            </button>
          ))}
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
