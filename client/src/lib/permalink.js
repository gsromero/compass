// O resultado inteiro codificado na URL.
//
// E isso que faz o link funcionar sem conta, sem cookie e sem consultar o
// banco: quem abre o link reconstroi as respostas e recalcula tudo, inclusive
// o "por que voce caiu aqui". Guardar so a posicao final economizaria espaco e
// perderia justamente a parte que explica.
//
// Cada resposta cabe em 4 bits: 0 e "nao respondeu", e 1 a 15 sao as 15
// combinacoes de nota (5) com importancia (3). Duas respostas por byte, mais
// um byte de versao do banco. 48 perguntas viram 25 bytes, ou cerca de 34
// caracteres na URL.

import { IMPORTANCIAS } from "./scoring.js";

const NOTAS = [-2, -1, 0, 1, 2];
const IMPS = [IMPORTANCIAS.baixa, IMPORTANCIAS.normal, IMPORTANCIAS.alta];

function paraNibble(resposta) {
  if (!resposta || typeof resposta.r !== "number") return 0;
  const i = NOTAS.indexOf(resposta.r);
  if (i < 0) return 0;
  const j = Math.max(0, IMPS.indexOf(resposta.m ?? IMPORTANCIAS.normal));
  return i * 3 + j + 1;
}

function deNibble(nibble) {
  if (nibble === 0) return null;
  const bruto = nibble - 1;
  return { r: NOTAS[Math.floor(bruto / 3)], m: IMPS[bruto % 3] };
}

function paraBase64Url(bytes) {
  let bruto = "";
  for (const b of bytes) bruto += String.fromCharCode(b);
  return btoa(bruto).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto) {
  const normal = texto.replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(normal + "=".repeat((4 - (normal.length % 4)) % 4));
  return Uint8Array.from(bruto, (c) => c.charCodeAt(0));
}

/** Respostas viram um codigo curto e seguro para URL. */
export function codificar(perguntas, respostas, versao) {
  const bytes = new Uint8Array(1 + Math.ceil(perguntas.length / 2));
  bytes[0] = versao & 0xff;
  perguntas.forEach((pergunta, i) => {
    const nibble = paraNibble(respostas[pergunta.id]);
    const posicao = 1 + (i >> 1);
    bytes[posicao] |= i % 2 === 0 ? nibble << 4 : nibble;
  });
  return paraBase64Url(bytes);
}

/**
 * Le o codigo de volta. Devolve null quando o codigo esta corrompido ou veio de
 * uma versao diferente do banco de perguntas: e melhor pedir para refazer o
 * teste do que mostrar um resultado que nao e o da pessoa.
 */
export function decodificar(perguntas, codigo, versao) {
  try {
    const bytes = deBase64Url(codigo);
    if (bytes.length < 1 || bytes[0] !== (versao & 0xff)) return null;

    const respostas = {};
    perguntas.forEach((pergunta, i) => {
      const byte = bytes[1 + (i >> 1)];
      if (byte === undefined) return;
      const nibble = i % 2 === 0 ? byte >> 4 : byte & 0x0f;
      const resposta = deNibble(nibble);
      if (resposta) respostas[pergunta.id] = resposta;
    });

    return Object.keys(respostas).length > 0 ? respostas : null;
  } catch {
    return null;
  }
}
