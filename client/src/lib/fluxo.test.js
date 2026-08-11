// O caminho completo, do jeito que uma pessoa percorre: responder o teste
// inteiro, virar link, e o link reconstruir exatamente o mesmo resultado.
//
// Este e o teste que pega quebra de compatibilidade do link compartilhado, que
// e o tipo de defeito que ninguem nota ate alguem reclamar que abriu o proprio
// resultado e viu outra coisa.

import { describe, expect, it } from "vitest";
import { TODAS, VERSAO_BANCO, perguntasDoIdioma } from "./questions.js";
import { EIXOS, IMPORTANCIAS, MODOS, pontuar, proximoPar, quadrante } from "./scoring.js";
import { codificar, decodificar } from "./permalink.js";
import { maisProximas } from "./tradicoes.js";

function rng(semente) {
  let estado = semente >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

/** Percorre o teste como a tela percorre: pares inteiros, ate acabar. */
function sessao(perguntas, modo, responder) {
  const respostas = {};
  for (let passo = 0; passo < 100; passo++) {
    const proximo = proximoPar(perguntas, respostas, modo);
    if (!proximo) return respostas;
    for (const pergunta of proximo.perguntas) respostas[pergunta.id] = responder(pergunta);
  }
  throw new Error("a sessao nao terminou");
}

describe("link do resultado", () => {
  it.each(Object.keys(MODOS))("no modo %s, o link reconstroi o resultado igual", (modo) => {
    const sorteio = rng(7);
    const perguntas = perguntasDoIdioma("pt");
    const respostas = sessao(perguntas, modo, () => ({
      r: Math.floor(sorteio() * 5) - 2,
      m: [0.5, 1, 1.5][Math.floor(sorteio() * 3)],
    }));

    const codigo = codificar(perguntas, respostas, VERSAO_BANCO);
    const lidas = decodificar(perguntas, codigo, VERSAO_BANCO);

    expect(lidas).toEqual(respostas);
    expect(pontuar(perguntas, lidas)).toEqual(pontuar(perguntas, respostas));
    expect(quadrante(pontuar(perguntas, lidas))).toBe(quadrante(pontuar(perguntas, respostas)));
  });

  it("o codigo cabe numa URL curta", () => {
    const respostas = Object.fromEntries(
      TODAS.map((p) => [p.id, { r: 2, m: IMPORTANCIAS.alta }]),
    );
    const codigo = codificar(TODAS, respostas, VERSAO_BANCO);
    expect(codigo.length).toBeLessThan(60);
    expect(codigo).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("codigo de outra versao do banco e recusado em vez de mostrar resultado errado", () => {
    const respostas = { [TODAS[0].id]: { r: 2, m: 1 } };
    const codigo = codificar(TODAS, respostas, VERSAO_BANCO);
    expect(decodificar(TODAS, codigo, VERSAO_BANCO + 1)).toBeNull();
  });

  it("codigo corrompido devolve null em vez de quebrar a tela", () => {
    expect(decodificar(TODAS, "nao-e-um-codigo!!!", VERSAO_BANCO)).toBeNull();
    expect(decodificar(TODAS, "", VERSAO_BANCO)).toBeNull();
  });

  it("os dois idiomas geram o mesmo resultado para as mesmas respostas", () => {
    // O texto muda, a conta nao. Se isso quebrar, trocar de idioma na tela de
    // resultado moveria o ponto da pessoa, o que seria absurdo.
    const sorteio = rng(11);
    const respostas = Object.fromEntries(
      TODAS.map((p) => [p.id, { r: Math.floor(sorteio() * 5) - 2, m: 1 }]),
    );
    const pt = pontuar(perguntasDoIdioma("pt"), respostas);
    const en = pontuar(perguntasDoIdioma("en"), respostas);
    for (const eixo of EIXOS) {
      expect(pt[eixo].posicao).toBeCloseTo(en[eixo].posicao, 10);
    }
  });
});

describe("tradicoes", () => {
  it("quem responde como um libertario encontra o libertarianismo por perto", () => {
    // Nao e o mesmo teste do equilibrio: aqui o que se prova e que a lista de
    // tradicoes mais proximas, medida nos SEIS eixos, chega ao lugar certo.
    const respostas = {};
    for (const p of TODAS) {
      const querMercado = p.eixo === "economico" && p.peso > 0;
      const querLiberdade = p.eixo === "autoridade" && p.peso < 0;
      if (querMercado || querLiberdade) respostas[p.id] = { r: 2, m: 1 };
      else if (p.eixo === "economico" || p.eixo === "autoridade") {
        respostas[p.id] = { r: -2, m: 1 };
      }
    }
    const proximas = maisProximas(pontuar(TODAS, respostas), 3).map((x) => x.tradicao.id);
    expect(proximas).toContain("libertarianismo");
  });

  it("toda tradicao tem posicao em todos os seis eixos", () => {
    for (const { tradicao } of maisProximas(pontuar(TODAS, {}), 99)) {
      for (const eixo of EIXOS) {
        expect(typeof tradicao.eixos[eixo], `${tradicao.id} sem ${eixo}`).toBe("number");
        expect(Math.abs(tradicao.eixos[eixo])).toBeLessThanOrEqual(10);
      }
      for (const lang of ["pt", "en"]) {
        expect(tradicao.nome[lang]?.length ?? 0).toBeGreaterThan(3);
        expect(tradicao.resumo[lang]?.length ?? 0).toBeGreaterThan(80);
        expect(tradicao.leituras[lang]?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});

describe("o modo adaptativo termina", () => {
  it.each(Object.keys(MODOS))("o modo %s sempre acaba, com qualquer resposta", (modo) => {
    for (let semente = 0; semente < 200; semente++) {
      const sorteio = rng(semente);
      const respostas = sessao(perguntasDoIdioma("pt"), modo, () => ({
        r: Math.floor(sorteio() * 5) - 2,
        m: 1,
      }));
      expect(Object.keys(respostas).length).toBeGreaterThan(0);
      expect(Object.keys(respostas).length).toBeLessThanOrEqual(TODAS.length);
    }
  });

  it("quem responde de forma coerente acaba antes do limite", () => {
    // A promessa do modo adaptativo. Sem isto, "adaptativo" e so um rotulo.
    const coerente = sessao(perguntasDoIdioma("pt"), "padrao", (p) => ({
      r: p.peso < 0 ? 2 : -2,
      m: 1,
    }));
    expect(Object.keys(coerente).length).toBeLessThan(MODOS.padrao.pares * 2);
  });
});
