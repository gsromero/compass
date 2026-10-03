// A regua dos partidos (Brazilian Legislative Surveys 2021), de 1 a 10, e a
// conta que empilha as siglas para nenhuma cair em cima da outra. Puro, sem
// DOM: a largura em pixels chega de quem desenha (components/SecaoPartidos.jsx).

/** O eixo economico do Compass (-10 a +10) levado para a regua de 1 a 10. */
export const paraRegua = (economico) => 5.5 + economico * 0.45;

/** Uma nota de 1 a 10 em porcentagem da largura da regua. */
export const naRegua = (valor) => ((Math.min(10, Math.max(1, valor)) - 1) / 9) * 100;

/** Os `quantos` partidos de media mais perto de `valor`, do mais perto ao mais longe. */
export function maisProximos(partidos, valor, quantos = 3) {
  return [...partidos]
    .sort((a, b) => Math.abs(a.media - valor) - Math.abs(b.media - valor))
    .slice(0, quantos);
}

/**
 * Cada sigla vira uma etiqueta centrada no seu ponto. Quem nao cabe na linha
 * de baixo sobe para a primeira linha onde caiba (da esquerda para a direita,
 * pela posicao). Devolve as etiquetas com `centro` e `linha` (0 = mais baixa)
 * e quantas linhas foram usadas.
 * @param {{sigla: string, x: number}[]} itens  x em pixels
 * @param {(sigla: string) => number} larguraDe largura da etiqueta em pixels
 */
export function empilharSiglas(itens, largura, larguraDe, folga = 4) {
  const fimDaLinha = [];
  const etiquetas = [...itens]
    .sort((a, b) => a.x - b.x)
    .map((item) => {
      const w = larguraDe(item.sigla);
      // Nao deixa a etiqueta sair pelas bordas da regua.
      const esq = Math.min(Math.max(0, item.x - w / 2), Math.max(0, largura - w));
      let linha = fimDaLinha.findIndex((fim) => fim + folga <= esq);
      if (linha < 0) {
        linha = fimDaLinha.length;
        fimDaLinha.push(0);
      }
      fimDaLinha[linha] = esq + w;
      return { ...item, centro: esq + w / 2, linha };
    });
  return { etiquetas, linhas: fimDaLinha.length };
}
