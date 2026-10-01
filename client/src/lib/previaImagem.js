// A imagem de previa de link (1200x630), em SVG, para o servidor transformar
// em PNG (functions/og/r/[codigo].js, com resvg). Tambem gera a previa geral
// do site (scripts/og-geral.mjs).
//
// Modulo puro, sem DOM: roda na Function. Por isso nao ha canvas para medir
// texto, e a largura sai de uma estimativa por letra da fonte Inter, com folga.
// Cores, frase e leituras vem do card de compartilhar (lib/shareCard.js), para
// a previa nunca dizer outra coisa que a tela.

import { COR, frase, leitura } from "./shareCard.js";
import { lugarDaEtiqueta } from "./compass.js";
import { numSinal, t } from "./i18n.js";

export const LARGURA = 1200;
export const ALTURA = 630;
export const FONTE = "Inter";

const QUADRANTES = [
  ["igualdade-autoridade", -10, 10],
  ["mercado-autoridade", 10, 10],
  ["igualdade-liberdade", -10, -10],
  ["mercado-liberdade", 10, -10],
];

const esc = (texto) =>
  String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Largura aproximada de um texto em Inter. Erra para mais, de proposito. */
export function larguraTexto(texto, tamanho, peso = 700) {
  const fator = peso >= 800 ? 0.6 : peso >= 700 ? 0.58 : 0.55;
  let soma = 0;
  for (const c of texto) {
    if (" .,:;'!|il".includes(c)) soma += 0.32;
    else if ("mwMW".includes(c)) soma += 0.9;
    else if (c === c.toUpperCase() && c !== c.toLowerCase()) soma += 0.72;
    else soma += fator;
  }
  return soma * tamanho;
}

/** Quebra em ate `maxLinhas`, encolhendo a letra se precisar. */
export function quebrarTexto(texto, largura, tamanho, minimo, maxLinhas, peso = 800) {
  for (let tam = tamanho; tam >= minimo; tam -= 2) {
    const linhas = [];
    let atual = "";
    for (const palavra of texto.split(" ")) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (!atual || larguraTexto(tentativa, tam, peso) <= largura) atual = tentativa;
      else {
        linhas.push(atual);
        atual = palavra;
      }
    }
    linhas.push(atual);
    if (linhas.length <= maxLinhas) return { linhas, tamanho: tam };
  }
  return { linhas: [texto], tamanho: minimo };
}

function texto(x, y, conteudo, { tamanho, peso = 700, cor = COR.tinta, ancora = "start", espaco = 0 }) {
  return `<text x="${x}" y="${y}" font-family="${FONTE}" font-size="${tamanho}" font-weight="${peso}" fill="${cor}" text-anchor="${ancora}" letter-spacing="${espaco}">${esc(conteudo)}</text>`;
}

/**
 * A bussola, mesma receita do site e do card: quadrantes em degrade, grade,
 * nome dos quadrantes, polos em pilula e os pontos com a margem de erro.
 * `pontos`: [{ economico, autoridade, me, ma, voce }], margens na escala -10..10.
 */
function bussola({ x, y, lado, e, quadrante = null, pontos, lang }) {
  const X = (v) => x + ((v + 10) / 20) * lado;
  const Y = (v) => y + ((10 - v) / 20) * lado;
  const cx = X(0);
  const cy = Y(0);
  const raio = 8 * e;
  let s = "<defs>";
  for (const [id, qx, qy] of QUADRANTES) {
    const forte = quadrante === null || id === quadrante;
    s += `<linearGradient id="g-${id}" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${cy}" x2="${X(qx)}" y2="${Y(qy)}"><stop offset="0" stop-color="${COR.quadrantes[id]}" stop-opacity="${forte ? 0.12 : 0.06}"/><stop offset="1" stop-color="${COR.quadrantes[id]}" stop-opacity="${forte ? 0.58 : 0.3}"/></linearGradient>`;
  }
  s += `<clipPath id="recorte"><rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="${raio}"/></clipPath></defs><g clip-path="url(#recorte)">`;
  for (const [id, qx, qy] of QUADRANTES) {
    s += `<rect x="${Math.min(cx, X(qx))}" y="${Math.min(cy, Y(qy))}" width="${lado / 2}" height="${lado / 2}" fill="url(#g-${id})"/>`;
  }
  for (const v of [-7.5, -5, -2.5, 2.5, 5, 7.5]) {
    s += `<g stroke="${COR.painel}" stroke-opacity="0.55" stroke-width="${1.2 * e}"><line x1="${X(v)}" y1="${y}" x2="${X(v)}" y2="${y + lado}"/><line x1="${x}" y1="${Y(v)}" x2="${x + lado}" y2="${Y(v)}"/></g>`;
  }
  s += `</g><g stroke="${COR.linhaForte}" fill="none"><line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + lado}" stroke-width="${1.5 * e}"/><line x1="${x}" y1="${cy}" x2="${x + lado}" y2="${cy}" stroke-width="${1.5 * e}"/><rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="${raio}" stroke-width="${1.4 * e}"/></g>`;

  const quad = (chave) => t(lang, chave).toLocaleUpperCase(lang);
  const pequeno = { tamanho: 9 * e, peso: 700, cor: COR.tintaMedia, espaco: 0.4 * e };
  s += texto(x + 10 * e, y + 18 * e, quad("quadrante_igualdade_autoridade"), pequeno);
  s += texto(x + 10 * e, y + lado - 10 * e, quad("quadrante_igualdade_liberdade"), pequeno);
  s += texto(x + lado - 10 * e, y + 18 * e, quad("quadrante_mercado_autoridade"), { ...pequeno, ancora: "end" });
  s += texto(x + lado - 10 * e, y + lado - 10 * e, quad("quadrante_mercado_liberdade"), { ...pequeno, ancora: "end" });

  const ocupados = [];
  const pilula = (rotulo, px, py, ancora) => {
    const largura = larguraTexto(rotulo, 12 * e) + 16 * e;
    const x0 = ancora === "inicio" ? px : ancora === "fim" ? px - largura : px - largura / 2;
    const altura = 18.5 * e;
    ocupados.push({ x: x0, y: py - 12 * e, w: largura, h: altura });
    s += `<rect x="${x0}" y="${py - 12 * e}" width="${largura}" height="${altura}" rx="${altura / 2}" fill="${COR.painel}" fill-opacity="0.92"/>`;
    s += texto(x0 + largura / 2, py + 1.5 * e, rotulo, { tamanho: 12 * e, ancora: "middle" });
  };
  pilula(`↑ ${t(lang, "polo_autoridade")}`, cx, y + 34 * e, "meio");
  pilula(`↓ ${t(lang, "polo_liberdade")}`, cx, y + lado - 26 * e, "meio");
  pilula(`← ${t(lang, "polo_igualdade")}`, x + 6 * e, cy + 4 * e, "inicio");
  pilula(`${t(lang, "polo_mercado")} →`, x + lado - 6 * e, cy + 4 * e, "fim");

  for (const p of pontos) {
    const vx = X(p.economico);
    const vy = Y(p.autoridade);
    const rx = Math.max((p.me / 20) * lado, 3 * e);
    const ry = Math.max((p.ma / 20) * lado, 3 * e);
    s += `<circle cx="${vx}" cy="${vy}" r="${Math.max(rx, ry) + 10 * e}" fill="${COR.tinta}" fill-opacity="0.07"/>`;
    s += `<ellipse cx="${vx}" cy="${vy}" rx="${rx}" ry="${ry}" fill="none" stroke="${COR.tinta}" stroke-opacity="0.7" stroke-width="${1.6 * e}" stroke-dasharray="${4 * e} ${3 * e}"/>`;
    s += `<circle cx="${vx}" cy="${vy}" r="${8 * e}" fill="${COR.tinta}" stroke="${COR.painel}" stroke-width="${3 * e}"/>`;
    if (p.voce) {
      const rotulo = t(lang, "bus_voce");
      const largura = larguraTexto(rotulo, 11.5 * e) + 22 * e;
      const altura = 21 * e;
      const { x: ex, y: ey } = lugarDaEtiqueta({
        vx, vy, rx, ry, largura, altura, folga: 6 * e,
        limites: { x0: x, y0: y, x1: x + lado, y1: y + lado }, ocupados,
      });
      s += `<rect x="${ex}" y="${ey}" width="${largura}" height="${altura}" rx="${altura / 2}" fill="${COR.tinta}"/>`;
      s += texto(ex + largura / 2, ey + 14.5 * e, rotulo, { tamanho: 11.5 * e, cor: COR.fundo, ancora: "middle" });
    }
  }
  return s;
}

// A bussola num cartao branco a esquerda, o texto a direita.
const CAIXA = { x: 40, y: 40, tamanho: 550 };
const GRAFICO = { x: 70, y: 70, lado: 490, e: 1.55 };
const TX = 640;
const TX_FIM = 1160;

function moldura(conteudo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}"><rect width="${LARGURA}" height="${ALTURA}" fill="${COR.fundo}"/><rect x="${CAIXA.x}" y="${CAIXA.y}" width="${CAIXA.tamanho}" height="${CAIXA.tamanho}" rx="28" fill="${COR.painel}" stroke="${COR.linha}" stroke-width="1.5"/>${conteudo}</svg>`;
}

const rodape = (lang, convite) =>
  `<line x1="${TX}" y1="548" x2="${TX_FIM}" y2="548" stroke="${COR.tinta}" stroke-width="2"/>` +
  texto(TX, 590, t(lang, convite), { tamanho: 26, peso: 800 }) +
  texto(TX_FIM, 590, "compass.gsromerolab.com", { tamanho: 20, peso: 500, cor: COR.tintaMedia, ancora: "end" });

/** A previa de um resultado: a frase, os dois numeros e a bussola da pessoa. */
export function svgDoResultado({ resultado, quadrante, lang, eixosMeta }) {
  const ponto = {
    economico: resultado.economico.posicao,
    autoridade: resultado.autoridade.posicao,
    me: resultado.economico.margem,
    ma: resultado.autoridade.margem,
    voce: true,
  };
  let s = bussola({ ...GRAFICO, quadrante, pontos: [ponto], lang });
  s += texto(TX, 94, t(lang, "og_meu_resultado").toLocaleUpperCase(lang), {
    tamanho: 20, peso: 700, cor: COR.tintaMedia, espaco: 2.4,
  });
  const titulo = quebrarTexto(frase(resultado, lang, eixosMeta), TX_FIM - TX, 60, 40, 3);
  titulo.linhas.forEach((linha, i) => {
    s += texto(TX - 2, 168 + i * titulo.tamanho * 1.1, linha, { tamanho: titulo.tamanho, peso: 800, espaco: -1 });
  });
  ["economico", "autoridade"].forEach((eixo, i) => {
    const x = TX + i * 270;
    s += texto(x, 412, t(lang, `eixo_${eixo}`).toLocaleUpperCase(lang), {
      tamanho: 17, peso: 700, cor: COR.tintaMedia, espaco: 1.6,
    });
    s += texto(x - 3, 480, numSinal(lang, resultado[eixo].posicao), { tamanho: 70, peso: 800, espaco: -2 });
    s += texto(x, 512, leitura(resultado, eixo, lang, eixosMeta), { tamanho: 18, peso: 500, cor: COR.tintaMedia });
  });
  return moldura(s + rodape(lang, "og_convite"));
}

// Quatro exemplos, um em cada quadrante: a previa geral nao sugere lado.
const EXEMPLOS = [
  { economico: -5, autoridade: 4.5, me: 1.1, ma: 1.5 },
  { economico: 5.5, autoridade: 5, me: 1.4, ma: 1.1 },
  { economico: -4.5, autoridade: -5.5, me: 1.3, ma: 1.6 },
  { economico: 5, autoridade: -4.5, me: 1.5, ma: 1.2 },
];

/** A previa geral do site: "Onde voce cai?" com quatro pontos de exemplo. */
export function svgGeral(lang) {
  let s = bussola({ ...GRAFICO, pontos: EXEMPLOS, lang });
  s += texto(TX, 120, "COMPASS", { tamanho: 22, peso: 700, cor: COR.tintaMedia, espaco: 3 });
  const titulo = quebrarTexto(t(lang, "og_geral_titulo"), TX_FIM - TX, 100, 70, 2);
  titulo.linhas.forEach((linha, i) => {
    s += texto(TX - 4, 230 + i * titulo.tamanho * 1.02, linha, { tamanho: titulo.tamanho, peso: 800, espaco: -3 });
  });
  const sub = quebrarTexto(t(lang, "og_geral_sub"), TX_FIM - TX, 30, 24, 3, 500);
  sub.linhas.forEach((linha, i) => {
    s += texto(TX, 430 + i * sub.tamanho * 1.35, linha, { tamanho: sub.tamanho, peso: 500, cor: COR.tintaMedia });
  });
  return moldura(s + rodape(lang, "res_fazer_teste"));
}
