// Gera client/public/og.png, a previa geral do site, com o mesmo desenho das
// previas de resultado (lib/previaImagem.js) e a mesma fonte.
// Rodar: npm run og:geral (so quando mudar o desenho ou o texto).
import { readFileSync, writeFileSync } from "node:fs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { svgGeral, FONTE } from "../client/src/lib/previaImagem.js";

const raiz = new URL("../", import.meta.url);
await initWasm(readFileSync(new URL("node_modules/@resvg/resvg-wasm/index_bg.wasm", raiz)));
const fontes = ["500", "700", "800"].map((peso) =>
  readFileSync(new URL(`client/public/og/fontes/inter-${peso}.ttf`, raiz)),
);
const png = new Resvg(svgGeral("pt"), {
  font: { fontBuffers: fontes, defaultFontFamily: FONTE },
}).render().asPng();
writeFileSync(new URL("client/public/og.png", raiz), png);
console.log("client/public/og.png", png.length, "bytes");
