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

/**
 * Onde por a etiqueta "Voce": testa em cima a esquerda, em cima a direita,
 * embaixo a esquerda e embaixo a direita da margem de erro, e fica com a
 * primeira que cabe no grafico sem encostar em nada de `ocupados`. Sem
 * nenhuma livre, fica com a que cabe no grafico.
 */
export function lugarDaEtiqueta({ vx, vy, rx, ry, largura, altura, folga, limites, ocupados }) {
  const opcoes = [
    { x: vx - rx - largura - folga, y: vy - ry - altura },
    { x: vx + rx + folga, y: vy - ry - altura },
    { x: vx - rx - largura - folga, y: vy + ry },
    { x: vx + rx + folga, y: vy + ry },
  ];
  const cabe = (o) =>
    o.x >= limites.x0 && o.y >= limites.y0 && o.x + largura <= limites.x1 && o.y + altura <= limites.y1;
  const livre = (o) =>
    ocupados.every((r) => o.x + largura <= r.x || r.x + r.w <= o.x || o.y + altura <= r.y || r.y + r.h <= o.y);
  const prende = (o) => ({
    x: Math.min(Math.max(o.x, limites.x0), limites.x1 - largura),
    y: Math.min(Math.max(o.y, limites.y0), limites.y1 - altura),
  });
  return opcoes.find((o) => cabe(o) && livre(o)) ?? prende(opcoes.find(cabe) ?? opcoes[0]);
}

/**
 * Os pontos de quem ja respondeu, a partir dos grupos que o servidor manda
 * (posicao arredondada de 1 em 1, com a contagem). Cada pessoa vira um ponto,
 * espalhado dentro do proprio grupo para os pontos nao cairem um em cima do
 * outro. O espalhamento e fixo (sai da posicao do grupo, sem Math.random):
 * a mesma tela desenha sempre igual, e recarregar nao faz os pontos pularem.
 * @param {{e: number, a: number, n: number}[]} grupos
 * @returns {{economico: number, autoridade: number}[]}
 */
export function pontosEspalhados(grupos, raio = 0.45) {
  const pontos = [];
  for (const { e, a, n } of grupos ?? []) {
    let semente = ((e + 11) * 73856093) ^ ((a + 11) * 19349663);
    const sorteio = () => {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      return semente / 0x7fffffff;
    };
    for (let i = 0; i < n; i += 1) {
      pontos.push({
        economico: Math.max(-10, Math.min(10, e + (sorteio() * 2 - 1) * raio)),
        autoridade: Math.max(-10, Math.min(10, a + (sorteio() * 2 - 1) * raio)),
      });
    }
  }
  return pontos;
}
