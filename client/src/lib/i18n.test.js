// Chave de i18n que nao existe nao quebra nada: ela aparece na tela como
// "resposta-2", crua, e o site parece inacabado sem dar nenhum erro.
//
// Este arquivo existe porque isso aconteceu de verdade: as tres primeiras
// opcoes de resposta ficaram mostrando a chave, e 320 testes passaram por
// cima sem notar. Toda chave montada em tempo de execucao (`t(\`eixo_${x}\`)`)
// tem que estar listada aqui.

import { describe, expect, it } from "vitest";
import { LANGS, t } from "./i18n.js";
import { EIXOS_META } from "./questions.js";
import { EIXOS, MODOS, RESPOSTAS } from "./scoring.js";

/** Uma chave que nao existe volta como ela mesma: e assim que se detecta. */
function falta(lang, chave) {
  return t(lang, chave) === chave;
}

const CHAVES_DINAMICAS = [
  ...RESPOSTAS.map((nota) => `resposta${nota}`),
  "teste_nao_sei",
  "teste_dica_arrasto",
  "teste_modo_lista",
  "teste_modo_cartao",
  "teste_nao_sei_ajuda",
  ...EIXOS.map((eixo) => `eixo_${eixo}`),
  ...Object.values(EIXOS_META).flatMap((meta) => [`polo_${meta.neg}`, `polo_${meta.pos}`]),
  ...Object.keys(MODOS).flatMap((modo) => [`modo_${modo}`, `modo_${modo}_desc`]),
  ...["baixa", "normal", "alta"].map((i) => `teste_importancia_${i}`),
  ...[1, 2, 3].flatMap((n) => [`home_diferenca_${n}`, `home_diferenca_${n}_titulo`]),
  "fonte_adaptado",
  "fonte_construto",
];

describe("chaves montadas em tempo de execucao", () => {
  it.each(LANGS)("todas resolvem em %s", (lang) => {
    const faltando = CHAVES_DINAMICAS.filter((chave) => falta(lang, chave));
    expect(faltando, `sem traducao em ${lang}`).toEqual([]);
  });

  it("as quatro respostas da escala tem texto, inclusive as negativas", () => {
    // O bug original: as chaves negativas usavam sublinhado no lugar do sinal.
    for (const lang of LANGS) {
      for (const nota of RESPOSTAS) {
        const texto = t(lang, `resposta${nota}`);
        expect(texto, `nota ${nota} em ${lang}`).not.toMatch(/^resposta/);
        expect(texto.length).toBeGreaterThan(4);
      }
    }
  });
});

describe("paridade entre os idiomas", () => {
  it("nenhuma chave existe so em um idioma", () => {
    // Comparando pelo que as duas tabelas respondem, e nao pelas chaves em si,
    // porque `t` cai para o portugues quando falta no ingles: sem isto, uma
    // string sem traducao passaria despercebida.
    const soEmUm = CHAVES_DINAMICAS.filter((chave) => t("pt", chave) === t("en", chave));
    // Nomes proprios podem coincidir; o que nao pode e a maioria coincidir.
    expect(soEmUm.length).toBeLessThan(CHAVES_DINAMICAS.length / 3);
  });

  it("sem travessao em nenhuma string de interface", () => {
    for (const lang of LANGS) {
      for (const chave of CHAVES_DINAMICAS) {
        expect(String(t(lang, chave))).not.toContain("—");
      }
    }
  });
});
