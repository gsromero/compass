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
