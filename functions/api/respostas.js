// POST /api/respostas
// Guarda uma resposta anonima, so para alimentar os numeros de comparacao.
//
// Nada que identifique quem respondeu entra aqui: nem IP, nem user agent, nem
// cookie. O id e sorteado e nao volta para o navegador, entao nem o proprio
// site consegue ligar duas respostas a mesma pessoa.

const EIXOS = ["economico", "autoridade", "fronteiras", "costumes", "ecologia", "povo"];
const QUADRANTES = new Set([
  "igualdade-liberdade",
  "igualdade-autoridade",
  "mercado-liberdade",
  "mercado-autoridade",
]);
const IDIOMAS = new Set(["pt", "en"]);
const MAX_ITENS = 60;

function erro(mensagem, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}

/** Valida tudo antes de aceitar: erro claro e melhor do que engolir lixo. */
function validar(corpo) {
  if (!corpo || typeof corpo !== "object") return "corpo invalido";
  if (!IDIOMAS.has(corpo.idioma)) return "idioma invalido";
  if (!Number.isInteger(corpo.versao) || corpo.versao < 1) return "versao invalida";
  if (!QUADRANTES.has(corpo.quadrante)) return "quadrante invalido";

  for (const eixo of EIXOS) {
    const valor = corpo.eixos?.[eixo];
    if (typeof valor !== "number" || !Number.isFinite(valor) || valor < -10 || valor > 10) {
      return `eixo ${eixo} invalido`;
    }
  }

  if (!Array.isArray(corpo.itens) || corpo.itens.length === 0) return "sem itens";
  if (corpo.itens.length > MAX_ITENS) return "itens demais";
  for (const item of corpo.itens) {
    if (typeof item?.id !== "string" || item.id.length > 60) return "id de pergunta invalido";
    if (!Number.isInteger(item.r) || item.r < -2 || item.r > 2) return "resposta invalida";
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("json invalido");
  }

  const problema = validar(corpo);
  if (problema) return erro(problema);

  const id = crypto.randomUUID();
  const agora = Date.now();

  const gravacoes = [
    env.DB.prepare(
      `INSERT INTO respostas
         (id, criado_em, idioma, versao, quadrante, economico, autoridade, fronteiras, costumes, ecologia, povo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      agora,
      corpo.idioma,
      corpo.versao,
      corpo.quadrante,
      ...EIXOS.map((eixo) => corpo.eixos[eixo]),
    ),
  ];

  // Em lote, nunca em laco: sao dezenas de linhas por resposta.
  const inserirItem = env.DB.prepare(
    `INSERT OR IGNORE INTO itens (resposta_id, pergunta, r, quadrante, versao)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const item of corpo.itens) {
    gravacoes.push(inserirItem.bind(id, item.id, item.r, corpo.quadrante, corpo.versao));
  }

  try {
    await env.DB.batch(gravacoes);
  } catch {
    return erro("nao consegui gravar", 500);
  }

  return Response.json({ ok: true }, { status: 201 });
}
