// A conta do teste, e fonte unica dela. Nenhuma tela recalcula nada por fora.
//
// Tres coisas moram aqui, e a segunda e a razao de existir do projeto:
//
// 1. POSICAO em cada eixo, de -10 a +10.
// 2. MARGEM DE ERRO, que sai do quanto as proprias respostas discordam entre si.
//    Ela desenha a elipse no grafico E decide quando parar de perguntar. Um
//    mecanismo so, dois usos: mexer aqui mexe nas duas coisas.
// 3. ESCOLHA DA PROXIMA PERGUNTA, sempre em PARES equilibrados. Se a escolha
//    fosse so pela informacao, o teste poderia montar um conjunto torto sem
//    querer e trazer o vies de aquiescencia de volta pela porta dos fundos.
//
// Convencao de sinal: peso NEGATIVO significa que concordar empurra para o polo
// "neg" do eixo (ver `eixos` em data/questions.json). Cada pergunta carrega
// exatamente um eixo, de proposito: e o que torna o equilibrio demonstravel.

export const EIXOS = ["economico", "autoridade", "fronteiras", "costumes", "ecologia", "povo"];

// Os dois que viram o grafico. Os outros quatro viram barras.
export const EIXOS_PRINCIPAIS = ["economico", "autoridade"];

// Resposta: de discordo muito a concordo muito. O zero e neutro de verdade e
// nao entra na conta de lado nenhum.
export const RESPOSTAS = [-2, -1, 0, 1, 2];

// Peso opcional que a pessoa da para a propria resposta.
export const IMPORTANCIAS = { baixa: 0.5, normal: 1, alta: 1.5 };

export const MODOS = {
  rapido: { pares: 8 },
  padrao: { pares: 16 },
  completo: { pares: Infinity },
};

// Margem (na escala de -10 a +10) abaixo da qual um eixo ja esta resolvido.
const LIMIAR_MARGEM = 1.5;
// Nao para antes disto, por mais consistente que a pessoa pareca: duas
// respostas concordantes sao coincidencia, nao informacao.
const MINIMO_PARES_POR_EIXO = 2;

// Variancia de uma opiniao sobre a qual nao sabemos nada (uniforme em [-1,1]).
// Serve de prior: sem ela, quem respondeu UMA pergunta num eixo apareceria com
// margem zero, que e o tipo de precisao falsa que este projeto existe para nao
// cometer.
const VARIANCIA_PRIOR = 1 / 3;
const PESO_PRIOR = 1;

function importanciaDe(resposta) {
  const m = resposta?.m;
  return typeof m === "number" && m > 0 ? m : IMPORTANCIAS.normal;
}

/**
 * Posicao e margem de erro de UM eixo.
 * @returns {{posicao: number, margem: number, n: number}} posicao e margem na escala de -10 a +10
 */
export function pontuarEixo(perguntas, respostas, eixo) {
  const itens = [];
  for (const p of perguntas) {
    if (p.eixo !== eixo) continue;
    const resposta = respostas[p.id];
    if (!resposta || typeof resposta.r !== "number") continue;

    const peso = Math.abs(p.peso) * importanciaDe(resposta);
    if (peso <= 0) continue;
    // Onde ESTA resposta, sozinha, colocaria a pessoa no eixo (-1 a +1).
    const palpite = (resposta.r * Math.sign(p.peso)) / 2;
    itens.push({ peso, palpite });
  }

  // Ninguem respondeu nada deste eixo: centro, e incerteza total.
  if (itens.length === 0) return { posicao: 0, margem: 10, n: 0 };

  const somaPesos = itens.reduce((s, i) => s + i.peso, 0);
  const media = itens.reduce((s, i) => s + (i.peso / somaPesos) * i.palpite, 0);

  // Tamanho efetivo da amostra (Kish): respostas marcadas como pouco
  // importantes contam menos, inclusive para a confianca no resultado.
  const somaQuadrados = itens.reduce((s, i) => s + (i.peso / somaPesos) ** 2, 0);
  const nEfetivo = 1 / somaQuadrados;

  const variancia = itens.reduce(
    (s, i) => s + (i.peso / somaPesos) * (i.palpite - media) ** 2,
    0,
  );
  // Mistura o que as respostas mostram com o prior, pesando pelo tamanho da
  // amostra: com poucas respostas o prior domina; com muitas, some.
  const varianciaPosterior =
    (nEfetivo * variancia + PESO_PRIOR * VARIANCIA_PRIOR) / (nEfetivo + PESO_PRIOR);
  const erroPadrao = Math.sqrt(varianciaPosterior / (nEfetivo + PESO_PRIOR));

  return {
    posicao: media * 10,
    margem: Math.min(erroPadrao * 10, 10),
    n: itens.length,
  };
}

/**
 * Posicao e margem em todos os eixos.
 * @returns {Record<string, {posicao: number, margem: number, n: number}>}
 */
export function pontuar(perguntas, respostas) {
  const resultado = {};
  for (const eixo of EIXOS) resultado[eixo] = pontuarEixo(perguntas, respostas, eixo);
  return resultado;
}

/**
 * Quadrante do grafico, pelos dois eixos principais. Exatamente no zero conta
 * como o lado "neg", para nao existir um quinto quadrante de um ponto so.
 */
export function quadrante(resultado) {
  const economico = resultado.economico.posicao > 0 ? "mercado" : "igualdade";
  const autoridade = resultado.autoridade.posicao > 0 ? "autoridade" : "liberdade";
  return `${economico}-${autoridade}`;
}

// --- Escolha das perguntas -------------------------------------------------

/** Agrupa as perguntas pelos pares de balanco declarados no banco. */
export function agruparPares(perguntas) {
  const pares = new Map();
  for (const p of perguntas) {
    if (!pares.has(p.par)) pares.set(p.par, []);
    pares.get(p.par).push(p);
  }
  return pares;
}

function parCompleto(par, respostas) {
  return par.every((p) => respostas[p.id] && typeof respostas[p.id].r === "number");
}

function parIntocado(par, respostas) {
  return par.every((p) => !respostas[p.id]);
}

/**
 * O proximo par a perguntar, ou null quando o teste acabou.
 *
 * Escolhe o par de maior peso do eixo mais incerto no momento. Pares inteiros,
 * nunca metade: e isso que garante que qualquer subconjunto de perguntas
 * continue equilibrado, e que quem concorda com tudo caia no centro mesmo no
 * modo rapido.
 */
export function proximoPar(perguntas, respostas, modo = "padrao") {
  const limite = (MODOS[modo] ?? MODOS.padrao).pares;
  const pares = agruparPares(perguntas);

  // Par comecado e nao terminado tem prioridade sobre tudo: deixar pela metade
  // e exatamente o que desequilibraria a conta.
  for (const [nome, par] of pares) {
    if (!parIntocado(par, respostas) && !parCompleto(par, respostas)) {
      return { par: nome, perguntas: par };
    }
  }

  const completos = [...pares.values()].filter((par) => parCompleto(par, respostas));
  if (completos.length >= limite) return null;

  const resultado = pontuar(perguntas, respostas);
  const paresPorEixo = {};
  for (const eixo of EIXOS) {
    paresPorEixo[eixo] = [...pares.values()].filter(
      (par) => par[0].eixo === eixo && parCompleto(par, respostas),
    ).length;
  }

  // Todo eixo ja tem base minima e nenhum esta indefinido: acabou antes do
  // limite, que e a promessa do modo adaptativo.
  const todosResolvidos = EIXOS.every(
    (eixo) =>
      paresPorEixo[eixo] >= MINIMO_PARES_POR_EIXO && resultado[eixo].margem <= LIMIAR_MARGEM,
  );
  if (todosResolvidos) return null;

  const candidatos = [...pares.entries()].filter(([, par]) => parIntocado(par, respostas));
  if (candidatos.length === 0) return null;

  candidatos.sort(([, a], [, b]) => {
    const margemA = resultado[a[0].eixo].margem;
    const margemB = resultado[b[0].eixo].margem;
    if (margemB !== margemA) return margemB - margemA;
    return Math.abs(b[0].peso) - Math.abs(a[0].peso);
  });

  const [nome, par] = candidatos[0];
  return { par: nome, perguntas: par };
}

/** Quantas perguntas o teste ainda pretende fazer, para a barra de progresso. */
export function totalPrevisto(perguntas, modo = "padrao") {
  const limite = (MODOS[modo] ?? MODOS.padrao).pares;
  const pares = agruparPares(perguntas);
  return Math.min(pares.size, limite) * 2;
}

/**
 * As respostas que mais puxaram um eixo, da maior para a menor.
 * E o que alimenta o "por que voce caiu aqui" na tela de resultado.
 */
export function contribuicoes(perguntas, respostas, eixo) {
  return perguntas
    .filter((p) => p.eixo === eixo && respostas[p.id])
    .map((p) => {
      const resposta = respostas[p.id];
      const empurrao = resposta.r * p.peso * importanciaDe(resposta);
      return { pergunta: p, resposta, empurrao };
    })
    .filter((c) => c.empurrao !== 0)
    .sort((a, b) => Math.abs(b.empurrao) - Math.abs(a.empurrao));
}
