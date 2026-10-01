import { useEffect, useState } from "react";
import { useLang } from "../lib/lang.jsx";

/**
 * A fileira de atalhos que fica presa no topo da pagina de resultado.
 *
 * A pagina tem uns cinco andares de tela no celular; sem isto, quem queria ver
 * as tradicoes rolava tudo as cegas. Marca a secao que esta na tela com o
 * IntersectionObserver da propria plataforma, sem medir nada na mao.
 *
 * Os links rolam ate a secao e NAO poem `#secao` na URL: o endereco desta
 * pagina e o link que a pessoa copia para compartilhar.
 *
 * @param {{secoes: string[]}} props ids das secoes, na ordem da pagina
 */
export default function AtalhosSecoes({ secoes }) {
  const { t } = useLang();
  const [ativa, setAtiva] = useState(secoes[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visiveis = new Map();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) visiveis.set(entrada.target.id, entrada.isIntersecting);
        // A primeira secao da ordem que ainda aparece e a que a pessoa esta lendo.
        const primeira = secoes.find((id) => visiveis.get(id));
        if (primeira) setAtiva(primeira);
      },
      // So a faixa de cima da tela conta, logo abaixo da propria fileira.
      { rootMargin: "-80px 0px -55% 0px" },
    );
    for (const id of secoes) {
      const el = document.getElementById(id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, [secoes]);

  function irPara(evento, id) {
    evento.preventDefault();
    const suave = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: suave ? "smooth" : "auto" });
    setAtiva(id);
  }

  return (
    <nav className="atalhos" aria-label={t("res_atalhos")}>
      {secoes.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          className="chip"
          aria-current={ativa === id ? "true" : undefined}
          onClick={(evento) => irPara(evento, id)}
        >
          {t(`res_atalho_${id}`)}
        </a>
      ))}
    </nav>
  );
}
