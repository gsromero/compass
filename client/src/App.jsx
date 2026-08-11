import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useLang } from "./lib/lang.jsx";
import Home from "./pages/Home.jsx";
import Teste from "./pages/Teste.jsx";
import Resultado from "./pages/Resultado.jsx";
import Sobre from "./pages/Sobre.jsx";
import Metodologia from "./pages/Metodologia.jsx";
import Tradicoes from "./pages/Tradicoes.jsx";

function Topo() {
  const { t, toggle } = useLang();
  const { pathname } = useLocation();
  // No questionario o topo some: a tela tem uma coisa para fazer e mais nada.
  if (pathname === "/teste") return null;

  return (
    <header className="coluna coluna-larga topo">
      <Link to="/" className="marca">
        {t("marca")}
      </Link>
      <nav className="linha">
        <Link to="/sobre" className="botao-discreto">
          {t("nav_sobre")}
        </Link>
        <Link to="/metodologia" className="botao-discreto">
          {t("nav_metodologia")}
        </Link>
        <button type="button" className="botao-discreto" onClick={toggle}>
          {t("nav_idioma")}
        </button>
      </nav>
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
