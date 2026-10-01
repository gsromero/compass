// As Functions nao importam do client (runtime separado), entao algumas listas
// vivem copiadas la. Este teste e o que impede uma copia de ficar para tras em
// silencio: ele roda no build, e vermelho aqui barra o deploy.
import { describe, expect, it } from "vitest";
import { TODAS, VERSAO_BANCO } from "./questions.js";
import { FAIXAS_ETARIAS, GENEROS } from "./demografia.js";
import { VERSAO } from "../../../functions/api/_versao.js";
import { IDS_PERGUNTAS } from "../../../functions/api/_perguntas.js";
import {
  FAIXAS_ETARIAS as FAIXAS_SERVIDOR,
  GENEROS as GENEROS_SERVIDOR,
} from "../../../functions/api/respostas.js";

describe("copias do servidor", () => {
  it("a versao dos agregados e a do banco de perguntas", () => {
    expect(VERSAO).toBe(VERSAO_BANCO);
  });

  it("os ids aceitos pelo POST sao os do banco de perguntas", () => {
    expect([...IDS_PERGUNTAS].sort()).toEqual(TODAS.map((p) => p.id).sort());
  });

  it("as listas de demografia sao as mesmas dos dois lados", () => {
    expect([...FAIXAS_SERVIDOR].sort()).toEqual([...FAIXAS_ETARIAS].sort());
    expect([...GENEROS_SERVIDOR].sort()).toEqual([...GENEROS].sort());
  });
});
