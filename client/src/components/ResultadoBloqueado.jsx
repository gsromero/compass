import { useEffect, useId, useRef } from "react";

/**
 * O resultado que nao mede nada (tudo igual, ou contraditorio demais) nao e
 * mostrado: a tela inteira fica borrada e a mensagem fica no meio, com uma
 * acao so, refazer. Nao fecha com Esc nem clicando fora, de proposito: atras
 * dela nao ha resultado para ler.
 *
 * A pagina por tras recebe `inert` (via `alvo`), para o teclado e o leitor de
 * tela nao chegarem nela.
 */
export default function ResultadoBloqueado({ titulo, texto, nota, acao, onAcao, alvo }) {
  const id = useId();
  const botao = useRef(null);

  useEffect(() => {
    botao.current?.focus();
    const pagina = alvo?.current;
    pagina?.setAttribute("inert", "");
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      pagina?.removeAttribute("inert");
      document.body.style.overflow = rolagem;
    };
  }, [alvo]);

  return (
    <div className="bloqueio">
      <div
        className="bloqueio-caixa"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-texto`}
      >
        <h2 id={`${id}-titulo`}>{titulo}</h2>
        <p id={`${id}-texto`}>{texto}</p>
        {nota && <p className="bloqueio-nota">{nota}</p>}
        <button ref={botao} type="button" className="botao" onClick={onAcao}>
          {acao}
        </button>
      </div>
    </div>
  );
}
