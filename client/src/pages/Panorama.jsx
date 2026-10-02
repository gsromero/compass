import { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "../lib/lang.jsx";
import { num, numSinal } from "../lib/i18n.js";
import { buscarAgregados } from "../lib/agregados.js";
import { EIXOS } from "../lib/scoring.js";
import { EIXOS_META, enunciado, perguntasDoIdioma } from "../lib/questions.js";
import { intensidade } from "../lib/manchete.js";
import { FAIXAS_ETARIAS, GENEROS } from "../lib/demografia.js";
import Bussola from "../components/Bussola.jsx";
import CabecalhoSecao from "../components/CabecalhoSecao.jsx";

const QUADRANTES = [
  "igualdade-liberdade",
  "mercado-liberdade",
  "igualdade-autoridade",
  "mercado-autoridade",
];
const ORDENS = ["divididas", "aceitas", "rejeitadas"];

const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);

/**
 * A pagina publica de Resultados (/resultados): os numeros somados de todas as
 * respostas. Mockup aprovado em 2026-10-02.
 *
 * O aviso de que nao e uma amostra do pais fica no TOPO, e nao no fim: numa
 * pagina publica alguem tira print e diz "o Brasil pensa assim", e o aviso
 * precisa estar no print. Grupos de idade, genero e idioma pequenos ja chegam
 * do servidor sem numero (null), e aqui viram "menos de N".
 */
export default function Panorama() {
  const { t } = useLang();
  const [estado, setEstado] = useState({ carregando: true, erro: false, dados: null });

  const carregar = useCallback(() => {
    setEstado({ carregando: true, erro: false, dados: null });
    buscarAgregados()
      .then((dados) => setEstado({ carregando: false, erro: false, dados }))
      .catch(() => setEstado({ carregando: false, erro: true, dados: null }));
  }, []);
  useEffect(carregar, [carregar]);

  const { carregando, erro, dados } = estado;

  return (
    <main className="coluna resultado panorama">
      <section className="faixa pub-capa">
        <div className="pilha" style={{ gap: "10px" }}>
          <span className="rotulo">{t("pub_rotulo")}</span>
          <h1 className="manchete">{t("pub_titulo")}</h1>
          <p className="apoio">{t("pub_intro")}</p>
        </div>
        <p className="pub-aviso">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.5" />
          </svg>
          <span>
            <strong>{t("pub_aviso_forte")}</strong> {t("pub_aviso")}
          </span>
        </p>

        {carregando && <p className="apoio">{t("carregando")}</p>}
        {erro && (
          <div className="pilha" style={{ gap: "10px", justifyItems: "start" }}>
            <p className="apoio">{t("pub_erro")}</p>
            <button type="button" className="botao botao-secundario" onClick={carregar}>
              {t("pub_tentar")}
            </button>
          </div>
        )}
        {dados && (
          <div className="pub-numero">
            <strong>{dados.total}</strong>
            <span>{t("pub_total")}</span>
          </div>
        )}
        {dados && !dados.suficiente && (
          <div className="pilha" style={{ gap: "6px" }}>
            <strong>{t("pub_poucas_titulo")}</strong>
            <p className="apoio">{t("pub_poucas", dados.total, dados.minimo)}</p>
          </div>
        )}
      </section>

      {dados?.suficiente && <Completo dados={dados} />}
    </main>
  );
}

function Completo({ dados }) {
  const { t, lang } = useLang();
  const { total, medias, minimoGrupo } = dados;
  const menosDe = t("pub_menos_de", minimoGrupo);

  return (
    <>
      <section className="faixa faixa-tom">
        <div className="pub-mapa">
          <Bussola
            resultado={null}
            media={{ economico: medias.economico, autoridade: medias.autoridade }}
            populacao={{ pontos: dados.pontos }}
          />
          <div className="pilha" style={{ gap: "18px", alignContent: "center" }}>
            <CabecalhoSecao
              rotulo={t("pub_mapa_rotulo")}
              titulo={t("pub_mapa_titulo")}
              intro={t("pub_mapa_intro")}
            />
            <div className="pub-quadrantes">
              {QUADRANTES.map((q) => {
                const n = dados.quadrantes?.[q] ?? 0;
                const pequeno = n < minimoGrupo;
                return (
                  <div key={q} className="pub-quadrante">
                    <i style={{ background: `var(--q-${q})` }} aria-hidden="true" />
                    <span>{t(`quadrante_${q.replace("-", "_")}`)}</span>
                    <em>{pequeno ? menosDe : `${pct(n, total)}%`}</em>
                    <span className="pub-barra" aria-hidden="true">
                      <b style={{ width: `${pequeno ? 0 : pct(n, total)}%`, background: `var(--q-${q})` }} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="faixa">
        <CabecalhoSecao
          rotulo={t("pub_eixos_rotulo")}
          titulo={t("pub_eixos_titulo")}
          intro={t("pub_eixos_intro")}
        />
        <div className="pub-eixos">
          {EIXOS.map((eixo) => (
            <Eixo key={eixo} eixo={eixo} media={medias[eixo]} dados={dados} />
          ))}
        </div>
      </section>

      <section className="faixa faixa-tom">
        <CabecalhoSecao
          rotulo={t("pub_quem_rotulo")}
          titulo={t("pub_quem_titulo")}
          intro={t("pub_quem_intro", minimoGrupo)}
        />
        <div className="pub-quem">
          <Grupo
            titulo={t("pub_idade")}
            contagens={dados.demografia?.idade}
            linhas={[...FAIXAS_ETARIAS.map((f) => [f, f]), ["nao_disse", t("pub_nao_disse")]]}
            total={total}
            menosDe={menosDe}
          />
          <Grupo
            titulo={t("pub_genero")}
            contagens={dados.demografia?.genero}
            linhas={[
              ...GENEROS.map((g) => [g, t(`demografia_genero_${g}`)]),
              ["nao_disse", t("pub_nao_disse")],
            ]}
            total={total}
            menosDe={menosDe}
          />
          <Grupo
            titulo={t("pub_idioma")}
            contagens={dados.demografia?.idioma}
            linhas={[
              ["pt", t("pub_idioma_pt")],
              ["en", t("pub_idioma_en")],
            ]}
            total={total}
            menosDe={menosDe}
            nota={t("pub_quem_nota")}
          />
        </div>
      </section>

      <Afirmacoes afirmacoes={dados.afirmacoes} lang={lang} />
    </>
  );
}

function Eixo({ eixo, media, dados }) {
  const { t, lang } = useLang();
  const meta = EIXOS_META[eixo];
  const dist = dados.eixos?.[eixo]?.distribuicao ?? [];
  const maior = Math.max(1, ...dist.map((f) => f.n));
  const faixaDaMedia = Math.min(9, Math.max(0, Math.floor((media + 10) / 2)));
  const polo = t(`polo_${media > 0 ? meta.pos : meta.neg}`);
  return (
    <div className="pub-eixo">
      <div className="pub-eixo-topo">
        <span className="rotulo">{t(`eixo_${eixo}`)}</span>
        <strong>{numSinal(lang, media)}</strong>
      </div>
      <small>{t(`leitura_${intensidade(media)}`, polo)}</small>
      <div className="pub-histo" aria-hidden="true">
        {dist.map((f, i) => (
          <span
            key={f.ate}
            data-media={i === faixaDaMedia || undefined}
            style={{ height: `${(f.n / maior) * 100}%` }}
          />
        ))}
      </div>
      <div className="pub-polos">
        <span>← {t(`polo_${meta.neg}`)}</span>
        <span>{t(`polo_${meta.pos}`)} →</span>
      </div>
    </div>
  );
}

function Grupo({ titulo, contagens = {}, linhas, total, menosDe, nota = null }) {
  return (
    <div className="pub-eixo">
      <span className="rotulo">{titulo}</span>
      {linhas.map(([chave, rotulo]) => {
        // Ausente: ninguem nesse grupo. null: existe, mas e pequeno demais.
        if (!(chave in (contagens ?? {}))) return null;
        const n = contagens[chave];
        const oculto = n === null;
        return (
          <div key={chave} className="pub-linha">
            <span>{rotulo}</span>
            <span className={`pub-barra${oculto ? " pub-barra-oculta" : ""}`} aria-hidden="true">
              <b style={{ width: `${oculto ? 0 : pct(n, total)}%` }} />
            </span>
            <em>{oculto ? menosDe : `${pct(n, total)}%`}</em>
          </div>
        );
      })}
      {nota && <p className="pub-nota">{nota}</p>}
    </div>
  );
}

function Afirmacoes({ afirmacoes = {}, lang }) {
  const { t } = useLang();
  const [filtro, setFiltro] = useState("todas");
  const [ordem, setOrdem] = useState("divididas");

  const lista = useMemo(() => {
    const itens = perguntasDoIdioma(lang)
      .filter((p) => afirmacoes[p.id] && (filtro === "todas" || p.eixo === filtro))
      .map((p) => {
        const { concordam, discordam, nao_sei: naoSei } = afirmacoes[p.id];
        const responderam = concordam + discordam;
        return { p, concordam, responderam, naoSei, parte: responderam ? concordam / responderam : 0.5 };
      });
    const criterio = {
      divididas: (a, b) => Math.abs(a.parte - 0.5) - Math.abs(b.parte - 0.5),
      aceitas: (a, b) => b.parte - a.parte,
      rejeitadas: (a, b) => a.parte - b.parte,
    }[ordem];
    return itens.sort(criterio);
  }, [afirmacoes, filtro, ordem, lang]);

  const total = perguntasDoIdioma(lang).length;

  return (
    <section className="faixa">
      <CabecalhoSecao
        rotulo={t("pub_afirm_rotulo", total)}
        titulo={t("pub_afirm_titulo")}
        intro={t("pub_afirm_intro")}
      />
      <div className="linha" style={{ gap: "8px" }}>
        {["todas", ...EIXOS].map((chave) => (
          <button
            key={chave}
            type="button"
            className="chip"
            aria-pressed={filtro === chave}
            onClick={() => setFiltro(chave)}
          >
            {chave === "todas" ? t("pub_todas") : t(`eixo_${chave}`)}
          </button>
        ))}
      </div>
      <div className="pilulas-escolha" role="group" aria-label={t("pub_ordem")}>
        {ORDENS.map((o) => (
          <button key={o} type="button" aria-pressed={ordem === o} onClick={() => setOrdem(o)}>
            {t(`pub_ordem_${o}`)}
          </button>
        ))}
      </div>
      <div className="pub-legenda" aria-hidden="true">
        <span><i className="pub-concorda" />{t("pub_concordam")}</span>
        <span><i className="pub-discorda" />{t("pub_discordam")}</span>
      </div>
      <ol className="pub-lista">
        {lista.map(({ p, responderam, naoSei, parte }) => {
          const sim = Math.round(parte * 100);
          return (
            <li key={p.id} className="pub-item">
              <p>
                <span className="rotulo">{t(`eixo_${p.eixo}`)}</span>
                {enunciado(p, lang)}
              </p>
              <div className="pub-divisao">
                <div className="pub-divisao-barra" aria-hidden="true">
                  <b style={{ width: `${sim}%` }} />
                </div>
                <div className="pub-divisao-numeros">
                  <strong>{t("pub_pct_concordam", num(lang, sim, 0))}</strong>
                  <span>{t("pub_responderam", responderam, naoSei)}</span>
                  <strong>{t("pub_pct_discordam", num(lang, 100 - sim, 0))}</strong>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
