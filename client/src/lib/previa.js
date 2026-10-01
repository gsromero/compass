// O quadrante de um link de resultado, para a imagem de previa.
//
// Usado pela Function functions/resultado/[codigo].js, que roda no servidor:
// quando alguem cola um link de resultado no WhatsApp, o robo do app le o
// HTML sem rodar o site, e so o servidor pode trocar a imagem de previa.
// Mesma conta da tela (scoring.js), entao a previa nunca discorda do resultado.
// Nenhuma pergunta usa `so_no_idioma`, entao o codigo decodifica igual em pt e en.

import { decodificar } from "./permalink.js";
import { perguntasDoIdioma, VERSAO_BANCO } from "./questions.js";
import { pontuar, quadrante } from "./scoring.js";

const PERGUNTAS = perguntasDoIdioma("pt");

/** @returns {string | null} o id do quadrante, ou null se o codigo nao vale */
export function quadranteDoCodigo(codigo) {
  const respostas = decodificar(PERGUNTAS, codigo, VERSAO_BANCO);
  if (!respostas) return null;
  return quadrante(pontuar(PERGUNTAS, respostas));
}
