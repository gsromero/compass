// Os dados da pagina de partidos vem de uma pesquisa academica e sao gerados
// por scripts/partidos-bls.mjs. Este teste segura as regras que fazem a
// pagina ser defensavel: fonte citada, ninguem exposto, nada fora da escala.
import { describe, expect, it } from "vitest";
import dados from "../data/partidos-bls.json";

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
