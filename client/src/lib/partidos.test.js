// Os dados da secao de partidos (no resultado) vem de uma pesquisa academica e sao gerados
// por scripts/partidos-bls.mjs. Este teste segura as regras que fazem a
// secao ser defensavel: fonte citada, ninguem exposto, nada fora da escala.
import { describe, expect, it } from "vitest";
import dados from "../data/partidos-bls.json";
import { empilharSiglas, maisProximos, naRegua, paraRegua } from "./partidos.js";

describe("partidos-bls.json", () => {
  it("cita a fonte com DOI e rodada", () => {
    expect(dados.fonte.doi).toMatch(/^10\.7910\//);
    expect(dados.fonte.citacao).toContain("Brazilian Legislative Surveys");
    expect(dados.fonte.rodada).toBeGreaterThanOrEqual(2021);
  });

  it("nenhum partido mostrado tem menos notas que o minimo", () => {
    for (const p of dados.partidos) expect(p.n).toBeGreaterThanOrEqual(dados.minimo);
  });

  it("os de fora estao de fora porque tem poucas notas, e so por isso", () => {
    for (const p of dados.fora) expect(p.n).toBeLessThan(dados.minimo);
  });

  it("toda media cabe na escala de 1 a 10 e a lista vem em ordem", () => {
    const medias = dados.partidos.map((p) => p.media);
    for (const m of medias) expect(m).toBeGreaterThanOrEqual(1) && expect(m).toBeLessThanOrEqual(10);
    expect([...medias].sort((a, b) => a - b)).toEqual(medias);
  });
});

describe("regua dos partidos", () => {
  it("leva o eixo economico para 1 a 10 com o centro no 5,5", () => {
    expect(paraRegua(0)).toBe(5.5);
    expect(paraRegua(-10)).toBe(1);
    expect(paraRegua(10)).toBe(10);
    expect(naRegua(1)).toBe(0);
    expect(naRegua(10)).toBe(100);
  });

  it("acha os mais proximos em ordem", () => {
    const perto = maisProximos(dados.partidos, 3.43);
    expect(perto.map((p) => p.sigla)).toEqual(["PSB", "PDT", "PT"]);
  });

  it("empilha sem sobrepor nenhuma sigla", () => {
    const largura = 300;
    const itens = dados.partidos.map((p) => ({ sigla: p.sigla, x: (naRegua(p.media) / 100) * largura }));
    const larguraDe = (s) => s.length * 7 + 16;
    const { etiquetas, linhas } = empilharSiglas(itens, largura, larguraDe);
    expect(etiquetas).toHaveLength(dados.partidos.length);
    for (let l = 0; l < linhas; l += 1) {
      const naLinha = etiquetas.filter((e) => e.linha === l).sort((a, b) => a.centro - b.centro);
      for (let i = 1; i < naLinha.length; i += 1) {
        const a = naLinha[i - 1];
        const b = naLinha[i];
        expect(b.centro - larguraDe(b.sigla) / 2).toBeGreaterThanOrEqual(a.centro + larguraDe(a.sigla) / 2);
      }
    }
    for (const e of etiquetas) {
      expect(e.centro - larguraDe(e.sigla) / 2).toBeGreaterThanOrEqual(0);
      expect(e.centro + larguraDe(e.sigla) / 2).toBeLessThanOrEqual(largura);
    }
  });
});
