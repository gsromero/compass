// A conta em si: posicao, margem de erro e quadrante.
// O equilibrio do banco de perguntas e testado em equilibrio.test.js.
import { describe, expect, it } from "vitest";
import {
  confianca,
  contribuicoes,
  pontuarEixo,
  pontuar,
  quadrante,
  respondeuTudoIgual,
} from "./scoring.js";

// Banco minimo e simetrico, para testar a conta sem depender das perguntas reais.
const PERGUNTAS = [
  { id: "a", eixo: "economico", peso: -1.0, par: "p1" },
  { id: "b", eixo: "economico", peso: 1.0, par: "p1" },
  { id: "c", eixo: "economico", peso: -0.5, par: "p2" },
  { id: "d", eixo: "economico", peso: 0.5, par: "p2" },
];

const r = (valores) =>
  Object.fromEntries(Object.entries(valores).map(([id, v]) => [id, { r: v, m: 1 }]));

describe("posicao", () => {
  it("sem nenhuma resposta, fica no centro com incerteza total", () => {
    const { posicao, margem, n } = pontuarEixo(PERGUNTAS, {}, "economico");
    expect(posicao).toBe(0);
    expect(margem).toBe(10);
    expect(n).toBe(0);
  });

  it("concordar muito com um item de peso negativo vai para o extremo negativo", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2 }), "economico");
    expect(posicao).toBeCloseTo(-10);
  });

  it("concordar muito com um item de peso positivo vai para o extremo positivo", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ b: 2 }), "economico");
    expect(posicao).toBeCloseTo(10);
  });

  it("discordar de um item inverte o lado", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: -2 }), "economico");
    expect(posicao).toBeCloseTo(10);
  });

  it("respostas opostas em itens opostos se somam em vez de se anular", () => {
    // Concordar que "renda deve ser mais igual" E discordar que "a propriedade
    // privada deve aumentar" sao a MESMA posicao dita duas vezes.
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico");
    expect(posicao).toBeCloseTo(-10);
  });

  it("um teste pela metade nao distorce o eixo", () => {
    // Responder so metade das perguntas nao pode empurrar ninguem para o
    // centro nem para a borda: a conta normaliza pelo que foi respondido.
    const metade = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico");
    const inteiro = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(metade.posicao).toBeCloseTo(inteiro.posicao);
  });

  it("pesos diferentes normalizam certo", () => {
    // Concordar muito com o item de peso 1 e discordar muito do de peso 0,5
    // (que puxa para o mesmo lado) tem que dar o extremo, nao uma media.
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2, c: 2 }), "economico");
    expect(posicao).toBeCloseTo(-10);
  });

  it("importancia alta pesa mais que importancia baixa", () => {
    const respostas = { a: { r: 2, m: 1.5 }, b: { r: 2, m: 0.5 } };
    const { posicao } = pontuarEixo(PERGUNTAS, respostas, "economico");
    expect(posicao).toBeLessThan(0);
  });

  it("a posicao nunca sai da escala", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(posicao).toBeGreaterThanOrEqual(-10);
    expect(posicao).toBeLessThanOrEqual(10);
  });
});

describe("margem de erro", () => {
  it("uma resposta so nao gera certeza", () => {
    // O erro que este projeto existe para nao cometer: precisao falsa.
    const { margem } = pontuarEixo(PERGUNTAS, r({ a: 2 }), "economico");
    expect(margem).toBeGreaterThan(1);
  });

  it("respostas coerentes apertam a margem", () => {
    const uma = pontuarEixo(PERGUNTAS, r({ a: 2 }), "economico");
    const todas = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(todas.margem).toBeLessThan(uma.margem);
  });

  it("respostas que se contradizem alargam a margem", () => {
    const coerente = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    const confuso = pontuarEixo(PERGUNTAS, r({ a: 2, b: 2, c: -2, d: -2 }), "economico");
    expect(confuso.margem).toBeGreaterThan(coerente.margem);
  });

  it("a margem nunca passa da escala", () => {
    const { margem } = pontuarEixo(PERGUNTAS, r({ a: 2, b: 2 }), "economico");
    expect(margem).toBeLessThanOrEqual(10);
  });
});

describe("quadrante", () => {
  const posicoes = (economico, autoridade) => ({
    economico: { posicao: economico, margem: 1, n: 4 },
    autoridade: { posicao: autoridade, margem: 1, n: 4 },
  });

  it("separa os quatro quadrantes", () => {
    expect(quadrante(posicoes(-5, -5))).toBe("igualdade-liberdade");
    expect(quadrante(posicoes(-5, 5))).toBe("igualdade-autoridade");
    expect(quadrante(posicoes(5, -5))).toBe("mercado-liberdade");
    expect(quadrante(posicoes(5, 5))).toBe("mercado-autoridade");
  });

  it("o centro exato nao vira um quinto quadrante", () => {
    expect(quadrante(posicoes(0, 0))).toBe("igualdade-liberdade");
  });
});

describe("contribuicoes", () => {
  it("lista as respostas que mais puxaram, da maior para a menor", () => {
    const lista = contribuicoes(PERGUNTAS, r({ a: 2, c: 1 }), "economico");
    expect(lista).toHaveLength(2);
    expect(lista[0].pergunta.id).toBe("a");
    expect(lista[0].empurrao).toBeCloseTo(-2);
  });

  it("resposta neutra nao entra: ela nao puxou nada", () => {
    expect(contribuicoes(PERGUNTAS, r({ a: 0, b: 1 }), "economico")).toHaveLength(1);
  });
});

describe("pontuar", () => {
  it("devolve todos os eixos, mesmo os sem resposta nenhuma", () => {
    const resultado = pontuar(PERGUNTAS, r({ a: 2 }));
    expect(Object.keys(resultado)).toHaveLength(6);
    expect(resultado.costumes.n).toBe(0);
    expect(resultado.costumes.margem).toBe(10);
  });
});

describe("confianca e resposta uniforme", () => {
  // Este bloco existe por um caso real: o dono respondeu a mesma nota em tudo,
  // caiu no centro e achou que era defeito. Nao era, mas a tela nao contava.
  const banco = [
    { id: "a", eixo: "economico", peso: -1, par: "p1" },
    { id: "b", eixo: "economico", peso: 1, par: "p1" },
    { id: "c", eixo: "autoridade", peso: -1, par: "p2" },
    { id: "d", eixo: "autoridade", peso: 1, par: "p2" },
    { id: "e", eixo: "costumes", peso: -1, par: "p3" },
    { id: "f", eixo: "costumes", peso: 1, par: "p3" },
  ];

  it("responder a mesma nota em tudo e detectado", () => {
    expect(respondeuTudoIgual(r({ a: -2, b: -2, c: -2, d: -2, e: -2, f: -2 }))).toBe(true);
    expect(respondeuTudoIgual(r({ a: 2, b: 2, c: 2, d: 2, e: 2, f: 2 }))).toBe(true);
  });

  it("uma resposta diferente ja nao conta como uniforme", () => {
    expect(respondeuTudoIgual(r({ a: -2, b: -2, c: -2, d: -2, e: -2, f: 1 }))).toBe(false);
  });

  it("poucas respostas nao viram diagnostico", () => {
    // Duas respostas iguais sao coincidencia, nao padrao.
    expect(respondeuTudoIgual(r({ a: -2, b: -2 }))).toBe(false);
  });

  it("quem responde tudo igual cai no centro E com confianca baixa", () => {
    // As duas metades da afirmacao importam: o centro sozinho seria ambiguo.
    const resultado = pontuar(banco, r({ a: -2, b: -2, c: -2, d: -2, e: -2, f: -2 }));
    expect(resultado.economico.posicao).toBeCloseTo(0);
    expect(confianca(resultado)).toBe("baixa");
  });

  it("quem responde de forma coerente cai fora do centro e com confianca melhor", () => {
    const coerente = pontuar(banco, r({ a: 2, b: -2, c: 2, d: -2, e: 2, f: -2 }));
    expect(Math.abs(coerente.economico.posicao)).toBeGreaterThan(5);
    expect(confianca(coerente)).not.toBe("baixa");
  });
});
