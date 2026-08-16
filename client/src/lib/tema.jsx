// Tema claro ou escuro.
//
// O padrao e SEMPRE o claro, e nao o que o sistema da pessoa esta usando.
// Decisao do dono: o site abre claro para todo mundo, e o escuro existe como
// escolha. Por isso aqui nao existe `prefers-color-scheme`: quem nunca
// escolheu ve o claro, mesmo com o computador inteiro no escuro.
//
// Mesmo formato do lang.jsx, para os dois se parecerem.
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "compass.tema";
const TemaContext = createContext(null);

function temaInicial() {
  const salvo = localStorage.getItem(KEY);
  return salvo === "escuro" ? "escuro" : "claro";
}

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    localStorage.setItem(KEY, tema);
    // O CSS liga o tema escuro por este atributo no <html>.
    if (tema === "escuro") document.documentElement.dataset.tema = "escuro";
    else delete document.documentElement.dataset.tema;
  }, [tema]);

  const valor = useMemo(
    () => ({
      tema,
      setTema,
      alternar: () => setTema((atual) => (atual === "claro" ? "escuro" : "claro")),
    }),
    [tema],
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error("useTema precisa estar dentro do TemaProvider");
  return ctx;
}
