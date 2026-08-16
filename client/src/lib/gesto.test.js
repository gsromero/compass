// O gesto e a parte do sistema que quebraria em silencio: ninguem percebe que
// arrastar parou de responder direito ate alguem reclamar. Por isso a decisao
// mora numa funcao pura, e por isso ela tem teste.

import { describe, expect, it } from "vitest";
import {
  LIMIARES,
  alcanceDoArrasto,
  intencaoDoArrasto,
  progressoDoArrasto,
} from "./gesto.js";
import { RESPOSTAS } from "./scoring.js";

// Agora a medida e o ALCANCE (o quanto o dedo consegue arrastar), e nao a
// largura do cartao. Foi o que consertou o desequilibrio entre as faixas.
const ALCANCE = 400;
const fracao = (f) => f * ALCANCE;
const LARGURA = ALCANCE;

describe("o que o arrasto responde", () => {
  it("arrasto curto nao responde nada: o cartao so volta para o lugar", () => {
    expect(intencaoDoArrasto(fracao(0.05), 0, ALCANCE)).toBeNull();
    expect(intencaoDoArrasto(fracao(-0.05), 0, ALCANCE)).toBeNull();
    expect(intencaoDoArrasto(0, 0, ALCANCE)).toBeNull();
  });

  it("arrasto medio para a direita concorda; longo concorda muito", () => {
    expect(intencaoDoArrasto(fracao(0.3), 0, ALCANCE)).toBe(1);
    expect(intencaoDoArrasto(fracao(0.8), 0, ALCANCE)).toBe(2);
  });

  it("para a esquerda e espelhado", () => {
    expect(intencaoDoArrasto(fracao(-0.3), 0, ALCANCE)).toBe(-1);
    expect(intencaoDoArrasto(fracao(-0.8), 0, ALCANCE)).toBe(-2);
  });

  it("so devolve respostas que existem na escala", () => {
    for (const f of [-0.9, -0.6, -0.3, -0.2, 0.2, 0.3, 0.6, 0.9]) {
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
      expect(intencaoDoArrasto(largura * 0.3, 0, largura), `alcance ${largura}`).toBe(1);
      expect(intencaoDoArrasto(largura * 0.8, 0, largura), `alcance ${largura}`).toBe(2);
      expect(intencaoDoArrasto(largura * 0.05, 0, largura), `alcance ${largura}`).toBeNull();
    }
  });
});

describe("rolar a pagina nao responde", () => {
  it("movimento predominantemente vertical e ignorado", () => {
    // A tela do teste rola 57px num iPhone SE. Sem isto, rolar responderia.
    expect(intencaoDoArrasto(fracao(0.4), 400, ALCANCE)).toBeNull();
    expect(intencaoDoArrasto(fracao(-0.4), -400, ALCANCE)).toBeNull();
  });

  it("um desvio pequeno no dedo nao atrapalha", () => {
    // Ninguem arrasta em linha reta perfeita.
    expect(intencaoDoArrasto(fracao(0.8), 20, ALCANCE)).toBe(2);
    expect(intencaoDoArrasto(fracao(0.8), -20, ALCANCE)).toBe(2);
  });
});

describe("entradas estranhas nao quebram a tela", () => {
  it.each([
    ["alcance zero", 100, 0, 0],
    ["alcance negativo", 100, 0, -50],
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

describe("o alcance, e o equilibrio entre as faixas", () => {
  // Este bloco existe por um defeito real. Os limiares eram fracao da LARGURA
  // DO CARTAO, mas o quanto o dedo consegue arrastar depende da JANELA. No
  // celular as duas medidas quase coincidem; no desktop o cartao para em 42rem
  // e a tela continua crescendo, entao a faixa do "muito", que nao tem fim,
  // inchava: 80px contra 87px no iPhone SE, mas 152px contra 610px numa tela
  // grande.
  const telas = [
    ["iPhone SE", { left: 20, width: 335 }, 375],
    ["iPhone 15", { left: 20, width: 353 }, 393],
    ["desktop", { left: 234, width: 632 }, 1100],
    ["desktop grande", { left: 484, width: 632 }, 1600],
  ];

  /** Mede as duas faixas varrendo o arrasto pixel a pixel. */
  function faixas(alcance) {
    let leve = 0;
    let forte = 0;
    for (let dx = 1; dx <= Math.ceil(alcance); dx++) {
      const intencao = intencaoDoArrasto(dx, 0, alcance);
      if (intencao === 1) leve++;
      else if (intencao === 2) forte++;
    }
    return { leve, forte };
  }

  it.each(telas)("em %s as duas faixas tem tamanho parecido", (_nome, caixa, janela) => {
    const alcance = alcanceDoArrasto(caixa, janela);
    const { leve, forte } = faixas(alcance);
    expect(leve).toBeGreaterThan(20);
    expect(forte).toBeGreaterThan(20);
    // Ate 15% de diferenca; antes desta correcao chegava a 400%.
    const razao = Math.max(leve, forte) / Math.min(leve, forte);
    expect(razao, `"concordo" ${leve}px vs "concordo muito" ${forte}px`).toBeLessThan(1.15);
  });

  it("o alcance nao passa do teto, por maior que seja a tela", () => {
    // Cartao centrado, com a coluna limitada em 42rem: numa tela de 1100 e numa
    // de 4000 o alcance tem que ser o mesmo, senao o mesmo gesto responderia
    // coisas diferentes so por causa do monitor.
    const estreita = alcanceDoArrasto({ left: 234, width: 632 }, 1100);
    const larga = alcanceDoArrasto({ left: 1684, width: 632 }, 4000);
    expect(larga).toBe(estreita);
    expect(larga).toBeLessThanOrEqual(632 * LIMIARES.teto);
  });

  it("numa tela apertada o alcance encolhe junto", () => {
    // Cartao quase colado nas bordas: nao da para arrastar mais que isso.
    expect(alcanceDoArrasto({ left: 8, width: 300 }, 316)).toBeCloseTo(158);
  });

  it("caixa ou janela invalida devolve zero, e ai nada responde", () => {
    expect(alcanceDoArrasto({ left: 0, width: 0 }, 400)).toBe(0);
    expect(alcanceDoArrasto(null, 400)).toBe(0);
    expect(alcanceDoArrasto({ left: 0, width: 300 }, 0)).toBe(0);
    expect(intencaoDoArrasto(100, 0, alcanceDoArrasto(null, 400))).toBeNull();
  });
});
