import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useLang } from "./lib/lang.jsx";
import { TRADICOES } from "./lib/tradicoes.js";
import ErroLimite from "./components/ErroLimite.jsx";
import Home from "./pages/Home.jsx";
import Teste from "./pages/Teste.jsx";
import Resultado from "./pages/Resultado.jsx";
import Sobre from "./pages/Sobre.jsx";
import Metodologia from "./pages/Metodologia.jsx";
import Tradicoes from "./pages/Tradicoes.jsx";
import Partidos from "./pages/Partidos.jsx";
import Panorama from "./pages/Panorama.jsx";

function SeletorIdioma() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="segmentado">
      <button type="button" aria-pressed={lang === "pt"} onClick={() => setLang("pt")}>
        {t("nav_idioma_pt")}
      </button>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        {t("nav_idioma_en")}
      </button>
    </div>
  );
}

// Tradicoes antes de Metodologia e Sobre: sao 12 paginas de conteudo que, sem
// este link, so eram achadas por quem terminava o teste.
const LINKS = [
  ["/", "nav_inicio"],
  ["/tradicoes", "nav_tradicoes"],
  ["/resultados", "nav_resultados"],
  ["/metodologia", "nav_metodologia"],
  ["/sobre", "nav_sobre"],
];

/** `detalhado`: no menu do celular, Tradicoes diz quantas sao. */
function LinksPrincipais({ onNavegar, detalhado = false }) {
  const { t } = useLang();
  return LINKS.map(([para, chave]) => (
    <Link key={para} to={para} className="botao-discreto" onClick={onNavegar}>
      {t(chave)}
      {detalhado && para === "/tradicoes" && (
        <span className="link-detalhe">{t("nav_tradicoes_detalhe", TRADICOES.length)}</span>
      )}
    </Link>
  ));
}

function Topo() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Trocou de pagina com o menu aberto (por um link dele ou pela seta do
  // navegador): fecha, senao ele fica aberto sobre uma tela que nao e mais a
  // que o abriu.
  useEffect(() => setMenuAberto(false), [pathname]);

  // No questionario o topo some: a tela tem uma coisa para fazer e mais nada.
  if (pathname === "/teste") return null;

  return (
    <header className="topo">
      <Link to="/" className="marca">
        {t("marca")}
      </Link>

      <div className="topo-direita">
        <nav className="linha topo-links" aria-label={t("nav_principal")}>
          <LinksPrincipais />
        </nav>

        <div className="linha topo-controles">
          <SeletorIdioma />
        </div>

        <button
          type="button"
          className="botao-discreto topo-hamburguer"
          aria-expanded={menuAberto}
          aria-controls="topo-menu-mobile"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span aria-hidden="true">{menuAberto ? "\u2715" : "\u2630"}</span>
          <span className="so-leitor">
            {t(menuAberto ? "nav_menu_fechar" : "nav_menu_abrir")}
          </span>
        </button>
      </div>

      {menuAberto && (
        <nav id="topo-menu-mobile" className="topo-menu-mobile" aria-label={t("nav_principal")}>
          <LinksPrincipais onNavegar={() => setMenuAberto(false)} detalhado />
        </nav>
      )}
    </header>
  );
}

function Rodape() {
  const { t } = useLang();
  const { pathname } = useLocation();
  if (pathname === "/teste") return null;

  return (
    <footer className="rodape">
      {/* O fim de uma pagina longa e onde o dedo procura para onde ir. */}
      <nav className="rodape-links" aria-label={t("nav_rodape")}>
        {LINKS.map(([para, chave]) => (
          <Link key={para} to={para}>
            {t(chave)}
          </Link>
        ))}
      </nav>
      <div className="rodape-base">
        <span>{t("rodape_privacidade")}</span>
        <a href="https://github.com/gsromero/compass" target="_blank" rel="noreferrer">
          {t("rodape_codigo")}
        </a>
      </div>
    </footer>
  );
}

// O nome da aba de cada rota. Rota fora da lista e a pagina de "nao achei".
const TITULO_DA_ROTA = [
  ["/teste", "teste_titulo_aba"],
  ["/resultado/", "res_titulo"],
  ["/sobre", "sobre_titulo"],
  ["/metodologia", "metodologia_titulo"],
  ["/tradicoes", "tradicoes_titulo"],
  ["/partidos", "partidos_titulo"],
];

/**
 * O que toda troca de pagina faz: nome certo na aba do navegador, e voltar ao
 * topo. Sem isso, sair do fim da pagina Sobre abria a Metodologia ja rolada
 * para baixo, porque o site e uma pagina so e o navegador nao rola sozinho.
 */
function AoTrocarDePagina() {
  const { t } = useLang();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const achado = TITULO_DA_ROTA.find(([prefixo]) => pathname.startsWith(prefixo));
    const chave = pathname === "/" ? null : (achado?.[1] ?? "nao_encontrado");
    document.title = t("titulo_aba", chave ? t(chave) : null);
  }, [pathname, t]);

  return null;
}

function NaoEncontrado() {
  const { t } = useLang();
  return (
    <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
      <h1>{t("nao_encontrado")}</h1>
      <Link to="/" className="botao" style={{ justifySelf: "start" }}>
        {t("voltar_inicio")}
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="pagina">
      <AoTrocarDePagina />
      <Topo />
      <ErroLimite>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teste" element={<Teste />} />
          <Route path="/resultado/:codigo" element={<Resultado />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/metodologia" element={<Metodologia />} />
          <Route path="/tradicoes" element={<Tradicoes />} />
          <Route path="/tradicoes/:id" element={<Tradicoes />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/resultados" element={<Panorama />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </ErroLimite>
      <Rodape />
    </div>
  );
}
