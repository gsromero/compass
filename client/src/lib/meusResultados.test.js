import { beforeEach, describe, expect, it } from "vitest";
import { eMeuResultado, lembrarResultado } from "./meusResultados.js";

// O vitest daqui roda sem DOM: um localStorage de mentira basta.
beforeEach(() => {
  const dados = new Map();
  globalThis.localStorage = {
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
    removeItem: (k) => dados.delete(k),
  };
});

describe("meusResultados", () => {
  it("reconhece um resultado feito aqui e nao reconhece o de outra pessoa", () => {
    lembrarResultado("abc");
    expect(eMeuResultado("abc")).toBe(true);
    expect(eMeuResultado("xyz")).toBe(false);
  });

  it("sem armazenamento, trata todo mundo como visitante sem quebrar", () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
    };
    expect(() => lembrarResultado("abc")).not.toThrow();
    expect(eMeuResultado("abc")).toBe(false);
  });
});
