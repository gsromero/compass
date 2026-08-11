// Geometria do perfil de seis eixos (o radar de petalas).
//
// Mora em lib/ pelo mesmo motivo que compass.js: a tela e o card social
// desenham a mesma figura, e precisam desenhar a partir da mesma fonte para
// nunca discordarem.
//
// A armadilha deste tipo de grafico, e o erro do radar de politica mais
// conhecido que circula por ai: tratar "esquerda" e "direita" como duas pontas
// INDEPENDENTES. Sao as duas pontas do MESMO eixo, entao o desenho mostra o
// mesmo candidato esticado para os dois lados ao mesmo tempo, o que nao pode
// acontecer, e o grafico vira uma mancha ilegivel.
//
// Aqui cada eixo tem UMA petala so, do tamanho da conviccao e na direcao do
// lado escolhido. Duas pessoas opostas viram formas espelhadas.

import { EIXOS } from "./scoring.js";

/**
 * Direcao de cada polo, em passos de 30 graus a partir do topo.
 *
 * A regra que nao pode quebrar: os dois polos do mesmo eixo ficam a 180 graus
 * um do outro, ou seja, a diferenca entre os indices e sempre 6. Existe teste
 * para isso, porque e essa propriedade que impede a figura de mentir.
 *
 * Autoridade em cima e Direita a direita, iguais a bussola, para as duas
 * figuras se lerem juntas.
 */
export const DIRECAO = {
  "autoridade:pos": 0,
  "fronteiras:pos": 1,
  "costumes:pos": 2,
  "economico:pos": 3,
  "ecologia:pos": 4,
  "povo:pos": 5,
  "autoridade:neg": 6,
  "fronteiras:neg": 7,
  "costumes:neg": 8,
  "economico:neg": 9,
  "ecologia:neg": 10,
  "povo:neg": 11,
};

export const PASSO = 30;
export const ANEIS = [0.25, 0.5, 0.75, 1];
// Metade da largura de cada petala. As direcoes ficam de 30 em 30 graus, entao
// 14 preenche quase todo o setor e deixa um fio de respiro entre vizinhas.
export const ABERTURA = 14;

/** Ponto em coordenadas de tela, a partir de um angulo em graus e um raio. */
export function polar(cx, cy, raio, graus, fracao) {
  const rad = (graus - 90) * (Math.PI / 180);
  const r = raio * Math.max(0, Math.min(1, fracao));
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

/**
 * Os quatro pontos de uma petala em forma de pipa: sai do centro, alarga e
 * fecha na ponta.
 */
export function petala(cx, cy, raio, indice, fracao) {
  const centro = indice * PASSO;
  return [
    { x: cx, y: cy },
    polar(cx, cy, raio, centro - ABERTURA, fracao * 0.55),
    polar(cx, cy, raio, centro, fracao),
    polar(cx, cy, raio, centro + ABERTURA, fracao * 0.55),
  ];
}

/**
 * Traduz o resultado em uma petala por eixo.
 * @returns {{eixo: string, indice: number, indiceOposto: number, forca: number, limite: number, vazamento: number}[]}
 */
export function petalasDoResultado(resultado) {
  return EIXOS.map((eixo) => {
    const { posicao, margem } = resultado[eixo];
    const lado = posicao >= 0 ? "pos" : "neg";
    const oposto = lado === "pos" ? "neg" : "pos";
    const forca = Math.abs(posicao) / 10;
    return {
      eixo,
      lado,
      indice: DIRECAO[`${eixo}:${lado}`],
      indiceOposto: DIRECAO[`${eixo}:${oposto}`],
      forca,
      limite: Math.min(1, forca + margem / 10),
      // So aparece quando a margem atravessa o zero: ai nem o lado esta claro.
      vazamento: Math.max(0, margem / 10 - forca),
    };
  });
}
