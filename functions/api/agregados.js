// GET /api/agregados
// Os numeros da populacao: total, distribuicao e media por eixo, os pontos do
// grafico, quadrantes, quem respondeu, concordancia de cada afirmacao e media
// por pergunta dentro de cada quadrante. Alimenta a tela de resultado e a
// pagina publica de Resultados.
//
// Guardado no cache da propria plataforma por 10 minutos. Pages Functions nao
// tem cron, entao nao existe job recalculando isso sozinho: a primeira visita
// depois do cache vencer paga o custo e as seguintes viajam de graca.
//
// Abaixo de MINIMO respostas devolve `suficiente: false`, e a tela esconde as
// secoes de comparacao em vez de mostrar grafico vazio. Numero de percentil
// tirado de 6 pessoas nao e informacao, e ruido com cara de informacao.

import { VERSAO } from "./_versao.js";

const EIXOS = ["economico", "autoridade", "fronteiras", "costumes", "ecologia", "povo"];
const MINIMO = 50;
// Menor grupo de idade, genero ou idioma que mostra o numero (ver demografia).
const MINIMO_GRUPO = 10;
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
    const contagem = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM respostas WHERE versao = ?",
    )
      .bind(VERSAO)
      .first();
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
         FROM respostas WHERE versao = ? GROUP BY faixa`,
    )
      .bind(VERSAO)
      .all();
    for (const linha of linhas.results ?? []) {
      if (distribuicao[linha.faixa]) distribuicao[linha.faixa].n = linha.n;
    }
    eixos[eixo] = { distribuicao };
  }

  // Onde cada um caiu nos dois eixos do grafico, agrupado de 1 em 1 ponto:
  // quem caiu perto vira o mesmo grupo, com a contagem. A tela desenha um ponto
  // por pessoa, espalhado dentro do grupo. Vai SO a posicao, sem idade, genero
  // ou qualquer outro dado junto: um ponto nao diz de quem e. Antes era uma
  // grade grossa de 2 em 2 borrada; o dono aprovou trocar pelos pontos em
  // 2026-10-02 sabendo que a posicao fica mais precisa.
  const grupos = await env.DB.prepare(
    `SELECT CAST(ROUND(economico) AS INTEGER) AS e, CAST(ROUND(autoridade) AS INTEGER) AS a,
            COUNT(*) AS n
       FROM respostas WHERE versao = ? GROUP BY e, a`,
  )
    .bind(VERSAO)
    .all();
  const pontos = (grupos.results ?? []).map(({ e, a, n }) => ({ e, a, n }));

  // A media de cada eixo, para a pagina publica de Resultados.
  const somas = await env.DB.prepare(
    `SELECT ${EIXOS.map((eixo) => `AVG(${eixo}) AS ${eixo}`).join(", ")}
       FROM respostas WHERE versao = ?`,
  )
    .bind(VERSAO)
    .first();
  const medias = Object.fromEntries(
    EIXOS.map((eixo) => [eixo, Number((somas?.[eixo] ?? 0).toFixed(2))]),
  );

  const porQuadrante = await env.DB.prepare(
    "SELECT quadrante, COUNT(*) AS n FROM respostas WHERE versao = ? GROUP BY quadrante",
  )
    .bind(VERSAO)
    .all();
  const quadrantes = Object.fromEntries(
    (porQuadrante.results ?? []).map((linha) => [linha.quadrante, linha.n]),
  );

  // Quem respondeu. Grupo com menos de MINIMO_GRUPO pessoas sai daqui como
  // null, sem numero: com poucas pessoas, "55 a 64: 1" ajudaria a reconhecer
  // alguem. Nunca cruza idade com genero nem com posicao.
  const contar = async (coluna) => {
    const linhas = await env.DB.prepare(
      `SELECT ${coluna} AS valor, COUNT(*) AS n FROM respostas WHERE versao = ? GROUP BY ${coluna}`,
    )
      .bind(VERSAO)
      .all();
    return Object.fromEntries(
      (linhas.results ?? []).map(({ valor, n }) => [valor ?? "nao_disse", n >= MINIMO_GRUPO ? n : null]),
    );
  };
  const demografia = {
    idade: await contar("faixa_etaria"),
    genero: await contar("genero"),
    idioma: await contar("idioma"),
  };

  // Concordancia de cada afirmacao, somando todo mundo (o "nao sei" a parte).
  const porAfirmacao = await env.DB.prepare(
    `SELECT pergunta, SUM(r > 0) AS concordam, SUM(r < 0) AS discordam, SUM(r = 0) AS nao_sei
       FROM itens WHERE versao = ? GROUP BY pergunta`,
  )
    .bind(VERSAO)
    .all();
  const afirmacoes = Object.fromEntries(
    (porAfirmacao.results ?? []).map(({ pergunta, ...resto }) => [pergunta, resto]),
  );

  // Media por pergunta dentro de cada quadrante: alimenta o "onde voce destoa".
  const porPergunta = {};
  // O "nao sei" (r = 0) fica de fora: ele nao e uma opiniao central, e entrar
  // na media puxaria a media do quadrante para o meio sem que ninguem tenha
  // dito nada. Mesma regra da conta individual, em lib/scoring.js.
  const mediasPorQuadrante = await env.DB.prepare(
    `SELECT quadrante, pergunta, AVG(r) AS media, COUNT(*) AS n
       FROM itens WHERE versao = ? AND r != 0
       GROUP BY quadrante, pergunta HAVING n >= 10`,
  )
    .bind(VERSAO)
    .all();
  for (const linha of mediasPorQuadrante.results ?? []) {
    porPergunta[linha.quadrante] ??= {};
    porPergunta[linha.quadrante][linha.pergunta] = {
      media: Number(linha.media.toFixed(2)),
      n: linha.n,
    };
  }

  return {
    suficiente: true,
    total,
    minimo: MINIMO,
    minimoGrupo: MINIMO_GRUPO,
    eixos,
    pontos,
    medias,
    quadrantes,
    demografia,
    afirmacoes,
    porPergunta,
  };
}
