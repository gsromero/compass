import { describe, expect, it } from "vitest";
import { CORTES, intensidade, margemUnica, partesDaManchete } from "./manchete.js";
import { EIXOS, EIXOS_PRINCIPAIS } from "./scoring.js";
import { EIXOS_META } from "./questions.js";
import { LANGS, t } from "./i18n.js";

function resultadoCom(posicoes, margem = 1.2) {
  return Object.fromEntries(
    EIXOS.map((eixo) => [eixo, { posicao: posicoes[eixo] ?? 0, margem }]),
  );
}

describe("intensidade", () => {
  it("e simetrica: o mesmo tamanho vale igual para os dois lados", () => {
    for (const valor of [0.5, 2, 5, 9]) {
      expect(intensidade(valor)).toBe(intensidade(-valor));
    }
  });

  it("respeita os cortes", () => {
    expect(intensidade(0)).toBe("centro");
    expect(intensidade(CORTES.centro)).toBe("leve");
    expect(intensidade(CORTES.leve)).toBe("media");
    expect(intensidade(CORTES.media)).toBe("forte");
    expect(intensidade(10)).toBe("forte");
  });
});

describe("partesDaManchete", () => {
  it("aponta para o polo do lado em que a pessoa caiu", () => {
    const partes = partesDaManchete(resultadoCom({ economico: 10, autoridade: -5 }), EIXOS_META);
    expect(partes.map((p) => p.eixo)).toEqual(EIXOS_PRINCIPAIS);
    expect(partes[0]).toMatchObject({ intensidade: "forte", polo: EIXOS_META.economico.pos });
    expect(partes[1]).toMatchObject({ intensidade: "media", polo: EIXOS_META.autoridade.neg });
  });

  // Chave montada em tempo de execucao: se faltar, a tela mostra a chave crua.
  it.each(LANGS)("toda combinacao vira frase em %s", (lang) => {
    for (const eixo of EIXOS_PRINCIPAIS) {
      for (const nivel of ["centro", "leve", "media", "forte"]) {
        const chave = `manchete_${eixo}_${nivel}`;
        expect(t(lang, chave, "X")).not.toBe(chave);
      }
    }
  });
});

describe("margemUnica", () => {
  it("devolve a margem quando todos os eixos tem a mesma", () => {
    expect(margemUnica(resultadoCom({}, 1.2), EIXOS)).toBe(1.2);
  });

  it("devolve null quando elas diferem", () => {
    const r = resultadoCom({});
    r.economico.margem = 2.4;
    expect(margemUnica(r, EIXOS)).toBeNull();
  });
});

import { lugarDaEtiqueta } from "./compass.js";

describe("lugarDaEtiqueta", () => {
  const limites = { x0: 0, y0: 0, x1: 300, y1: 300 };
  const base = { rx: 10, ry: 10, largura: 50, altura: 20, folga: 6, limites };

  it("fica em cima a esquerda quando ali esta livre", () => {
    const o = lugarDaEtiqueta({ ...base, vx: 150, vy: 150, ocupados: [] });
    expect(o.x).toBeLessThan(150);
    expect(o.y).toBeLessThan(150);
  });

  it("foge de um nome de polo que esta em cima a esquerda", () => {
    const polo = { x: 60, y: 100, w: 90, h: 30 };
    const o = lugarDaEtiqueta({ ...base, vx: 150, vy: 150, ocupados: [polo] });
    const encosta = !(o.x + 50 <= polo.x || polo.x + polo.w <= o.x || o.y + 20 <= polo.y || polo.y + polo.h <= o.y);
    expect(encosta).toBe(false);
  });

  it("nunca sai do grafico, nem com o ponto no canto", () => {
    const o = lugarDaEtiqueta({ ...base, vx: 295, vy: 5, ocupados: [] });
    expect(o.x).toBeGreaterThanOrEqual(0);
    expect(o.x + 50).toBeLessThanOrEqual(300);
    expect(o.y).toBeGreaterThanOrEqual(0);
  });
});
