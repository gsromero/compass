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
// O "nao sei" NAO e um gesto: e um botao discreto embaixo do cartao. Foi
// decisao de produto, e ela tem razao de ser: o defeito do neutro nunca foi
// existir, foi ser o caminho mais facil.

// Limiares em FRACAO DA LARGURA do cartao, nunca em pixels. O mesmo gesto
// precisa significar a mesma coisa num celular pequeno e num monitor grande.
const ZONA_MORTA = 0.06;
const LIMIAR_FORTE = 0.3;
// Acima desta razao entre o movimento vertical e o horizontal, a pessoa esta
// rolando a pagina e nao respondendo. A tela do teste rola 57px num iPhone SE,
// entao sem isto rolar responderia sem querer.
const RAZAO_VERTICAL = 1.2;

/**
 * O quanto o arrasto avancou, de -1 a +1, para o retorno visual do cartao
 * (inclinacao, cor e o rotulo da resposta que seria dada).
 * O sinal e a direcao; 1 em modulo e o ponto onde a resposta vira "muito".
 */
export function progressoDoArrasto(dx, largura) {
  if (!(largura > 0) || !Number.isFinite(dx)) return 0;
  const fracao = dx / largura / LIMIAR_FORTE;
  return Math.max(-1, Math.min(1, fracao));
}

/**
 * Que resposta este arrasto quis dar.
 *
 * @param {number} dx deslocamento horizontal, em pixels
 * @param {number} dy deslocamento vertical, em pixels
 * @param {number} largura largura do cartao, em pixels
 * @returns {-2|-1|1|2|null} null quando o arrasto nao deve responder nada
 */
export function intencaoDoArrasto(dx, dy, largura) {
  if (!(largura > 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;

  // Rolagem da pagina, nao resposta.
  if (Math.abs(dy) > Math.abs(dx) * RAZAO_VERTICAL) return null;

  const fracao = dx / largura;
  const distancia = Math.abs(fracao);
  // Perto do centro o cartao so volta para o lugar: e como se desiste.
  if (distancia < ZONA_MORTA) return null;

  const sentido = fracao > 0 ? 1 : -1;
  const forte = distancia >= LIMIAR_FORTE;
  return sentido * (forte ? 2 : 1);
}

/** Para a interface saber onde desenhar as marcas das duas zonas. */
export const LIMIARES = { zonaMorta: ZONA_MORTA, forte: LIMIAR_FORTE };
