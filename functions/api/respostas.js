// POST /api/respostas
// Guarda uma resposta anonima, so para alimentar os numeros de comparacao.
//
// Nada que identifique quem respondeu entra aqui: nem IP, nem user agent, nem
// cookie. O id e sorteado e nao volta para o navegador, entao nem o proprio
// site consegue ligar duas respostas a mesma pessoa.

import { IDS_PERGUNTAS } from "./_perguntas.js";

const EIXOS = ["economico", "autoridade", "fronteiras", "costumes", "ecologia", "povo"];
const QUADRANTES = new Set([
  "igualdade-liberdade",
  "igualdade-autoridade",
  "mercado-liberdade",
  "mercado-autoridade",
]);
const IDIOMAS = new Set(["pt", "en"]);
const MAX_ITENS = 60;
const DIA_MS = 24 * 60 * 60 * 1000;

// Mesma lista de client/src/lib/demografia.js. Nao da para importar de la:
// Pages Functions e um runtime separado do bundle do client. Mudou aqui,
// muda la tambem. Os dois campos sao OPCIONAIS: a pessoa pode pular a etapa.
export const FAIXAS_ETARIAS = new Set(["16-24", "25-34", "35-44", "45-54", "55-64", "65+"]);
export const GENEROS = new Set(["feminino", "masculino", "outro", "nao_informado"]);

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

  // O quadrante sai do sinal dos dois eixos principais (mesma regra de
  // quadrante() em lib/scoring.js). Um que nao bate e envio montado a mao.
  // Exatamente 0 aceita os dois lados: o cliente arredonda para 3 casas, e
  // 0,0001 (lado "mercado") chega aqui como 0.
  const [ladoEcon, ladoAut] = corpo.quadrante.split("-");
  const bate = (valor, positivo, lado) => valor === 0 || (valor > 0) === (lado === positivo);
  if (
    !bate(corpo.eixos.economico, "mercado", ladoEcon) ||
    !bate(corpo.eixos.autoridade, "autoridade", ladoAut)
  ) {
    return "quadrante nao bate com os eixos";
  }

  if (!Array.isArray(corpo.itens) || corpo.itens.length === 0) return "sem itens";
  if (corpo.itens.length > MAX_ITENS) return "itens demais";
  const vistos = new Set();
  for (const item of corpo.itens) {
    if (!IDS_PERGUNTAS.has(item?.id)) return "id de pergunta invalido";
    if (vistos.has(item.id)) return "pergunta repetida";
    vistos.add(item.id);
    if (!Number.isInteger(item.r) || item.r < -2 || item.r > 2) return "resposta invalida";
  }

  // Opcionais: null/undefined (pulou a etapa) sempre passa. So valida quando
  // vem preenchido, contra a mesma lista fechada do cliente.
  if (corpo.faixaEtaria != null && !FAIXAS_ETARIAS.has(corpo.faixaEtaria)) {
    return "faixa etaria invalida";
  }
  if (corpo.genero != null && !GENEROS.has(corpo.genero)) return "genero invalido";

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
  // So o dia (inicio, em UTC), nunca a hora: o momento exato nao serve a
  // nenhum agregado e, junto de idade e genero, ajudaria a apontar alguem.
  const agora = Math.floor(Date.now() / DIA_MS) * DIA_MS;

  const gravacoes = [
    env.DB.prepare(
      `INSERT INTO respostas
         (id, criado_em, idioma, versao, quadrante, economico, autoridade, fronteiras, costumes, ecologia, povo, faixa_etaria, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      agora,
      corpo.idioma,
      corpo.versao,
      corpo.quadrante,
      ...EIXOS.map((eixo) => corpo.eixos[eixo]),
      corpo.faixaEtaria ?? null,
      corpo.genero ?? null,
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
