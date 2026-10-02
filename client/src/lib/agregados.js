// Os numeros da populacao: percentil, pontos no grafico e "onde voce destoa".
//
// Nunca lanca. Sem servidor, sem banco ou com resposta estranha, o site
// continua funcionando: o resultado individual nao depende disso em nada, e as
// secoes de comparacao simplesmente nao aparecem. Vazio falso em cima de erro
// e o que este arquivo existe para evitar.

const VAZIO = { suficiente: false, total: 0, minimo: 50 };

/**
 * Por onde cada resposta foi dada. Vai junto de cada item no POST, para medir
 * se o arrasto puxa respostas mais extremas que o toque.
 * GOTCHA: functions/api/respostas.js valida contra uma COPIA desta lista
 * (runtime separado). sincronia.test.js compara as duas.
 */
export const VIAS = ["arrasto", "botao", "teclado"];

/**
 * Busca os numeros e LANCA se nao conseguir. Para a pagina de Resultados, que
 * precisa distinguir "ainda sao poucas respostas" de "deu erro" (e oferecer
 * tentar de novo), em vez de mostrar vazio falso.
 */
export async function buscarAgregados() {
  const resposta = await fetch("/api/agregados");
  if (!resposta.ok) throw new Error(`agregados: ${resposta.status}`);
  const dados = await resposta.json();
  if (typeof dados?.total !== "number") throw new Error("agregados: formato");
  return dados;
}

/** Para a tela de resultado: nunca lanca, e sem numeros a comparacao some. */
export async function carregarAgregados() {
  try {
    return await buscarAgregados();
  } catch {
    return VAZIO;
  }
}

/**
 * Manda o resultado para o banco, de forma anonima. Falhar aqui nao pode
 * atrapalhar quem esta vendo o proprio resultado, entao o erro morre aqui.
 */
export async function enviarResposta(corpo) {
  try {
    await fetch("/api/respostas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    /* silencio proposital */
  }
}

/** Em quantos por cento das pessoas voce esta mais para um lado do que elas. */
export function percentil(agregados, eixo, posicao) {
  const dist = agregados?.eixos?.[eixo]?.distribuicao;
  if (!Array.isArray(dist) || dist.length === 0) return null;

  const total = dist.reduce((s, faixa) => s + faixa.n, 0);
  if (total === 0) return null;

  const abaixo = dist
    .filter((faixa) => faixa.ate <= posicao)
    .reduce((s, faixa) => s + faixa.n, 0);
  return Math.round((abaixo / total) * 100);
}

/**
 * As afirmacoes em que a pessoa mais destoa de quem caiu no mesmo quadrante.
 * E o insight que nenhum teste desses entrega, e por isso ele so aparece
 * quando existe base para ele significar alguma coisa.
 */
export function ondeDestoa(agregados, respostas, perguntas, quadrante, quantas = 3) {
  const medias = agregados?.porPergunta?.[quadrante];
  if (!medias) return [];

  return perguntas
    .filter((p) => respostas[p.id] && typeof medias[p.id]?.media === "number")
    .map((p) => ({
      pergunta: p,
      sua: respostas[p.id].r,
      media: medias[p.id].media,
      diferenca: Math.abs(respostas[p.id].r - medias[p.id].media),
    }))
    .filter((item) => item.diferenca >= 1)
    .sort((a, b) => b.diferenca - a.diferenca)
    .slice(0, quantas);
}
