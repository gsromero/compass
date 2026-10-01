import { describe, expect, it } from "vitest";
import { quadranteDoCodigo } from "./previa.js";
import { TODAS } from "./questions.js";

describe("quadranteDoCodigo", () => {
  it("le o quadrante de um link valido", () => {
    expect(quadranteDoCodigo("Ay4uAABbWwAALi4AAFtbAAAuLgAAW1sAAA")).toBe("mercado-autoridade");
  });

  it("devolve null para link quebrado ou de outra versao", () => {
    expect(quadranteDoCodigo("%%%lixo")).toBeNull();
    expect(quadranteDoCodigo("AgAAAA")).toBeNull();
  });

  // A Function decodifica sempre com as perguntas em pt. Isso so e certo
  // enquanto nenhuma pergunta for exclusiva de um idioma.
  it("nenhuma pergunta e exclusiva de um idioma", () => {
    expect(TODAS.filter((p) => p.so_no_idioma)).toEqual([]);
  });
});
