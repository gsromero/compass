// Geometria do grafico. Existe para a tela de resultado e o card social nunca
// discordarem: os dois desenham a mesma bussola a partir daqui.
//
// Convencao, igual a bussola classica: o eixo economico e o horizontal, com
// igualdade a esquerda; o eixo de autoridade e o vertical, com autoridade em
// CIMA. Por isso o y e invertido.

/** Area util do desenho, em fracao do lado. O resto e margem para os rotulos. */
const ALCANCE = 0.4;

/**
 * Converte a posicao de um eixo (-10 a +10) em coordenada dentro de um quadrado.
 * @param {number} lado tamanho do quadrado, na unidade de quem chama
 */
export function paraCoordenada(economico, autoridade, lado) {
  return {
    x: lado * (0.5 + (economico / 10) * ALCANCE),
    y: lado * (0.5 - (autoridade / 10) * ALCANCE),
  };
}

/** Raios da elipse de incerteza, na mesma escala de `paraCoordenada`. */
export function paraRaios(margemEconomico, margemAutoridade, lado) {
  return {
    rx: Math.max(lado * (margemEconomico / 10) * ALCANCE, lado * 0.012),
    ry: Math.max(lado * (margemAutoridade / 10) * ALCANCE, lado * 0.012),
  };
}

/** Onde ficam as linhas da grade, incluindo os eixos centrais. */
export function linhasDaGrade(lado, passos = 4) {
  const linhas = [];
  for (let i = -passos; i <= passos; i++) {
    const fracao = 0.5 + (i / passos) * ALCANCE;
    linhas.push({ pos: lado * fracao, central: i === 0 });
  }
  return linhas;
}

/** A cor do quadrante, como variavel do design system. Nunca cor a mao. */
export function corDoQuadrante(quadrante) {
  return `var(--q-${quadrante})`;
}

/**
 * Distancia entre duas posicoes nos seis eixos, normalizada de 0 a 1.
 * E o que aproxima a pessoa das tradicoes ideologicas.
 */
export function distancia(a, b, eixos) {
  const soma = eixos.reduce((s, eixo) => s + ((a[eixo] ?? 0) - (b[eixo] ?? 0)) ** 2, 0);
  // Distancia maxima possivel: 20 de diferenca em cada um dos eixos.
  const maxima = Math.sqrt(eixos.length * 400);
  return Math.sqrt(soma) / maxima;
}
