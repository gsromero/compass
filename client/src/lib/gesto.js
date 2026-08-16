// Arrastar o cartao vira uma resposta.
//
// Mora em lib/ e nao dentro do componente de proposito: gesto e a parte do
// sistema que quebra em silencio, porque ninguem escreve teste de arrastar. Com
// a decisao isolada aqui, o componente so aplica o que esta funcao decidiu, e o
// que importa fica testavel. Mesmo padrao de compass.js e perfil.js.
//
// A regra escolhida pelo dono: **a distancia e a intensidade**. A direcao diz
// se concorda ou discorda; o quanto voce arrastou diz o quanto. Nada de decorar
// quatro sentidos, e o polegar faz tudo sozinho.
//
// O "nao sei" NAO e um gesto: e um botao discreto embaixo do cartao. O defeito
// da resposta do meio nunca foi existir, foi ser o caminho mais facil.

// Limiares em fracao do ALCANCE, que e o quanto o dedo consegue arrastar nesta
// tela, e nao em fracao da largura do cartao.
//
// A diferenca importa e ja causou um defeito real. Medindo com os limiares
// presos ao cartao, as faixas ficavam assim:
//
//   iPhone SE       "concordo" 80px   vs "concordo muito" 87px    (1,1x)
//   desktop         "concordo" 152px  vs "concordo muito" 360px   (2,4x)
//   desktop grande  "concordo" 152px  vs "concordo muito" 610px   (4,0x)
//
// No celular o cartao quase preenche a tela e as duas medidas coincidem; no
// desktop o cartao para em 42rem e a janela continua crescendo, entao a faixa
// do "muito", que nao tem fim, inchava. Medindo pelo alcance, as duas faixas
// ficam iguais em qualquer tela.
const ZONA_MORTA = 0.14;
// Escolhido para as duas faixas terem o MESMO tamanho: com a zona morta em m,
// a faixa leve vale (f - m) e a forte vale (1 - f); igualando, f = (1 + m) / 2.
const LIMIAR_FORTE = 0.57;
// Teto do alcance, em fracao da largura do cartao. Sem ele, uma tela muito
// larga exigiria um arrasto absurdo para dizer "muito".
const TETO_ALCANCE = 0.6;
// Acima desta razao entre o movimento vertical e o horizontal, a pessoa esta
// rolando a pagina e nao respondendo.
const RAZAO_VERTICAL = 1.2;

/**
 * O quanto o dedo consegue arrastar nesta tela, em pixels: a distancia do
 * centro do cartao ate a borda mais proxima da janela, limitada pelo teto.
 *
 * @param {{left: number, width: number}} caixa posicao e largura do cartao
 * @param {number} larguraJanela
 */
export function alcanceDoArrasto(caixa, larguraJanela) {
  const largura = caixa?.width ?? 0;
  if (!(largura > 0) || !(larguraJanela > 0)) return 0;

  const centro = caixa.left + largura / 2;
  const ateBorda = Math.min(centro, larguraJanela - centro);
  return Math.max(1, Math.min(ateBorda, largura * TETO_ALCANCE));
}

/**
 * O quanto o arrasto avancou, de -1 a +1, para o retorno visual do cartao
 * (inclinacao, cor e o rotulo da resposta que seria dada).
 * O sinal e a direcao; 1 em modulo e o ponto onde a resposta vira "muito".
 */
export function progressoDoArrasto(dx, alcance) {
  if (!(alcance > 0) || !Number.isFinite(dx)) return 0;
  return Math.max(-1, Math.min(1, dx / alcance / LIMIAR_FORTE));
}

/**
 * Que resposta este arrasto quis dar.
 *
 * @param {number} dx deslocamento horizontal, em pixels
 * @param {number} dy deslocamento vertical, em pixels
 * @param {number} alcance o que `alcanceDoArrasto` devolveu, em pixels
 * @returns {-2|-1|1|2|null} null quando o arrasto nao deve responder nada
 */
export function intencaoDoArrasto(dx, dy, alcance) {
  if (!(alcance > 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;

  // Rolagem da pagina, nao resposta.
  if (Math.abs(dy) > Math.abs(dx) * RAZAO_VERTICAL) return null;

  const fracao = dx / alcance;
  const distancia = Math.abs(fracao);
  // Perto do centro o cartao so volta para o lugar: e como se desiste.
  if (distancia < ZONA_MORTA) return null;

  const sentido = fracao > 0 ? 1 : -1;
  const forte = distancia >= LIMIAR_FORTE;
  return sentido * (forte ? 2 : 1);
}

/** Para a interface saber onde ficam as fronteiras das duas zonas. */
export const LIMIARES = { zonaMorta: ZONA_MORTA, forte: LIMIAR_FORTE, teto: TETO_ALCANCE };
