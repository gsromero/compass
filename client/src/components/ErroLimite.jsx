import { Component } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";

/** A tela que aparece quando o ErrorBoundary pega um erro. Componente de
 * funcao porque precisa de useLang, que uma classe nao pode chamar. */
function MensagemDeErro() {
  const { t } = useLang();
  return (
    <main className="coluna pilha" style={{ paddingBlock: "64px" }}>
      <h1>{t("erro_titulo")}</h1>
      <p className="apoio">{t("erro_limite_corpo")}</p>
      <Link to="/" className="botao" style={{ justifySelf: "start" }}>
        {t("voltar_inicio")}
      </Link>
    </main>
  );
}

/* Classe porque componentDidCatch/getDerivedStateFromError nao tem
 * equivalente em hook. Antes disto o site nao tinha NENHUM ErrorBoundary:
 * qualquer excecao de render, em qualquer pagina, virava tela em branco sem
 * pista nenhuma, porque o React desmonta a arvore inteira e nao sobra nada
 * na tela. Agora ao menos aparece uma mensagem, e o console.error guarda o
 * erro de verdade para quem abrir o DevTools. Nao existe telemetria no
 * projeto por decisao de privacidade, entao o registro fica só na maquina de
 * quem esta usando, nunca sai dali. */
class LimiteDeErro extends Component {
  state = { comErro: false };

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  componentDidCatch(erro, info) {
    console.error(erro, info.componentStack);
  }

  render() {
    return this.state.comErro ? <MensagemDeErro /> : this.props.children;
  }
}

/* Troca de rota com o limite armado tem que resetar: senao um erro numa
 * pagina prende a pessoa na tela de erro mesmo clicando em outro link. O
 * "key" na rota forca o React a remontar a classe do zero a cada navegacao. */
export default function ErroLimite({ children }) {
  const { pathname } = useLocation();
  return <LimiteDeErro key={pathname}>{children}</LimiteDeErro>;
}
