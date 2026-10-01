// O card de compartilhar, desenhado em Canvas 2D, sem dependencia.
//
// Tres formatos: "quadrado" (1080x1080, WhatsApp e feed), "story" (1080x1920,
// Instagram e status) e "minimo" (1080x1080, so a frase e a bussola). Tema
// claro, igual ao site (mockup aprovado em 2026-10-01).
//
// GOTCHA herdado do BBB: FUNDO SEMPRE SOLIDO. Transparencia vira preto no
// Instagram.
//
// A frase do resultado e as leituras vem das MESMAS funcoes da tela
// (lib/manchete.js), para o card nunca dizer outra coisa que o site.

import { EIXOS, EIXOS_PRINCIPAIS } from "./scoring.js";
import { intensidade, partesDaManchete } from "./manchete.js";
import { numSinal, t } from "./i18n.js";
import { lugarDaEtiqueta } from "./compass.js";

export const LAYOUTS = ["quadrado", "story", "minimo"];

const TAMANHOS = {
  quadrado: { largura: 1080, altura: 1080 },
  story: { largura: 1080, altura: 1920 },
  minimo: { largura: 1080, altura: 1080 },
};

const FONTE_UI = '-apple-system, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONTE_TEXTO = 'Georgia, "Times New Roman", serif';

// O card e imagem: vai para fora do site e nao herda o CSS de ninguem. Por
// isso as cores sao fixas aqui, e e a unica excecao a regra de "nunca cor a
// mao". Sao os tokens do index.css convertidos de OKLCH para sRGB. A imagem
// de previa de link (lib/previaImagem.js) usa as mesmas.
export const COR = {
  fundo: "#fbfaf8",
  painel: "#ffffff",
  linha: "#dfdeda",
  linhaForte: "#bfbeb9",
  tinta: "#181b1e",
  tintaMedia: "#5b5e62",
  quadrantes: {
    "igualdade-liberdade": "#41b875",
    "igualdade-autoridade": "#db8925",
    "mercado-liberdade": "#41a6f2",
    "mercado-autoridade": "#d579c2",
  },
};

const fonte = (peso, tamanho, familia = FONTE_UI) => `${peso} ${tamanho}px ${familia}`;

function comAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

function retanguloRedondo(ctx, x, y, largura, altura, raio) {
  const r = Math.max(0, Math.min(raio, largura / 2, altura / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + largura, y, x + largura, y + altura, r);
  ctx.arcTo(x + largura, y + altura, x, y + altura, r);
  ctx.arcTo(x, y + altura, x, y, r);
  ctx.arcTo(x, y, x + largura, y, r);
  ctx.closePath();
}

/** Quebra o texto em linhas que cabem na largura, encolhendo se passar do maximo. */
function quebrar(ctx, texto, largura, tamanho, peso, maxLinhas) {
  for (let t = tamanho; t >= 28; t -= 4) {
    ctx.font = fonte(peso, t);
    const linhas = [];
    let atual = "";
    for (const palavra of texto.split(" ")) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (ctx.measureText(tentativa).width <= largura || !atual) atual = tentativa;
      else {
        linhas.push(atual);
        atual = palavra;
      }
    }
    linhas.push(atual);
    if (linhas.length <= maxLinhas) return { linhas, tamanho: t };
  }
  return { linhas: [texto], tamanho: 28 };
}

export function frase(resultado, lang, eixosMeta) {
  const [econ, aut] = partesDaManchete(resultado, eixosMeta).map((p) =>
    t(lang, `manchete_${p.eixo}_${p.intensidade}`, t(lang, `polo_${p.polo}`)),
  );
  return t(lang, "res_manchete", econ, aut);
}

export function leitura(resultado, eixo, lang, eixosMeta) {
  const { posicao } = resultado[eixo];
  const polo = t(lang, `polo_${posicao > 0 ? eixosMeta[eixo].pos : eixosMeta[eixo].neg}`);
  return t(lang, `leitura_${intensidade(posicao)}`, polo);
}

/**
 * A bussola, igual a do site: quadrantes em degrade, nome de cada quadrante,
 * polos na horizontal dentro do grafico, a margem de erro e o ponto. Sem os
 * numeros da escala: no card eles so poluiriam.
 * `lado` e o tamanho do QUADRADO do grafico; `e` e a escala dos detalhes.
 */
function desenharBussola(ctx, { x, y, lado, e, resultado, quadrante, lang }) {
  const folga = 26 * e;
  const X = (v) => x + folga + ((v + 10) / 20) * lado;
  const Y = (v) => y + folga + ((10 - v) / 20) * lado;
  const cx = X(0);
  const cy = Y(0);

  ctx.save();
  retanguloRedondo(ctx, X(-10), Y(10), lado, lado, 8 * e);
  ctx.clip();
  for (const [id, qx, qy] of [
    ["igualdade-autoridade", -10, 10],
    ["mercado-autoridade", 10, 10],
    ["igualdade-liberdade", -10, -10],
    ["mercado-liberdade", 10, -10],
  ]) {
    const forte = id === quadrante;
    const g = ctx.createLinearGradient(cx, cy, X(qx), Y(qy));
    g.addColorStop(0, comAlfa(COR.quadrantes[id], forte ? 0.12 : 0.08));
    g.addColorStop(1, comAlfa(COR.quadrantes[id], forte ? 0.56 : 0.46));
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(cx, X(qx)), Math.min(cy, Y(qy)), lado / 2, lado / 2);
  }
  ctx.strokeStyle = comAlfa(COR.painel, 0.55);
  ctx.lineWidth = 1.2 * e;
  for (const v of [-7.5, -5, -2.5, 2.5, 5, 7.5]) {
    ctx.beginPath();
    ctx.moveTo(X(v), Y(10));
    ctx.lineTo(X(v), Y(-10));
    ctx.moveTo(X(-10), Y(v));
    ctx.lineTo(X(10), Y(v));
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = COR.linhaForte;
  ctx.lineWidth = 1.5 * e;
  ctx.beginPath();
  ctx.moveTo(cx, Y(10));
  ctx.lineTo(cx, Y(-10));
  ctx.moveTo(X(-10), cy);
  ctx.lineTo(X(10), cy);
  ctx.stroke();
  retanguloRedondo(ctx, X(-10), Y(10), lado, lado, 8 * e);
  ctx.lineWidth = 1.4 * e;
  ctx.stroke();

  // Nome de cada quadrante, no canto de fora.
  ctx.font = fonte(650, 9 * e);
  ctx.fillStyle = COR.tintaMedia;
  ctx.textBaseline = "alphabetic";
  const quad = (chave) => t(lang, chave).toLocaleUpperCase(lang);
  ctx.textAlign = "left";
  ctx.fillText(quad("quadrante_igualdade_autoridade"), X(-10) + 10 * e, Y(10) + 18 * e);
  ctx.fillText(quad("quadrante_igualdade_liberdade"), X(-10) + 10 * e, Y(-10) - 10 * e);
  ctx.textAlign = "right";
  ctx.fillText(quad("quadrante_mercado_autoridade"), X(10) - 10 * e, Y(10) + 18 * e);
  ctx.fillText(quad("quadrante_mercado_liberdade"), X(10) - 10 * e, Y(-10) - 10 * e);

  // Os quatro polos, dentro do grafico, na horizontal. Os retangulos ficam
  // guardados para a etiqueta "Voce" nao cair em cima de nenhum deles.
  const ocupados = [];
  const pilula = (texto, px, py, ancora) => {
    ctx.font = fonte(700, 12 * e);
    const largura = ctx.measureText(texto).width + 16 * e;
    const x0 = ancora === "inicio" ? px : ancora === "fim" ? px - largura : px - largura / 2;
    ocupados.push({ x: x0, y: py - 12 * e, w: largura, h: 18.5 * e });
    ctx.fillStyle = comAlfa(COR.painel, 0.92);
    retanguloRedondo(ctx, x0, py - 12 * e, largura, 18.5 * e, 9.25 * e);
    ctx.fill();
    ctx.fillStyle = COR.tinta;
    ctx.textAlign = "center";
    ctx.fillText(texto, x0 + largura / 2, py + 1.5 * e);
  };
  pilula(`↑ ${t(lang, "polo_autoridade")}`, cx, Y(10) + 34 * e, "meio");
  pilula(`↓ ${t(lang, "polo_liberdade")}`, cx, Y(-10) - 26 * e, "meio");
  pilula(`← ${t(lang, "polo_igualdade")}`, X(-10) + 6 * e, cy + 4 * e, "inicio");
  pilula(`${t(lang, "polo_mercado")} →`, X(10) - 6 * e, cy + 4 * e, "fim");

  // A margem de erro e o ponto.
  const vx = X(resultado.economico.posicao);
  const vy = Y(resultado.autoridade.posicao);
  const rx = Math.max((resultado.economico.margem / 20) * lado, 3 * e);
  const ry = Math.max((resultado.autoridade.margem / 20) * lado, 3 * e);
  ctx.fillStyle = comAlfa(COR.tinta, 0.07);
  ctx.beginPath();
  ctx.arc(vx, vy, Math.max(rx, ry) + 10 * e, 0, Math.PI * 2);
  ctx.fill();
  ctx.setLineDash([4 * e, 3 * e]);
  ctx.strokeStyle = comAlfa(COR.tinta, 0.7);
  ctx.lineWidth = 1.6 * e;
  ctx.beginPath();
  ctx.ellipse(vx, vy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(vx, vy, 8 * e, 0, Math.PI * 2);
  ctx.fillStyle = COR.tinta;
  ctx.fill();
  ctx.lineWidth = 3 * e;
  ctx.strokeStyle = COR.painel;
  ctx.stroke();

  // Etiqueta "Voce": a primeira das quatro posicoes em volta da margem que
  // cabe no grafico e nao encosta em nome de polo.
  ctx.font = fonte(700, 11.5 * e);
  const rotulo = t(lang, "bus_voce");
  const larguraRotulo = ctx.measureText(rotulo).width + 22 * e;
  const alturaRotulo = 21 * e;
  const { x: ex, y: ey } = lugarDaEtiqueta({
    vx, vy, rx, ry, largura: larguraRotulo, altura: alturaRotulo, folga: 6 * e,
    limites: { x0: X(-10), y0: Y(10), x1: X(10), y1: Y(-10) }, ocupados,
  });
  ctx.fillStyle = COR.tinta;
  retanguloRedondo(ctx, ex, ey, larguraRotulo, alturaRotulo, alturaRotulo / 2);
  ctx.fill();
  ctx.fillStyle = COR.fundo;
  ctx.textAlign = "center";
  ctx.fillText(rotulo, ex + larguraRotulo / 2, ey + 14.5 * e);

  ctx.textAlign = "left";
  return lado + 2 * folga;
}

/** Quadro branco em volta da bussola, como no site. */
function moldura(ctx, x, y, tamanho) {
  ctx.fillStyle = COR.painel;
  retanguloRedondo(ctx, x, y, tamanho, tamanho, 28);
  ctx.fill();
  ctx.strokeStyle = COR.linha;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function topo(ctx, { largura, margem, y, lang }) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = COR.tinta;
  ctx.font = fonte(700, 38);
  ctx.fillText(t(lang, "marca"), margem, y);
  ctx.textAlign = "right";
  ctx.fillStyle = COR.tintaMedia;
  ctx.font = fonte(700, 21);
  ctx.fillText(t(lang, "card_meu_resultado").toLocaleUpperCase(lang), largura - margem, y);
  ctx.textAlign = "left";
}

function titulo(ctx, { texto, x, y, largura, tamanho, maxLinhas, centro = false }) {
  const { linhas, tamanho: t } = quebrar(ctx, texto, largura, tamanho, 750, maxLinhas);
  ctx.font = fonte(750, t);
  ctx.fillStyle = COR.tinta;
  ctx.textAlign = centro ? "center" : "left";
  linhas.forEach((linha, i) => ctx.fillText(linha, centro ? x + largura / 2 : x, y + t + i * t * 1.06));
  ctx.textAlign = "left";
  return y + linhas.length * t * 1.06;
}

/** Rodape com o convite: e o que transforma o card num caminho para o teste. */
function convite(ctx, { largura, margem, y, lang }) {
  ctx.fillStyle = COR.tinta;
  ctx.fillRect(margem, y, largura - margem * 2, 2);
  ctx.textAlign = "left";
  ctx.font = fonte(700, 34);
  ctx.fillText(t(lang, "card_convite_titulo"), margem, y + 62);
  ctx.font = fonte(500, 27);
  ctx.fillStyle = COR.tintaMedia;
  const antes = `${t(lang, "card_convite")} `;
  ctx.fillText(antes, margem, y + 104);
  const deslocamento = ctx.measureText(antes).width;
  ctx.font = fonte(700, 27);
  ctx.fillStyle = COR.tinta;
  ctx.fillText("compass.gsromerolab.com", margem + deslocamento, y + 104);
  ctx.textAlign = "right";
  ctx.font = fonte(500, 21);
  ctx.fillStyle = COR.tintaMedia;
  const [l1, l2] = t(lang, "card_rodape").split("\n");
  ctx.fillText(l1, largura - margem, y + 66);
  ctx.fillText(l2, largura - margem, y + 96);
  ctx.textAlign = "left";
}

function destaque(ctx, { x, y, eixo, resultado, lang, eixosMeta }) {
  ctx.textAlign = "left";
  ctx.fillStyle = COR.tintaMedia;
  ctx.font = fonte(700, 20);
  ctx.fillText(t(lang, `eixo_${eixo}`).toLocaleUpperCase(lang), x, y);
  ctx.fillStyle = COR.tinta;
  ctx.font = fonte(750, 96);
  ctx.fillText(numSinal(lang, resultado[eixo].posicao), x, y + 96);
  ctx.fillStyle = COR.tintaMedia;
  ctx.font = fonte(500, 26);
  ctx.fillText(leitura(resultado, eixo, lang, eixosMeta), x, y + 136);
}

function regua(ctx, { x, y, largura, posicao, margem }) {
  const X = (v) => x + 8 + ((Math.max(-10, Math.min(10, v)) + 10) / 20) * (largura - 16);
  ctx.strokeStyle = COR.linhaForte;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + largura - 8, y);
  for (let v = -10; v <= 10; v += 2) {
    const h = v === 0 ? 9 : 4;
    ctx.moveTo(X(v), y - h);
    ctx.lineTo(X(v), y + h);
  }
  ctx.stroke();
  ctx.strokeStyle = comAlfa(COR.tinta, 0.25);
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(X(posicao - margem), y);
  ctx.lineTo(X(posicao + margem), y);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(X(posicao), y, 8, 0, Math.PI * 2);
  ctx.fillStyle = COR.tinta;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COR.painel;
  ctx.stroke();
}

/**
 * Monta o card e devolve o canvas pronto para `compartilharCanvasPng`.
 * `comTradicao`: so o Story mostra a tradicao, e so se a pessoa ligar. Um nome
 * de tradicao num card publico pode expor mais do que ela quer.
 */
export function montarCard({ resultado, quadrante, tradicao, lang, layout, eixosMeta, comTradicao = false }) {
  const formato = TAMANHOS[layout] ? layout : LAYOUTS[0];
  const { largura, altura } = TAMANHOS[formato];
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");

  // Fundo solido, sempre. Ver o gotcha no topo do arquivo.
  ctx.fillStyle = COR.fundo;
  ctx.fillRect(0, 0, largura, altura);
  const texto = frase(resultado, lang, eixosMeta);
  const comum = { resultado, quadrante, lang };

  if (formato === "minimo") {
    const margem = 72;
    titulo(ctx, { texto, x: margem, y: 60, largura: largura - margem * 2, tamanho: 58, maxLinhas: 2, centro: true });
    const lado = 640;
    const tamanho = lado + 2 * 26 * 1.7;
    desenharBussola(ctx, { x: (largura - tamanho) / 2, y: 240, lado, e: 1.7, ...comum });
    ctx.textAlign = "center";
    ctx.font = fonte(500, 28);
    ctx.fillStyle = COR.tintaMedia;
    ctx.fillText(`${t(lang, "marca")} · ${t(lang, "card_minimo_convite")} compass.gsromerolab.com`, largura / 2, altura - 62);
    ctx.textAlign = "left";
    return canvas;
  }

  if (formato === "story") {
    // Montado de BAIXO PARA CIMA: o convite fica preso no fim, a tradicao (se
    // ligada) logo acima, as reguas acima dela, e a bussola ocupa o espaco que
    // sobrar entre a frase e as reguas. Com posicoes fixas de cima para baixo,
    // uma frase de tres linhas empurrava tudo e a tradicao caia em cima do
    // convite (aconteceu no ar, com "Levemente a Esquerda e um pouco para...").
    const margem = 80;
    const ALTURA_LINHA = 78;
    const ALTURA_TRADICAO = 96;
    const mostraTradicao = comTradicao && tradicao;

    const yConvite = altura - 88 - 120;
    const yTradicao = yConvite - 34 - ALTURA_TRADICAO;
    const fimReguas = mostraTradicao ? yTradicao - 26 : yConvite - 34;
    const yReguas = fimReguas - EIXOS.length * ALTURA_LINHA;

    topo(ctx, { largura, margem, y: 130, lang });
    const fimTitulo = titulo(ctx, { texto, x: margem, y: 168, largura: largura - margem * 2, tamanho: 84, maxLinhas: 3 });

    // A bussola cabe no que sobrou, ate 760 de caixa; a escala dos detalhes
    // acompanha o tamanho para os rotulos nao ficarem desproporcionais.
    const espaco = yReguas - 30 - (fimTitulo + 36);
    const caixa = Math.min(760, espaco);
    const e = (1.7 * caixa) / 760;
    const lado = caixa - 32 - 2 * 26 * e;
    const yCaixa = fimTitulo + 36 + (espaco - caixa) / 2;
    moldura(ctx, (largura - caixa) / 2, yCaixa, caixa);
    desenharBussola(ctx, { x: (largura - caixa) / 2 + 16, y: yCaixa + 16, lado, e, ...comum });

    // Os seis eixos em reguas.
    let y = yReguas;
    for (const eixo of EIXOS) {
      const { posicao, margem: m } = resultado[eixo];
      const polo = t(lang, `polo_${posicao > 0 ? eixosMeta[eixo].pos : eixosMeta[eixo].neg}`);
      ctx.fillStyle = COR.tintaMedia;
      ctx.font = fonte(700, 19);
      ctx.textAlign = "left";
      ctx.fillText(t(lang, `eixo_${eixo}`).toLocaleUpperCase(lang), margem, y + 26);
      ctx.fillStyle = COR.tinta;
      ctx.font = fonte(650, 25);
      ctx.fillText(intensidade(posicao) === "centro" ? t(lang, "leitura_centro") : polo, margem, y + 56);
      regua(ctx, { x: margem + 270, y: y + 38, largura: 520, posicao, margem: m });
      ctx.textAlign = "right";
      ctx.font = fonte(750, 36);
      ctx.fillText(numSinal(lang, posicao), largura - margem, y + 50);
      ctx.fillStyle = COR.linha;
      ctx.fillRect(margem, y + 76, largura - margem * 2, 2);
      y += ALTURA_LINHA;
    }
    ctx.textAlign = "left";

    if (mostraTradicao) {
      ctx.fillStyle = COR.painel;
      retanguloRedondo(ctx, margem, yTradicao, largura - margem * 2, ALTURA_TRADICAO, 24);
      ctx.fill();
      ctx.strokeStyle = COR.linha;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = fonte(500, 24);
      ctx.fillStyle = COR.tintaMedia;
      ctx.fillText(t(lang, "card_tradicao"), margem + 30, yTradicao + 58);
      // O nome encolhe se for longo, para nunca encostar no rotulo.
      const nome = tradicao.nome[lang] ?? tradicao.nome.pt;
      const larguraNome = largura - margem * 2 - 60 - ctx.measureText(t(lang, "card_tradicao")).width - 30;
      let tam = 34;
      ctx.font = fonte(700, tam, FONTE_TEXTO);
      while (ctx.measureText(nome).width > larguraNome && tam > 20) {
        tam -= 2;
        ctx.font = fonte(700, tam, FONTE_TEXTO);
      }
      ctx.textAlign = "right";
      ctx.fillStyle = COR.tinta;
      ctx.fillText(nome, largura - margem - 30, yTradicao + 60);
      ctx.textAlign = "left";
    }

    convite(ctx, { largura, margem, y: yConvite, lang });
    return canvas;
  }

  // quadrado
  const margem = 72;
  topo(ctx, { largura, margem, y: 104, lang });
  const fimTitulo = titulo(ctx, { texto, x: margem, y: 130, largura: largura - margem * 2, tamanho: 70, maxLinhas: 2 });
  const lado = 420;
  const tamanho = lado + 2 * 26 * 1.3;
  const caixa = tamanho + 28;
  const yCaixa = Math.max(fimTitulo + 34, 320);
  moldura(ctx, margem, yCaixa, caixa);
  desenharBussola(ctx, { x: margem + 14, y: yCaixa + 14, lado, e: 1.3, ...comum });
  const xDestaques = margem + caixa + 48;
  const meio = yCaixa + caixa / 2;
  EIXOS_PRINCIPAIS.forEach((eixo, i) =>
    destaque(ctx, { x: xDestaques, y: meio - 150 + i * 200, eixo, resultado, lang, eixosMeta }),
  );
  convite(ctx, { largura, margem, y: altura - 72 - 122, lang });
  return canvas;
}
