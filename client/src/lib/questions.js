// Porta de entrada do banco de perguntas. Nenhuma tela le o JSON direto: quem
// precisa de pergunta pede aqui, e recebe ja filtrado pelo idioma.
import banco from "../data/questions.json";

export const VERSAO_BANCO = banco.versao;
export const EIXOS_META = banco.eixos;

/** Todas as perguntas, inclusive as exclusivas de um idioma. */
export const TODAS = banco.perguntas;

/**
 * As perguntas validas para um idioma. `so_no_idioma` permite item exclusivo de
 * um publico; a conta normaliza pelo peso efetivamente respondido, entao quem
 * responde em portugues e quem responde em ingles continuam comparaveis.
 */
export function perguntasDoIdioma(lang) {
  return TODAS.filter((p) => !p.so_no_idioma || p.so_no_idioma === lang);
}

/** O enunciado no idioma do app, com o portugues como ultimo recurso. */
export function enunciado(pergunta, lang) {
  return pergunta.texto?.[lang] ?? pergunta.texto?.pt ?? "";
}

export function porId(id) {
  return TODAS.find((p) => p.id === id);
}
