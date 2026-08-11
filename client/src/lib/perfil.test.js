// O radar de perfil so e honesto por causa de uma propriedade: os dois polos
// do mesmo eixo ficam a 180 graus um do outro, e cada eixo desenha UMA petala.
//
// Sem isso, acontece o que acontece no radar de politica mais conhecido que
// circula por ai: "esquerda" e "direita" viram pontas independentes e o mesmo
// candidato aparece esticado para os dois lados ao mesmo tempo. Estes testes
// existem para esse erro nao entrar aqui sem alguem perceber.

import { describe, expect, it } from "vitest";
import { DIRECAO, PASSO, petala, petalasDoResultado, polar } from "./perfil.js";
import { EIXOS } from "./scoring.js";

const resultadoDe = (posicoes, margem = 1) =>
  Object.fromEntries(
    EIXOS.map((eixo) => [eixo, { posicao: posicoes[eixo] ?? 0, margem, n: 8 }]),
  );

describe("as direcoes dos polos", () => {
  it("todo eixo tem os dois polos, e nenhuma direcao se repete", () => {
    for (const eixo of EIXOS) {
      expect(DIRECAO[`${eixo}:pos`], `${eixo} sem polo positivo`).toBeTypeOf("number");
      expect(DIRECAO[`${eixo}:neg`], `${eixo} sem polo negativo`).toBeTypeOf("number");
    }
    const usadas = Object.values(DIRECAO);
    expect(new Set(usadas).size).toBe(usadas.length);
    expect(usadas.length).toBe(EIXOS.length * 2);
  });

  it("os dois polos do mesmo eixo ficam exatamente opostos", () => {
    // A propriedade que impede a figura de mentir.
    for (const eixo of EIXOS) {
      const diferenca = Math.abs(DIRECAO[`${eixo}:pos`] - DIRECAO[`${eixo}:neg`]);
      expect(diferenca * PASSO, `${eixo} nao esta a 180 graus`).toBe(180);
    }
  });

  it("autoridade fica em cima e direita fica a direita, iguais a bussola", () => {
    // As duas figuras aparecem na mesma tela: se discordarem de orientacao, a
    // pessoa le uma delas errado.
    const cima = polar(0, 0, 10, DIRECAO["autoridade:pos"] * PASSO, 1);
    expect(cima.x).toBeCloseTo(0);
    expect(cima.y).toBeCloseTo(-10);

    const direita = polar(0, 0, 10, DIRECAO["economico:pos"] * PASSO, 1);
    expect(direita.x).toBeCloseTo(10);
    expect(direita.y).toBeCloseTo(0);
  });
});

describe("as petalas", () => {
  it("cada eixo gera uma petala so, do lado em que a pessoa pende", () => {
    const petalas = petalasDoResultado(resultadoDe({ economico: -8, autoridade: 6 }));
    expect(petalas).toHaveLength(EIXOS.length);

    const economico = petalas.find((p) => p.eixo === "economico");
    expect(economico.indice).toBe(DIRECAO["economico:neg"]);
    expect(economico.forca).toBeCloseTo(0.8);

    const autoridade = petalas.find((p) => p.eixo === "autoridade");
    expect(autoridade.indice).toBe(DIRECAO["autoridade:pos"]);
    expect(autoridade.forca).toBeCloseTo(0.6);
  });

  it("duas pessoas opostas viram formas espelhadas", () => {
    const esquerda = petalasDoResultado(resultadoDe({ economico: -7 }));
    const direita = petalasDoResultado(resultadoDe({ economico: 7 }));
    const e = esquerda.find((p) => p.eixo === "economico");
    const d = direita.find((p) => p.eixo === "economico");

    expect(e.forca).toBeCloseTo(d.forca);
    expect(Math.abs(e.indice - d.indice) * PASSO).toBe(180);
  });

  it("conviccao forte da petala grande, e o centro fica para quem nao pende", () => {
    const forte = petalasDoResultado(resultadoDe({ costumes: 10 }));
    const fraco = petalasDoResultado(resultadoDe({ costumes: 1 }));
    expect(forte.find((p) => p.eixo === "costumes").forca).toBeCloseTo(1);
    expect(fraco.find((p) => p.eixo === "costumes").forca).toBeCloseTo(0.1);
  });

  it("a margem so vaza para o lado oposto quando ela ultrapassa a posicao", () => {
    // E o unico caso em que os dois lados aparecem, e ele significa exatamente
    // "nem de que lado desse eixo voce esta ficou definido".
    const claro = petalasDoResultado(resultadoDe({ ecologia: -6 }, 2));
    expect(claro.find((p) => p.eixo === "ecologia").vazamento).toBe(0);

    const duvidoso = petalasDoResultado(resultadoDe({ ecologia: -1 }, 4));
    expect(duvidoso.find((p) => p.eixo === "ecologia").vazamento).toBeCloseTo(0.3);
  });

  it("a petala nunca passa do anel de fora, por mais incerto que seja", () => {
    for (const p of petalasDoResultado(resultadoDe({ povo: 9 }, 10))) {
      expect(p.forca).toBeLessThanOrEqual(1);
      expect(p.limite).toBeLessThanOrEqual(1);
    }
  });

  it("quem nao pende para lado nenhum nao ganha petala", () => {
    for (const p of petalasDoResultado(resultadoDe({}, 0))) {
      expect(p.forca).toBe(0);
    }
  });
});

describe("o desenho da petala", () => {
  it("sai do centro, alarga e fecha na ponta", () => {
    const pontos = petala(50, 50, 30, DIRECAO["autoridade:pos"], 1);
    expect(pontos).toHaveLength(4);
    expect(pontos[0]).toEqual({ x: 50, y: 50 });
    // A ponta e o ponto mais distante do centro.
    const dist = (p) => Math.hypot(p.x - 50, p.y - 50);
    expect(dist(pontos[2])).toBeGreaterThan(dist(pontos[1]));
    expect(dist(pontos[2])).toBeGreaterThan(dist(pontos[3]));
    expect(dist(pontos[2])).toBeCloseTo(30);
  });

  it("petala de forca zero colapsa no centro", () => {
    for (const p of petala(50, 50, 30, 0, 0)) {
      expect(p.x).toBeCloseTo(50);
      expect(p.y).toBeCloseTo(50);
    }
  });
});
