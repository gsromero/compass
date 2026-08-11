// O gesto e a parte do sistema que quebraria em silencio: ninguem percebe que
// arrastar parou de responder direito ate alguem reclamar. Por isso a decisao
// mora numa funcao pura, e por isso ela tem teste.

import { describe, expect, it } from "vitest";
import { LIMIARES, intencaoDoArrasto, progressoDoArrasto } from "./gesto.js";
import { RESPOSTAS } from "./scoring.js";

const LARGURA = 400;
const fracao = (f) => f * LARGURA;

describe("o que o arrasto responde", () => {
  it("arrasto curto nao responde nada: o cartao so volta para o lugar", () => {
    expect(intencaoDoArrasto(fracao(0.02), 0, LARGURA)).toBeNull();
    expect(intencaoDoArrasto(fracao(-0.02), 0, LARGURA)).toBeNull();
    expect(intencaoDoArrasto(0, 0, LARGURA)).toBeNull();
  });

  it("arrasto medio para a direita concorda; longo concorda muito", () => {
    expect(intencaoDoArrasto(fracao(0.15), 0, LARGURA)).toBe(1);
    expect(intencaoDoArrasto(fracao(0.5), 0, LARGURA)).toBe(2);
  });

  it("para a esquerda e espelhado", () => {
    expect(intencaoDoArrasto(fracao(-0.15), 0, LARGURA)).toBe(-1);
    expect(intencaoDoArrasto(fracao(-0.5), 0, LARGURA)).toBe(-2);
  });

  it("so devolve respostas que existem na escala", () => {
    for (const f of [-0.9, -0.5, -0.2, -0.1, 0.1, 0.2, 0.5, 0.9]) {
      const intencao = intencaoDoArrasto(fracao(f), 0, LARGURA);
      expect(RESPOSTAS, `fracao ${f}`).toContain(intencao);
    }
  });

  it("arrastar alem do limite nao inventa uma quinta resposta", () => {
    expect(intencaoDoArrasto(fracao(5), 0, LARGURA)).toBe(2);
    expect(intencaoDoArrasto(fracao(-5), 0, LARGURA)).toBe(-2);
  });
});

describe("os limiares nao dependem do tamanho da tela", () => {
  it("a mesma fracao da a mesma resposta em qualquer largura", () => {
    // Se os limiares fossem em pixels, o mesmo gesto responderia uma coisa no
    // celular e outra no monitor.
    for (const largura of [280, 375, 768, 1200]) {
      expect(intencaoDoArrasto(largura * 0.15, 0, largura), `largura ${largura}`).toBe(1);
      expect(intencaoDoArrasto(largura * 0.5, 0, largura), `largura ${largura}`).toBe(2);
      expect(intencaoDoArrasto(largura * 0.02, 0, largura), `largura ${largura}`).toBeNull();
    }
  });
});

describe("rolar a pagina nao responde", () => {
  it("movimento predominantemente vertical e ignorado", () => {
    // A tela do teste rola 57px num iPhone SE. Sem isto, rolar responderia.
    expect(intencaoDoArrasto(fracao(0.2), 300, LARGURA)).toBeNull();
    expect(intencaoDoArrasto(fracao(-0.2), -300, LARGURA)).toBeNull();
  });

  it("um desvio pequeno no dedo nao atrapalha", () => {
    // Ninguem arrasta em linha reta perfeita.
    expect(intencaoDoArrasto(fracao(0.5), 20, LARGURA)).toBe(2);
    expect(intencaoDoArrasto(fracao(0.5), -20, LARGURA)).toBe(2);
  });
});

describe("entradas estranhas nao quebram a tela", () => {
  it.each([
    ["largura zero", 100, 0, 0],
    ["largura negativa", 100, 0, -50],
    ["dx invalido", NaN, 0, LARGURA],
    ["dy invalido", 100, NaN, LARGURA],
  ])("%s devolve null", (_nome, dx, dy, largura) => {
    expect(intencaoDoArrasto(dx, dy, largura)).toBeNull();
  });

  it("progresso com largura invalida devolve zero", () => {
    expect(progressoDoArrasto(100, 0)).toBe(0);
    expect(progressoDoArrasto(NaN, LARGURA)).toBe(0);
  });
});

describe("o retorno visual", () => {
  it("cresce com o arrasto e satura no ponto do 'muito'", () => {
    expect(progressoDoArrasto(0, LARGURA)).toBe(0);
    expect(progressoDoArrasto(fracao(LIMIARES.forte / 2), LARGURA)).toBeCloseTo(0.5);
    expect(progressoDoArrasto(fracao(LIMIARES.forte), LARGURA)).toBeCloseTo(1);
    expect(progressoDoArrasto(fracao(3), LARGURA)).toBe(1);
  });

  it("o sinal acompanha a direcao", () => {
    expect(progressoDoArrasto(fracao(-0.2), LARGURA)).toBeLessThan(0);
    expect(progressoDoArrasto(fracao(0.2), LARGURA)).toBeGreaterThan(0);
  });

  it("satura exatamente onde a resposta vira 'muito'", () => {
    // O rotulo na tela e a resposta que sera dada tem que trocar no mesmo
    // ponto, senao o cartao promete uma coisa e entrega outra.
    const noLimite = fracao(LIMIARES.forte);
    expect(Math.abs(progressoDoArrasto(noLimite, LARGURA))).toBeCloseTo(1);
    expect(intencaoDoArrasto(noLimite, 0, LARGURA)).toBe(2);
    expect(intencaoDoArrasto(noLimite - 1, 0, LARGURA)).toBe(1);
  });
});
