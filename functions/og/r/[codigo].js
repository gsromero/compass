// GET /og/r/:codigo.png
// A imagem de previa de um link de resultado, desenhada na hora com o
// resultado de verdade da pessoa: a frase, os dois numeros e a bussola com o
// ponto e a margem de erro. functions/resultado/[codigo].js aponta o og:image
// para ca.
//
// O desenho e o mesmo SVG para qualquer um (lib/previaImagem.js); o resvg
// (WebAssembly) transforma em PNG. A fonte Inter vem dos arquivos estaticos do
// site, e nao do bundle, para a Function continuar pequena.
//
// O codigo determina o resultado para sempre, entao a imagem vai para o cache
// da Cloudflare e o navegador pode guardar por um ano: cada link e desenhado
// uma vez so por regiao. Codigo invalido: redireciona para a previa geral.

import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasm from "@resvg/resvg-wasm/index_bg.wasm";
import { resultadoDoCodigo } from "../../../client/src/lib/previa.js";
import { quadrante } from "../../../client/src/lib/scoring.js";
import { EIXOS_META } from "../../../client/src/lib/questions.js";
import { svgDoResultado, FONTE } from "../../../client/src/lib/previaImagem.js";

let pronto = null;

function preparar(env, origem) {
  pronto ??= (async () => {
    await initWasm(wasm);
    const fontes = await Promise.all(
      ["500", "700", "800"].map(async (peso) => {
        const resposta = await env.ASSETS.fetch(new URL(`/og/fontes/inter-${peso}.ttf`, origem));
        if (!resposta.ok) throw new Error(`fonte ${peso}: ${resposta.status}`);
        return new Uint8Array(await resposta.arrayBuffer());
      }),
    );
    return fontes;
  })().catch((erro) => {
    // Falhou ao preparar: a proxima requisicao tenta de novo.
    pronto = null;
    throw erro;
  });
  return pronto;
}

export async function onRequestGet({ request, env, params, waitUntil }) {
  const url = new URL(request.url);
  const codigo = String(params.codigo).replace(/\.png$/, "");

  let resultado = null;
  try {
    resultado = resultadoDoCodigo(codigo);
  } catch {
    // Qualquer surpresa na conta cai na previa geral.
  }
  if (!resultado) return Response.redirect(new URL("/og.png", url), 302);

  const cache = caches.default;
  const guardada = await cache.match(request);
  if (guardada) return guardada;

  const fontes = await preparar(env, url.origin);
  const svg = svgDoResultado({ resultado, quadrante: quadrante(resultado), lang: "pt", eixosMeta: EIXOS_META });
  const png = new Resvg(svg, { font: { fontBuffers: fontes, defaultFontFamily: FONTE } })
    .render()
    .asPng();

  const resposta = new Response(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
  waitUntil(cache.put(request, resposta.clone()));
  return resposta;
}
