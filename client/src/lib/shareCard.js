// Card 1080x1080 do resultado, para redes sociais.
// Desenho 100% Canvas 2D, sem dependencia. Mesmo padrao do BBB.
//
// GOTCHA herdado do BBB, e que vale de novo aqui: FUNDO SEMPRE SOLIDO.
// Transparencia vira preto no Instagram.
//
// A geometria da bussola vem de lib/compass.js, a mesma que a tela usa, para
// o card e o site nunca mostrarem posicoes diferentes.

import { linhasDaGrade, paraCoordenada, paraRaios } from "./compass.js";
import { EIXOS } from "./scoring.js";
import { t } from "./i18n.js";

const LADO = 1080;
const FONTE_UI =
  '-apple-system, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONTE_TEXTO = 'Georgia, "Times New Roman", serif';

export const LAYOUTS = ["classico", "cartaz", "minimo"];

// O card e imagem: ela vai para fora do site e nao herda o tema de ninguem.
// Por isso as cores sao fixas aqui, e nao tokens do CSS. E a unica excecao a
// regra de "nunca cor a mao", e ela existe porque o destino nao e a tela.
const TEMA = {
  fundo: "#12151a",
  painel: "#1a1f26",
  linha: "#2b323c",
  linhaForte: "#3d4653",
  tinta: "#eef2f6",
  tintaMedia: "#9aa6b4",
  quadrantes: {
    "igualdade-liberdade": "#4e8f6d",
    "igualdade-autoridade": "#8f7d3f",
    "mercado-liberdade": "#4d6f9c",
    "mercado-autoridade": "#8f5a7d",
  },
};

function fonte(peso, tamanho, familia = FONTE_UI) {
  return `${peso} ${tamanho}px ${familia}`;
}

function retanguloRedondo(ctx, x, y, largura, altura, raio) {
  const r = Math.min(raio, largura / 2, altura / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + largura, y, x + largura, y + altura, r);
  ctx.arcTo(x + largura, y + altura, x, y + altura, r);
  ctx.arcTo(x, y + altura, x, y, r);
  ctx.arcTo(x, y, x + largura, y, r);
  ctx.closePath();
}

function encolherPara(ctx, texto, larguraMax, tamanhoBase, peso, familia) {
  let tamanho = tamanhoBase;
  while (tamanho > 16) {
    ctx.font = fonte(peso, tamanho, familia);
    if (ctx.measureText(texto).width <= larguraMax) break;
    tamanho -= 2;
  }
  return tamanho;
}

/** Desenha a bussola dentro de um quadrado de lado `tamanho` em (x, y). */
function desenharBussola(ctx, { x, y, tamanho, resultado, quadrante, lang }) {
  const borda = tamanho * 0.1;
  const fim = tamanho - borda;
  const meio = tamanho / 2;

  ctx.save();
  ctx.translate(x, y);

  const cantos = [
    { id: "igualdade-autoridade", cx: borda, cy: borda },
    { id: "mercado-autoridade", cx: meio, cy: borda },
    { id: "igualdade-liberdade", cx: borda, cy: meio },
    { id: "mercado-liberdade", cx: meio, cy: meio },
  ];
  for (const canto of cantos) {
    ctx.globalAlpha = canto.id === quadrante ? 0.4 : 0.28;
    ctx.fillStyle = TEMA.quadrantes[canto.id];
    ctx.fillRect(canto.cx, canto.cy, meio - borda, meio - borda);
  }
  ctx.globalAlpha = 1;

  for (const linha of linhasDaGrade(tamanho)) {
    ctx.strokeStyle = linha.central ? TEMA.linhaForte : TEMA.linha;
    ctx.lineWidth = linha.central ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(linha.pos, borda);
    ctx.lineTo(linha.pos, fim);
    ctx.moveTo(borda, linha.pos);
    ctx.lineTo(fim, linha.pos);
    ctx.stroke();
  }

  const ponto = paraCoordenada(resultado.economico.posicao, resultado.autoridade.posicao, tamanho);
  const raios = paraRaios(resultado.economico.margem, resultado.autoridade.margem, tamanho);

  ctx.beginPath();
  ctx.ellipse(ponto.x, ponto.y, raios.rx, raios.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = TEMA.tinta;
  ctx.globalAlpha = 0.16;
  ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = TEMA.tinta;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(ponto.x, ponto.y, tamanho * 0.018, 0, Math.PI * 2);
  ctx.fillStyle = TEMA.tinta;
  ctx.fill();

  // Sem rotulo o card vira um ponto num quadrado: no feed de alguem, quem ve
  // nao tem o resto da pagina para deduzir o que cada eixo significa.
  ctx.font = fonte(600, tamanho * 0.036);
  ctx.fillStyle = TEMA.tintaMedia;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(t(lang, "polo_autoridade"), meio, borda - tamanho * 0.028);
  ctx.fillText(t(lang, "polo_liberdade"), meio, fim + tamanho * 0.06);

  ctx.save();
  ctx.translate(borda - tamanho * 0.035, meio);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t(lang, "polo_igualdade"), 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(fim + tamanho * 0.045, meio);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(t(lang, "polo_mercado"), 0, 0);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.restore();
}

function desenharBarras(ctx, { x, y, largura, resultado, lang, eixosMeta }) {
  const secundarios = EIXOS.filter((e) => e !== "economico" && e !== "autoridade");
  const alturaLinha = 62;

  secundarios.forEach((eixo, i) => {
    const topo = y + i * alturaLinha;
    const dados = resultado[eixo];
    const meta = eixosMeta[eixo];

    ctx.font = fonte(600, 19);
    ctx.fillStyle = TEMA.tintaMedia;
    ctx.textAlign = "left";
    ctx.fillText(t(lang, `polo_${meta.neg}`), x, topo);
    ctx.textAlign = "right";
    ctx.fillText(t(lang, `polo_${meta.pos}`), x + largura, topo);

    const trilhoY = topo + 14;
    const trilhoAltura = 12;
    ctx.fillStyle = TEMA.painel;
    retanguloRedondo(ctx, x, trilhoY, largura, trilhoAltura, 6);
    ctx.fill();

    ctx.strokeStyle = TEMA.linha;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + largura / 2, trilhoY);
    ctx.lineTo(x + largura / 2, trilhoY + trilhoAltura);
    ctx.stroke();

    const posX = x + ((dados.posicao + 10) / 20) * largura;
    const margemLargura = Math.max((dados.margem / 20) * largura * 2, 8);
    ctx.fillStyle = TEMA.tintaMedia;
    ctx.globalAlpha = 0.35;
    retanguloRedondo(
      ctx,
      Math.max(x, posX - margemLargura / 2),
      trilhoY,
      Math.min(margemLargura, largura),
      trilhoAltura,
      6,
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = TEMA.tinta;
    retanguloRedondo(ctx, posX - 3, trilhoY - 3, 6, trilhoAltura + 6, 3);
    ctx.fill();
  });

  ctx.textAlign = "left";
  return secundarios.length * alturaLinha;
}

/**
 * Monta o card e devolve o canvas pronto para `compartilharCanvasPng`.
 * @param {object} opcoes resultado, quadrante, tradicao, lang, layout, eixosMeta
 */
export function montarCard({ resultado, quadrante, tradicao, lang, layout, eixosMeta }) {
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d");

  // Fundo solido, sempre. Ver o gotcha no topo do arquivo.
  ctx.fillStyle = TEMA.fundo;
  ctx.fillRect(0, 0, LADO, LADO);

  const margem = 72;
  const larguraUtil = LADO - margem * 2;

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = fonte(700, 30);
  ctx.fillStyle = TEMA.tinta;
  ctx.fillText(t(lang, "marca"), margem, margem + 24);

  ctx.font = fonte(500, 20);
  ctx.fillStyle = TEMA.tintaMedia;
  ctx.textAlign = "right";
  ctx.fillText("compass.gsromerolab.com", LADO - margem, margem + 24);
  ctx.textAlign = "left";

  if (layout === "minimo") {
    desenharBussola(ctx, {
      x: margem,
      y: 190,
      tamanho: larguraUtil,
      resultado,
      quadrante,
      lang,
    });
    escreverAssinatura(ctx, { lang, tradicao, y: LADO - margem - 10, margem });
    return canvas;
  }

  if (layout === "cartaz") {
    const nome = tradicao ? tradicao.nome[lang] : t(lang, "res_titulo");
    const tamanho = encolherPara(ctx, nome, larguraUtil, 68, 700, FONTE_TEXTO);
    ctx.font = fonte(700, tamanho, FONTE_TEXTO);
    ctx.fillStyle = TEMA.tinta;
    ctx.fillText(nome, margem, 250);

    ctx.font = fonte(500, 22);
    ctx.fillStyle = TEMA.tintaMedia;
    ctx.fillText(t(lang, "res_tradicoes"), margem, 200);

    desenharBussola(ctx, {
      x: LADO / 2 - 260,
      y: 300,
      tamanho: 520,
      resultado,
      quadrante,
      lang,
    });
    escreverAssinatura(ctx, { lang, tradicao: null, y: LADO - margem - 10, margem });
    return canvas;
  }

  // classico: bussola em cima, quatro eixos secundarios embaixo
  desenharBussola(ctx, { x: LADO / 2 - 235, y: 150, tamanho: 470, resultado, quadrante, lang });

  const barrasY = 690;
  desenharBarras(ctx, {
    x: margem,
    y: barrasY,
    largura: larguraUtil,
    resultado,
    lang,
    eixosMeta,
  });

  escreverAssinatura(ctx, { lang, tradicao, y: LADO - margem + 6, margem });
  return canvas;
}

function escreverAssinatura(ctx, { lang, tradicao, y, margem }) {
  // Cada funcao de desenho reposiciona o que usa, em vez de confiar no estado
  // que a anterior deixou. Sem esta linha a assinatura saia centralizada em
  // x=margem e vazava pela borda esquerda do card.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (tradicao) {
    ctx.font = fonte(500, 20);
    ctx.fillStyle = TEMA.tintaMedia;
    ctx.fillText(t(lang, "res_tradicoes"), margem, y - 30);
    ctx.font = fonte(650, 30, FONTE_TEXTO);
    ctx.fillStyle = TEMA.tinta;
    ctx.fillText(tradicao.nome[lang], margem, y);
  } else {
    ctx.font = fonte(500, 20);
    ctx.fillStyle = TEMA.tintaMedia;
    ctx.fillText(t(lang, "tagline"), margem, y);
  }
}
