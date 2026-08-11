// A BATERIA DE EQUILIBRIO.
//
// E a razao de existir do projeto, e por isso ela roda no `npm run build`:
// teste vermelho aqui impede o deploy. O Political Compass tem 36 afirmacoes
// codificadas para a direita e 20 para a esquerda; como as pessoas tendem a
// concordar com o que leem, quem responde no automatico e empurrado para um
// lado pela construcao do teste. Estes testes existem para provar que aqui
// isso nao acontece.
//
// Nao e opiniao sobre as perguntas: e a maquina conferindo.

import { describe, expect, it } from "vitest";
import { TODAS, perguntasDoIdioma } from "./questions.js";
import { EIXOS, MODOS, NAO_SEI, agruparPares, pontuar, proximoPar } from "./scoring.js";

const IDIOMAS = ["pt", "en"];

function porEixo(eixo) {
  return TODAS.filter((p) => p.eixo === eixo);
}

function responderTudo(perguntas, r) {
  return Object.fromEntries(perguntas.map((p) => [p.id, { r, m: 1 }]));
}

// Gerador previsivel, para uma sessao simulada que falha poder ser repetida.
function rng(semente) {
  let estado = semente >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

describe("1. equilibrio de codificacao", () => {
  it.each(EIXOS)("o eixo %s tem o mesmo numero de perguntas dos dois lados", (eixo) => {
    const itens = porEixo(eixo);
    const concordarPuxaNeg = itens.filter((p) => p.peso < 0).length;
    const concordarPuxaPos = itens.filter((p) => p.peso > 0).length;
    expect(Math.abs(concordarPuxaNeg - concordarPuxaPos)).toBeLessThanOrEqual(1);
  });

  it.each(EIXOS)("a soma dos pesos com sinal do eixo %s e zero", (eixo) => {
    const soma = porEixo(eixo).reduce((s, p) => s + p.peso, 0);
    const massa = porEixo(eixo).reduce((s, p) => s + Math.abs(p.peso), 0);
    // Tolerancia de 5% da massa total: e o desbalanceamento que ainda nao
    // deslocaria visivelmente quem responde no automatico.
    expect(Math.abs(soma)).toBeLessThanOrEqual(massa * 0.05);
  });
});

describe("2. quem concorda com tudo cai no centro", () => {
  // Este e O teste. O Political Compass reprovaria nele.
  it.each(IDIOMAS)("concordar com tudo, em %s, nao move nenhum eixo", (lang) => {
    const perguntas = perguntasDoIdioma(lang);
    const resultado = pontuar(perguntas, responderTudo(perguntas, 2));
    for (const eixo of EIXOS) {
      expect(Math.abs(resultado[eixo].posicao)).toBeLessThan(0.001);
    }
  });

  it.each(IDIOMAS)("discordar de tudo, em %s, tambem nao move nenhum eixo", (lang) => {
    const perguntas = perguntasDoIdioma(lang);
    const resultado = pontuar(perguntas, responderTudo(perguntas, -2));
    for (const eixo of EIXOS) {
      expect(Math.abs(resultado[eixo].posicao)).toBeLessThan(0.001);
    }
  });

  it("quem concorda com tudo fica com margem grande, nao com certeza no centro", () => {
    // Cair no centro por indiferenca e cair no centro por concordar com tudo
    // sao coisas diferentes, e o resultado precisa saber distinguir.
    const resultado = pontuar(TODAS, responderTudo(TODAS, 2));
    for (const eixo of EIXOS) {
      expect(resultado[eixo].margem).toBeGreaterThan(2);
    }
  });
});

describe('3. "nao sei" nao e uma posicao', () => {
  it("dizer 'nao sei' em tudo da o centro COM incerteza total", () => {
    // "Nao sei" significa que a afirmacao nao diz nada sobre a pessoa, e nao
    // que ela esta no meio. Antes desta regra o site respondia "voce esta no
    // centro, e temos certeza" para quem nao opinou sobre nada.
    const resultado = pontuar(TODAS, responderTudo(TODAS, NAO_SEI));
    for (const eixo of EIXOS) {
      expect(resultado[eixo].posicao).toBe(0);
      expect(resultado[eixo].margem).toBe(10);
      expect(resultado[eixo].n).toBe(0);
    }
  });

  it("no banco real, 'nao sei' de um lado do par nao empurra para o outro", () => {
    // O mesmo teste do scoring.test.js, agora contra as 48 afirmacoes de
    // verdade: alguem que so responde as afirmacoes de um dos lados e diz
    // "nao sei" nas opostas nao pode ser empurrado para o lado que respondeu.
    const respostas = {};
    for (const p of TODAS) respostas[p.id] = { r: p.peso < 0 ? NAO_SEI : 1, m: 1 };

    const resultado = pontuar(TODAS, respostas);
    for (const eixo of EIXOS) {
      expect(Math.abs(resultado[eixo].posicao), `eixo ${eixo}`).toBeLessThan(0.001);
      expect(resultado[eixo].margem).toBe(10);
    }
  });
});

describe("4. simetria de forca", () => {
  it.each(EIXOS)("os dois lados do eixo %s pesam igual", (eixo) => {
    const itens = porEixo(eixo);
    const forca = (lado) => {
      const grupo = itens.filter((p) => Math.sign(p.peso) === lado);
      return grupo.reduce((s, p) => s + Math.abs(p.peso), 0) / grupo.length;
    };
    // Nao adianta ter 4 perguntas de cada lado se as de um lado pesam o dobro.
    expect(Math.abs(forca(-1) - forca(1))).toBeLessThan(0.05);
  });

  it.each(EIXOS)("cada par de balanco do eixo %s tem pesos opostos e iguais", (eixo) => {
    const pares = agruparPares(porEixo(eixo));
    for (const [nome, par] of pares) {
      expect(par, `par ${nome} deveria ter exatamente duas perguntas`).toHaveLength(2);
      expect(par[0].peso + par[1].peso, `par ${nome} nao se anula`).toBeCloseTo(0, 10);
    }
  });
});

describe("5. o modo adaptativo tambem e equilibrado", () => {
  // O risco sutil: se o teste escolhe quais perguntas fazer, ele pode montar um
  // conjunto torto sem querer e trazer o vies de volta pela porta dos fundos.
  function simular(modo, responder) {
    const respostas = {};
    let passos = 0;
    for (;;) {
      const proximo = proximoPar(TODAS, respostas, modo);
      if (!proximo) break;
      for (const pergunta of proximo.perguntas) {
        respostas[pergunta.id] = { r: responder(pergunta), m: 1 };
      }
      if (++passos > 100) throw new Error("o teste nao terminou");
    }
    return respostas;
  }

  it.each(Object.keys(MODOS))(
    "no modo %s, quem concorda com tudo continua caindo no centro",
    (modo) => {
      const respostas = simular(modo, () => 2);
      const resultado = pontuar(TODAS, respostas);
      for (const eixo of EIXOS) {
        expect(Math.abs(resultado[eixo].posicao)).toBeLessThan(0.001);
      }
    },
  );

  it("2000 sessoes com respostas aleatorias terminam sempre com pares inteiros", () => {
    for (let semente = 0; semente < 2000; semente++) {
      const sorteio = rng(semente);
      const modo = ["rapido", "padrao", "completo"][semente % 3];
      const respostas = simular(modo, () => Math.floor(sorteio() * 5) - 2);

      const respondidas = TODAS.filter((p) => respostas[p.id]);
      const pares = agruparPares(respondidas);
      for (const [nome, par] of pares) {
        expect(par.length, `sessao ${semente} parou no meio do par ${nome}`).toBe(2);
      }
      // Consequencia direta: qualquer subconjunto perguntado se anula.
      for (const eixo of EIXOS) {
        const soma = respondidas
          .filter((p) => p.eixo === eixo)
          .reduce((s, p) => s + p.peso, 0);
        expect(Math.abs(soma), `sessao ${semente}, eixo ${eixo}`).toBeLessThan(1e-9);
      }
    }
  });

  it("o modo rapido pergunta menos que o completo", () => {
    const contar = (modo) => Object.keys(simular(modo, () => 2)).length;
    expect(contar("rapido")).toBeLessThan(contar("completo"));
    expect(contar("rapido")).toBe(MODOS.rapido.pares * 2);
  });
});

describe("6. higiene de redacao", () => {
  // Termos que ja entregam a resposta certa. Afirmacao boa descreve a posicao;
  // afirmacao ruim descreve a posicao e ja diz o que pensar dela.
  const CARREGADOS = [
    "ganancioso", "gananciosa", "explora", "exploram", "parasita", "corrupto ",
    "egoista", "cruel", "absurdo", "obviamente", "claramente",
    "greedy", "exploit", "exploits", "parasite", "selfish", "cruel",
    "obviously", "clearly", "absurd",
  ];

  it.each(TODAS.map((p) => [p.id, p]))("%s nao usa termo carregado", (_id, pergunta) => {
    for (const lang of IDIOMAS) {
      const texto = pergunta.texto[lang].toLowerCase();
      for (const termo of CARREGADOS) {
        expect(texto, `"${termo}" em ${lang}`).not.toContain(termo);
      }
    }
  });

  it.each(TODAS.map((p) => [p.id, p]))("%s faz uma afirmacao so", (_id, pergunta) => {
    // Duas afirmacoes grudadas nao tem resposta possivel: a pessoa concorda com
    // metade. "X, e tambem Y" e proibido; "X, mesmo que Y" e concessao e passa.
    for (const lang of IDIOMAS) {
      const texto = pergunta.texto[lang];
      expect(texto, `dupla afirmacao em ${lang}`).not.toMatch(
        /\b(e tambem|e ainda|and also|as well as)\b/i,
      );
    }
  });

  it.each(EIXOS)("as frases dos dois lados do eixo %s tem comprimento parecido", (eixo) => {
    // Afirmacao longa lida com pressa vira discordancia. Se um lado for
    // sistematicamente mais longo, o comprimento vira vies.
    for (const lang of IDIOMAS) {
      const media = (lado) => {
        const grupo = porEixo(eixo).filter((p) => Math.sign(p.peso) === lado);
        return grupo.reduce((s, p) => s + p.texto[lang].length, 0) / grupo.length;
      };
      const curto = Math.min(media(-1), media(1));
      const longo = Math.max(media(-1), media(1));
      expect(longo / curto, `eixo ${eixo} em ${lang}`).toBeLessThan(1.6);
    }
  });

  it.each(TODAS.map((p) => [p.id, p]))("%s nao usa travessao", (_id, pergunta) => {
    for (const lang of IDIOMAS) {
      expect(pergunta.texto[lang]).not.toContain("—");
    }
  });
});

describe("7. paridade entre idiomas", () => {
  it.each(TODAS.map((p) => [p.id, p]))("%s existe nos dois idiomas", (_id, pergunta) => {
    for (const lang of IDIOMAS) {
      expect(pergunta.texto[lang]?.trim()?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it("os dois idiomas oferecem o mesmo teste", () => {
    // Se um idioma tivesse menos perguntas num eixo, os dois publicos nao
    // seriam comparaveis, e o mapa de calor misturaria coisas diferentes.
    const pt = perguntasDoIdioma("pt");
    const en = perguntasDoIdioma("en");
    for (const eixo of EIXOS) {
      const contar = (lista) => lista.filter((p) => p.eixo === eixo).length;
      expect(contar(pt)).toBe(contar(en));
    }
  });
});

describe("8. validade contra o mundo real", () => {
  // Se estas tradicoes nao cairem onde a literatura diz que elas ficam, os
  // pesos estao errados. E o unico teste aqui que olha para fora do arquivo.
  const TRADICOES = {
    libertarianismo: {
      concorda: ["econ-propriedade-privada", "econ-incentivo-esforco", "econ-responsabilidade-propria", "econ-competicao", "auth-liberdade-expressao", "auth-direitos-civis", "auth-protesto", "auth-participacao"],
      esperado: { economico: 1, autoridade: -1 },
    },
    "socialismo-libertario": {
      concorda: ["econ-renda-igual", "econ-estado-provedor", "econ-taxar-ricos", "econ-seguro-desemprego", "auth-liberdade-expressao", "auth-direitos-civis", "auth-protesto", "auth-participacao"],
      esperado: { economico: -1, autoridade: -1 },
    },
    "socialismo-de-estado": {
      concorda: ["econ-renda-igual", "econ-estado-provedor", "econ-taxar-ricos", "econ-seguro-desemprego", "auth-lider-forte", "auth-policia-ordem", "auth-obedecer", "auth-imprensa-crise"],
      esperado: { economico: -1, autoridade: 1 },
    },
    "conservadorismo-de-mercado": {
      concorda: ["econ-propriedade-privada", "econ-incentivo-esforco", "econ-responsabilidade-propria", "econ-competicao", "auth-lider-forte", "auth-policia-ordem", "auth-obedecer", "auth-imprensa-crise"],
      esperado: { economico: 1, autoridade: 1 },
    },
  };

  it.each(Object.entries(TRADICOES))("%s cai no quadrante certo", (nome, tradicao) => {
    // Concorda com o que a tradicao defende, discorda do oposto. Nao e a
    // posicao da tradicao escrita a mao: e o que ela responderia, passando
    // pela mesma conta que qualquer pessoa.
    const respostas = {};
    for (const id of tradicao.concorda) respostas[id] = { r: 2, m: 1 };
    for (const p of TODAS) {
      if (respostas[p.id]) continue;
      const par = TODAS.find((o) => o.par === p.par && o.id !== p.id);
      if (par && tradicao.concorda.includes(par.id)) respostas[p.id] = { r: -2, m: 1 };
    }

    const resultado = pontuar(TODAS, respostas);
    for (const [eixo, sinal] of Object.entries(tradicao.esperado)) {
      const posicao = resultado[eixo].posicao;
      expect(Math.sign(posicao), `${nome} no eixo ${eixo}`).toBe(sinal);
      expect(Math.abs(posicao), `${nome} deveria ser nitido no eixo ${eixo}`).toBeGreaterThan(5);
    }
  });
});

describe("9. rastreabilidade das fontes", () => {
  // O site promete que da para conferir de onde veio cada pergunta. Se essa
  // promessa quebrar em silencio, o projeto inteiro perde o sentido.
  it.each(TODAS.map((p) => [p.id, p]))("%s declara de onde veio", (_id, pergunta) => {
    expect(pergunta.fonte?.instrumento, "sem instrumento de origem").toBeTruthy();
    expect(pergunta.fonte?.item, "sem codigo do item").toBeTruthy();
    expect(["adaptado", "construto"]).toContain(pergunta.derivacao);
  });

  it("nenhuma escala com direitos aparece marcada como adaptada", () => {
    // Instrumento publico de pesquisa pode ter o item adaptado com citacao.
    // Escala psicometrica com direitos entra so como construto, com redacao
    // propria. Marcar errado nao e detalhe de estilo: e problema juridico.
    const COM_DIREITOS = [
      "New Ecological Paradigm",
      "Very Short Authoritarianism",
      "SDO7",
      "Moral Foundations Questionnaire",
    ];
    for (const pergunta of TODAS) {
      if (COM_DIREITOS.includes(pergunta.fonte.instrumento)) {
        expect(pergunta.derivacao, `${pergunta.id} cita ${pergunta.fonte.instrumento}`).toBe(
          "construto",
        );
      }
    }
  });

  it("todo id e unico", () => {
    const ids = TODAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda pergunta pertence a um eixo conhecido e tem peso util", () => {
    for (const pergunta of TODAS) {
      expect(EIXOS).toContain(pergunta.eixo);
      expect(Math.abs(pergunta.peso)).toBeGreaterThan(0);
      expect(Math.abs(pergunta.peso)).toBeLessThanOrEqual(1);
    }
  });
});
