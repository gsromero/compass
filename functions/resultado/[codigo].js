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

import { quadranteDoCodigo } from "../../client/src/lib/previa.js";

const NOMES = {
  "igualdade-liberdade": "Esquerda e Liberdade",
  "igualdade-autoridade": "Esquerda e Autoridade",
  "mercado-liberdade": "Direita e Liberdade",
  "mercado-autoridade": "Direita e Autoridade",
};

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url);
  const pagina = await env.ASSETS.fetch(new URL("/", url));

  let quad = null;
  try {
    quad = quadranteDoCodigo(params.codigo);
  } catch {
    // Qualquer surpresa na conta nao pode derrubar a pagina: fica a previa geral.
  }
  if (!quad || !NOMES[quad]) return pagina;

  const imagem = `${url.origin}/og/${quad}.png`;
  const titulo = `Meu resultado no Compass: ${NOMES[quad]}`;
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
