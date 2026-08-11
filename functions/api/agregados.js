// GET /api/agregados
// Os numeros da populacao: total, distribuicao por eixo, mancha do grafico e
// media por pergunta dentro de cada quadrante.
//
// Guardado no cache da propria plataforma por 10 minutos. Pages Functions nao
// tem cron, entao nao existe job recalculando isso sozinho: a primeira visita
// depois do cache vencer paga o custo e as seguintes viajam de graca.
//
// Abaixo de MINIMO respostas devolve `suficiente: false`, e a tela esconde as
// secoes de comparacao em vez de mostrar grafico vazio. Numero de percentil
// tirado de 6 pessoas nao e informacao, e ruido com cara de informacao.

const EIXOS = ["economico", "autoridade", "fronteiras", "costumes", "ecologia", "povo"];
const MINIMO = 50;
const CACHE_SEGUNDOS = 600;
const FAIXAS = 10; // de -10 a +10, em faixas de 2

function faixasVazias() {
  return Array.from({ length: FAIXAS }, (_, i) => ({ ate: -10 + (i + 1) * 2, n: 0 }));
}

export async function onRequestGet({ request, env, waitUntil }) {
  const cache = caches.default;
  const chave = new Request(new URL(request.url).origin + "/api/agregados", { method: "GET" });

  const guardado = await cache.match(chave);
  if (guardado) return guardado;

  const corpo = await calcular(env);
  const resposta = Response.json(corpo, {
    headers: { "cache-control": `public, max-age=${CACHE_SEGUNDOS}` },
  });
  waitUntil(cache.put(chave, resposta.clone()));
  return resposta;
}

async function calcular(env) {
  const base = { suficiente: false, total: 0, minimo: MINIMO };

  let total;
  try {
    const contagem = await env.DB.prepare("SELECT COUNT(*) AS n FROM respostas").first();
    total = contagem?.n ?? 0;
  } catch {
    // Banco fora do ar nao pode derrubar a tela de resultado.
    return base;
  }

  if (total < MINIMO) return { ...base, total };

  const eixos = {};
  for (const eixo of EIXOS) {
    const distribuicao = faixasVazias();
    // A faixa vai de -10 a +10 em passos de 2. O CAST trunca para o indice.
    const linhas = await env.DB.prepare(
      `SELECT MIN(9, MAX(0, CAST((${eixo} + 10) / 2 AS INTEGER))) AS faixa, COUNT(*) AS n
         FROM respostas GROUP BY faixa`,
    ).all();
    for (const linha of linhas.results ?? []) {
      if (distribuicao[linha.faixa]) distribuicao[linha.faixa].n = linha.n;
    }
    eixos[eixo] = { distribuicao };
  }

  // Mancha do grafico: uma grade grossa dos dois eixos principais, para nao
  // devolver um ponto por pessoa nem permitir reidentificar ninguem.
  const grade = await env.DB.prepare(
    `SELECT CAST(economico / 2 AS INTEGER) AS gx,
            CAST(autoridade / 2 AS INTEGER) AS gy,
            COUNT(*) AS n
       FROM respostas GROUP BY gx, gy`,
  ).all();
  const celulas = grade.results ?? [];
  const maior = celulas.reduce((m, c) => Math.max(m, c.n), 1);
  const mapa = {
    celulas: celulas.map((c) => ({
      economico: c.gx * 2 + 1,
      autoridade: c.gy * 2 + 1,
      densidade: c.n / maior,
    })),
  };

  // Media por pergunta dentro de cada quadrante: alimenta o "onde voce destoa".
  const porPergunta = {};
  const medias = await env.DB.prepare(
    `SELECT quadrante, pergunta, AVG(r) AS media, COUNT(*) AS n
       FROM itens GROUP BY quadrante, pergunta HAVING n >= 10`,
  ).all();
  for (const linha of medias.results ?? []) {
    porPergunta[linha.quadrante] ??= {};
    porPergunta[linha.quadrante][linha.pergunta] = {
      media: Number(linha.media.toFixed(2)),
      n: linha.n,
    };
  }

  return { suficiente: true, total, minimo: MINIMO, eixos, mapa, porPergunta };
}
