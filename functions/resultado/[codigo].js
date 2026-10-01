// GET /resultado/:codigo
// A pagina de resultado com a imagem de previa do quadrante da pessoa.
//
// O site e uma pagina so (SPA): quem decide o que mostrar e o navegador. Mas o
// robo do WhatsApp, do X e do Google nao roda o site, so le o HTML. Por isso
// esta Function devolve o mesmo index.html, trocando as tags de previa pelo
// quadrante do codigo. Codigo invalido: devolve o index.html sem mexer, e a
// tela mostra a mensagem de link quebrado como sempre.
//
// Importa do client de proposito (permalink, scoring e questions.json): a conta
// tem que ser a MESMA da tela, e sao modulos puros, sem DOM.

import { resultadoDoCodigo } from "../../client/src/lib/previa.js";
import { quadrante } from "../../client/src/lib/scoring.js";
import { EIXOS_META } from "../../client/src/lib/questions.js";
import { frase } from "../../client/src/lib/shareCard.js";

const NOMES = {
  "igualdade-liberdade": "Esquerda e Liberdade",
  "igualdade-autoridade": "Esquerda e Autoridade",
  "mercado-liberdade": "Direita e Liberdade",
  "mercado-autoridade": "Direita e Autoridade",
};

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url);
  const pagina = await env.ASSETS.fetch(new URL("/", url));

  let resultado = null;
  let quad = null;
  try {
    resultado = resultadoDoCodigo(params.codigo);
    quad = resultado ? quadrante(resultado) : null;
  } catch {
    // Qualquer surpresa na conta nao pode derrubar a pagina: fica a previa geral.
  }
  if (!quad || !NOMES[quad]) return pagina;

  // A imagem e desenhada na hora com o resultado da pessoa (functions/og/r).
  const imagem = `${url.origin}/og/r/${params.codigo}.png`;
  const titulo = `Meu resultado no Compass: ${frase(resultado, "pt", EIXOS_META)}`;
  const troca = (valor) => ({
    element(el) {
      el.setAttribute("content", valor);
    },
  });

  return new HTMLRewriter()
    .on('meta[property="og:image"]', troca(imagem))
    .on('meta[property="og:image:alt"]', troca(titulo))
    .on('meta[property="og:title"]', troca(titulo))
    .on('meta[property="og:url"]', troca(url.href))
    .transform(pagina);
}
