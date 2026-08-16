// Idioma do app (pt/en). O app NAO segue o idioma do navegador depois que a
// pessoa escolhe: a escolha manda e fica guardada.
// Portado do padrao do vintage, para os projetos nao divergirem.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { t } from "./i18n";

const KEY = "compass.lang";
const LangContext = createContext(null);

function initialLang() {
  const saved = localStorage.getItem(KEY);
  if (saved === "pt" || saved === "en") return saved;
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang precisa estar dentro do LangProvider");

  const translate = useCallback((chave, ...args) => t(ctx.lang, chave, ...args), [ctx.lang]);
  // texto de conteudo, que vem como { pt, en }
  const pick = useCallback((campo) => campo?.[ctx.lang] ?? campo?.pt ?? "", [ctx.lang]);

  return { ...ctx, t: translate, pick };
}
