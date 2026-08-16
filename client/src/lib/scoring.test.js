// A conta em si: posicao, margem de erro, quadrante e a regra dos pares.
// O equilibrio do banco de perguntas e testado em equilibrio.test.js.
import { describe, expect, it } from "vitest";
import {
  NAO_SEI,
  RESPOSTAS,
  confianca,
  contribuicoes,
  pontuarEixo,
  pontuar,
  quadrante,
  respondeuTudoIgual,
} from "./scoring.js";

// Banco minimo e simetrico, para testar a conta sem depender das perguntas
// reais. Dois pares no eixo economico.
const PERGUNTAS = [
  { id: "a", eixo: "economico", peso: -1.0, par: "p1" },
  { id: "b", eixo: "economico", peso: 1.0, par: "p1" },
  { id: "c", eixo: "economico", peso: -0.5, par: "p2" },
  { id: "d", eixo: "economico", peso: 0.5, par: "p2" },
];

const r = (valores) =>
  Object.fromEntries(Object.entries(valores).map(([id, v]) => [id, { r: v, m: 1 }]));

describe("a escala", () => {
  it("tem quatro respostas, e nenhuma delas e o meio", () => {
    expect(RESPOSTAS).toEqual([-2, -1, 1, 2]);
    expect(RESPOSTAS).not.toContain(NAO_SEI);
  });
});

describe("posicao", () => {
  it("sem nenhuma resposta, fica no centro com incerteza total", () => {
    const { posicao, margem, n } = pontuarEixo(PERGUNTAS, {}, "economico");
    expect(posicao).toBe(0);
    expect(margem).toBe(10);
    expect(n).toBe(0);
  });

  it("concordar com a afirmacao de um lado e discordar da oposta vai ao extremo", () => {
    // As duas respostas dizem a MESMA posicao, uma pela afirmativa e outra pela
    // negativa. E o par inteiro, que e a unidade que a conta aceita.
    expect(pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico").posicao).toBeCloseTo(-10);
    expect(pontuarEixo(PERGUNTAS, r({ a: -2, b: 2 }), "economico").posicao).toBeCloseTo(10);
  });

  it("um teste pela metade nao distorce o eixo", () => {
    // Responder so um dos dois pares nao pode empurrar ninguem para o centro
    // nem para a borda: a conta normaliza pelo que foi contado.
    const umPar = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico");
    const doisPares = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(umPar.posicao).toBeCloseTo(doisPares.posicao);
  });

  it("pares de pesos diferentes normalizam certo", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(posicao).toBeCloseTo(-10);
  });

  it("importancia alta pesa mais que importancia baixa", () => {
    const respostas = { a: { r: 2, m: 1.5 }, b: { r: 2, m: 0.5 } };
    expect(pontuarEixo(PERGUNTAS, respostas, "economico").posicao).toBeLessThan(0);
  });

  it("a posicao nunca sai da escala", () => {
    const { posicao } = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(posicao).toBeGreaterThanOrEqual(-10);
    expect(posicao).toBeLessThanOrEqual(10);
  });
});

describe("a regra dos pares completos", () => {
  it("par pela metade nao conta", () => {
    // Antes isto valia -10. Vale zero agora, e de proposito: meia resposta de
    // um par carrega o vies de quem concorda com tudo para dentro do resultado.
    const { posicao, n } = pontuarEixo(PERGUNTAS, r({ a: 2 }), "economico");
    expect(posicao).toBe(0);
    expect(n).toBe(0);
  });

  it("'nao sei' descarta o par inteiro, inclusive a resposta que veio junto", () => {
    const { n } = pontuarEixo(PERGUNTAS, r({ a: NAO_SEI, b: 2 }), "economico");
    expect(n).toBe(0);
  });

  it("um par com 'nao sei' cai, e os outros continuam valendo", () => {
    const { posicao, n } = pontuarEixo(
      PERGUNTAS,
      r({ a: NAO_SEI, b: 2, c: 2, d: -2 }),
      "economico",
    );
    expect(n).toBe(2);
    expect(posicao).toBeCloseTo(-10);
  });

  it("o vies de quem concorda com tudo nao entra pela metade do par", () => {
    // ESTE e o teste que resume a mudanca. Alguem que diz "nao sei" em toda
    // afirmacao de um lado e "concordo" em toda a do outro estaria, pela regra
    // antiga, sendo empurrado para o polo das que respondeu. Com pares
    // completos, cai tudo e o resultado admite que nao mediu nada.
    const enviesado = r({ a: NAO_SEI, b: 1, c: NAO_SEI, d: 1 });
    const { posicao, margem, n } = pontuarEixo(PERGUNTAS, enviesado, "economico");
    expect(n).toBe(0);
    expect(posicao).toBe(0);
    expect(margem).toBe(10);
  });
});

describe("'nao sei' nao vira confianca", () => {
  it("dizer 'nao sei' em tudo da incerteza total, e nao o centro com certeza", () => {
    // O bug que originou esta mudanca: antes isto devolvia margem 0,65, a mesma
    // de quem responde tudo de forma coerente. O site dizia "voce esta no
    // centro, e temos certeza" para quem nao opinou sobre nada.
    const todos = r({ a: NAO_SEI, b: NAO_SEI, c: NAO_SEI, d: NAO_SEI });
    const { posicao, margem, n } = pontuarEixo(PERGUNTAS, todos, "economico");
    expect(posicao).toBe(0);
    expect(margem).toBe(10);
    expect(n).toBe(0);
  });

  it("quem nao opina nao pode parecer tao confiante quanto quem opina", () => {
    const naoOpina = pontuarEixo(PERGUNTAS, r({ a: NAO_SEI, b: NAO_SEI }), "economico");
    const opina = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico");
    expect(naoOpina.margem).toBeGreaterThan(opina.margem);
  });
});

describe("margem de erro", () => {
  it("um par so nao gera certeza", () => {
    // O erro que este projeto existe para nao cometer: precisao falsa.
    expect(pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico").margem).toBeGreaterThan(0.3);
  });

  it("respostas coerentes apertam a margem", () => {
    const umPar = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2 }), "economico");
    const dois = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    expect(dois.margem).toBeLessThan(umPar.margem);
  });

  it("respostas que se contradizem alargam a margem", () => {
    const coerente = pontuarEixo(PERGUNTAS, r({ a: 2, b: -2, c: 2, d: -2 }), "economico");
    const confuso = pontuarEixo(PERGUNTAS, r({ a: 2, b: 2, c: -2, d: -2 }), "economico");
    expect(confuso.margem).toBeGreaterThan(coerente.margem);
  });

  it("a margem nunca passa da escala", () => {
    expect(pontuarEixo(PERGUNTAS, r({ a: 2, b: 2 }), "economico").margem).toBeLessThanOrEqual(10);
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
    const lista = contribuicoes(PERGUNTAS, r({ a: 2, b: -2, c: 1, d: -1 }), "economico");
    expect(lista).toHaveLength(4);
    expect(Math.abs(lista[0].empurrao)).toBeGreaterThanOrEqual(Math.abs(lista[3].empurrao));
    expect(lista[0].pergunta.id).toBe("a");
  });

  it("afirmacao de par descartado nao aparece: ela nao puxou nada", () => {
    // Coerencia com a conta. Mostrar uma resposta que nao entrou seria dizer
    // que ela influenciou o resultado quando ela nao influenciou.
    expect(contribuicoes(PERGUNTAS, r({ a: NAO_SEI, b: 2 }), "economico")).toHaveLength(0);
  });
});

describe("pontuar", () => {
  it("devolve todos os eixos, mesmo os sem resposta nenhuma", () => {
    const resultado = pontuar(PERGUNTAS, r({ a: 2, b: -2 }));
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
    expect(respondeuTudoIgual(r({ a: -2, b: -2 }))).toBe(false);
  });

  it("quem responde tudo igual cai no centro E com confianca baixa", () => {
    const resultado = pontuar(banco, r({ a: -2, b: -2, c: -2, d: -2, e: -2, f: -2 }));
    expect(resultado.economico.posicao).toBeCloseTo(0);
    expect(confianca(resultado)).toBe("baixa");
  });

  it("quem responde de forma coerente cai fora do centro e com confianca melhor", () => {
    const coerente = pontuar(banco, r({ a: 2, b: -2, c: 2, d: -2, e: 2, f: -2 }));
    expect(Math.abs(coerente.economico.posicao)).toBeGreaterThan(5);
    expect(confianca(coerente)).not.toBe("baixa");
  });

  it("quem diz 'nao sei' em tudo tem confianca baixa", () => {
    const vazio = pontuar(banco, r({ a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 }));
    expect(confianca(vazio)).toBe("baixa");
  });
});
