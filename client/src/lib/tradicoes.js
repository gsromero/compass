import banco from "../data/tradicoes.json";
import { distancia } from "./compass.js";
import { EIXOS } from "./scoring.js";

export const TRADICOES = banco.tradicoes;

export function tradicaoPorId(id) {
  return TRADICOES.find((tradicao) => tradicao.id === id);
}

/**
 * As tradicoes mais proximas do resultado, medindo nos SEIS eixos e nao so nos
 * dois do grafico: e o que evita dizer que alguem e conservador so porque caiu
 * no quadrante de cima, ignorando o que pensa sobre meio ambiente e fronteiras.
 */
export function maisProximas(resultado, quantas = 3) {
  const posicao = Object.fromEntries(EIXOS.map((eixo) => [eixo, resultado[eixo].posicao]));
  return TRADICOES.map((tradicao) => ({
    tradicao,
    distancia: distancia(posicao, tradicao.eixos, EIXOS),
  }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, quantas);
}
