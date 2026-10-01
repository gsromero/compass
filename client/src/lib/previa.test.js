import { describe, expect, it } from "vitest";
import { quadranteDoCodigo } from "./previa.js";
import { TODAS, VERSAO_BANCO } from "./questions.js";
import { codificar } from "./permalink.js";
import { RESPOSTAS } from "./scoring.js";

describe("quadranteDoCodigo", () => {
  it("le o quadrante de um link valido", () => {
    // Um link montado na hora, com a versao atual do banco: concorda com tudo
    // o que puxa para mercado e autoridade, discorda do resto.
    const respostas = Object.fromEntries(
      TODAS.map((p) => {
        const sinal = (p.eixo === "economico" || p.eixo === "autoridade") && p.peso > 0 ? 1 : -1;
        return [p.id, { r: sinal > 0 ? RESPOSTAS.at(-1) : RESPOSTAS[0], m: 1 }];
      }),
    );
    const codigo = codificar(TODAS, respostas, VERSAO_BANCO);
    expect(quadranteDoCodigo(codigo)).toBe("mercado-autoridade");
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
