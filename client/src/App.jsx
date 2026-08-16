import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useLang } from "./lib/lang.jsx";
import { useTema } from "./lib/tema.jsx";
import Home from "./pages/Home.jsx";
import Teste from "./pages/Teste.jsx";
import Resultado from "./pages/Resultado.jsx";
import Sobre from "./pages/Sobre.jsx";
import Metodologia from "./pages/Metodologia.jsx";
import Tradicoes from "./pages/Tradicoes.jsx";

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

function LinksPrincipais({ onNavegar }) {
  const { t } = useLang();
  return (
    <>
      <Link to="/" className="botao-discreto" onClick={onNavegar}>
        {t("nav_inicio")}
      </Link>
      <Link to="/sobre" className="botao-discreto" onClick={onNavegar}>
        {t("nav_sobre")}
      </Link>
      <Link to="/metodologia" className="botao-discreto" onClick={onNavegar}>
        {t("nav_metodologia")}
      </Link>
    </>
  );
}

function Topo() {
  const { t } = useLang();
  const { tema, alternar } = useTema();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Trocou de pagina com o menu aberto (por um link dele ou pela seta do
  // navegador): fecha, senao ele fica aberto sobre uma tela que nao e mais a
  // que o abriu.
  useEffect(() => setMenuAberto(false), [pathname]);

  // No questionario o topo some: a tela tem uma coisa para fazer e mais nada.
  if (pathname === "/teste") return null;

  return (
    <header className="coluna coluna-larga topo">
      <Link to="/" className="marca">
        {t("marca")}
      </Link>

      <div className="topo-direita">
        <nav className="linha topo-links" aria-label={t("nav_principal")}>
          <LinksPrincipais />
        </nav>

        <div className="linha topo-controles">
          <SeletorIdioma />
          <button
            type="button"
            className="botao-discreto"
            onClick={alternar}
            aria-label={t(tema === "claro" ? "nav_tema_escuro" : "nav_tema_claro")}
            title={t(tema === "claro" ? "nav_tema_escuro" : "nav_tema_claro")}
          >
            {tema === "claro" ? "\u25D1" : "\u25D0"}
          </button>
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
          <LinksPrincipais onNavegar={() => setMenuAberto(false)} />
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
    <footer className="coluna coluna-larga rodape">
      <span>{t("rodape_privacidade")}</span>
      <a href="https://github.com/gsromero/compass" target="_blank" rel="noreferrer">
        {t("rodape_codigo")}
      </a>
    </footer>
  );
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
      <Topo />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teste" element={<Teste />} />
        <Route path="/resultado/:codigo" element={<Resultado />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/metodologia" element={<Metodologia />} />
        <Route path="/tradicoes" element={<Tradicoes />} />
        <Route path="/tradicoes/:id" element={<Tradicoes />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
      <Rodape />
    </div>
  );
}
