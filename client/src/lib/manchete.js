// A frase que abre o resultado: "Bem à Direita e mais para Autoridade".
//
// Aqui so se decide a INTENSIDADE de cada eixo principal e para qual polo ele
// aponta. O texto mora no i18n (`manchete_<eixo>_<intensidade>`), e usa so os
// nomes de polo que o grafico ja usa: nenhum rotulo novo, como "progressista"
// ou "conservador", que carregaria juizo.

import { EIXOS_PRINCIPAIS } from "./scoring.js";

// Cortes na escala de -10 a +10. Abaixo de CENTRO a frase diz "no centro":
// com a margem de erro tipica (perto de 1), um ponto ali nao tem lado definido.
export const CORTES = { centro: 1, leve: 3, media: 7 };

/** "centro", "leve", "media" ou "forte", pelo tamanho da posicao. */
export function intensidade(posicao) {
  const distancia = Math.abs(posicao);
  if (distancia < CORTES.centro) return "centro";
  if (distancia < CORTES.leve) return "leve";
  if (distancia < CORTES.media) return "media";
  return "forte";
}

/**
 * As partes da manchete, uma por eixo principal, prontas para o i18n.
 * @returns {{eixo: string, intensidade: string, polo: string}[]}
 */
export function partesDaManchete(resultado, eixosMeta) {
  return EIXOS_PRINCIPAIS.map((eixo) => {
    const posicao = resultado[eixo].posicao;
    const meta = eixosMeta[eixo];
    return {
      eixo,
      intensidade: intensidade(posicao),
      polo: posicao > 0 ? meta.pos : meta.neg,
    };
  });
}

/** A margem que a manchete cita: uma so quando os seis eixos tem a mesma. */
export function margemUnica(resultado, eixos) {
  const margens = eixos.map((eixo) => resultado[eixo].margem.toFixed(1));
  return margens.every((m) => m === margens[0]) ? resultado[eixos[0]].margem : null;
}
