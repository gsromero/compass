// TODAS as strings de interface, em pt e en. Nada de texto fixo no JSX.
// O texto das PERGUNTAS mora em data/questions.json, e o das TRADICOES em
// data/tradicoes.json, os dois nos mesmos dois idiomas.
// Regra: sem travessao (em dash) em nenhum idioma.
// Valor pode ser funcao quando tem numero ou nome no meio.

export const LANGS = ["pt", "en"];

const dict = {
  pt: {
    // marca e navegacao
    marca: "Compass",
    tagline: "Onde você está no espectro político, e por quê",
    nav_sobre: "Sobre",
    nav_metodologia: "Metodologia",
    nav_idioma: "English",
    nav_tema_escuro: "Mudar para o tema escuro",
    nav_tema_claro: "Mudar para o tema claro",
    rodape_privacidade: "Nada aqui identifica quem respondeu",
    rodape_codigo: "Código aberto",

    // entrada
    home_titulo: "Um teste político que mostra a conta",
    home_intro:
      "Duas perguntas que quase nenhum teste político responde: de onde vêm as afirmações, e o quanto o resultado é confiável. Aqui as duas estão respondidas na tela.",
    home_diferenca_1_titulo: "As perguntas vêm de pesquisa de verdade",
    home_diferenca_1:
      "As 48 afirmações derivam de instrumentos usados em pesquisa acadêmica, com o código do item registrado e conferível.",
    home_diferenca_2_titulo: "O equilíbrio é provado, não prometido",
    home_diferenca_2:
      "Quem concorda com todas as afirmações cai no centro do gráfico. Isso é testado automaticamente a cada mudança.",
    home_diferenca_3_titulo: "O resultado vem com margem de erro",
    home_diferenca_3:
      "Você recebe uma área, não um ponto de precisão falsa, mais as respostas que mais puxaram cada eixo.",
    home_escolha_modo: "Quanto tempo você tem?",
    home_comecar: "Começar",
    home_retomar: "Continuar de onde parei",
    home_recomecar: "Começar de novo",
    home_tem_teste: (n) => `Você tem um teste em andamento, com ${n} de resposta.`,

    modo_rapido: "Rápido",
    modo_padrao: "Padrão",
    modo_completo: "Completo",
    modo_rapido_desc: "16 perguntas, cerca de 3 minutos",
    modo_padrao_desc: "32 perguntas, cerca de 6 minutos",
    modo_completo_desc: "48 perguntas, precisão máxima",

    // questionario
    teste_progresso: (feitas, total) => `${feitas} de ${total}`,
    teste_voltar: "Voltar",
    teste_sair: "Sair do teste",
    teste_dica_teclado: "Use as teclas de 1 a 5 para responder e Backspace para voltar",
    teste_importancia: "Isso é importante para você?",
    teste_importancia_baixa: "Pouco",
    teste_importancia_normal: "Normal",
    teste_importancia_alta: "Muito",
    teste_calculando: "Montando seu resultado",

    // A chave inclui o sinal da nota (-2 a 2), porque e assim que a tela pede.
    "resposta-2": "Discordo muito",
    "resposta-1": "Discordo",
    resposta0: "Neutro ou não sei",
    resposta1: "Concordo",
    resposta2: "Concordo muito",

    // resultado
    res_titulo: "Seu resultado",
    res_margem: (m) => `margem de ${m}`,
    res_area_explicacao:
      "A área ao redor do ponto é a sua margem de erro. Ela é maior quando suas respostas se contradizem, e menor quando são coerentes entre si.",
    res_confianca_baixa_titulo: "Este resultado diz pouco sobre você",
    res_uniforme:
      "Você deu a mesma nota em todas as afirmações. Metade delas defende o contrário da outra metade, de propósito, então responder tudo igual se anula e o ponto cai no centro. É exatamente esse mecanismo que impede o teste de empurrar para algum lado quem responde no automático. Refaça lendo cada afirmação e o resultado passa a significar alguma coisa.",
    res_contraditorio:
      "Suas respostas se contradizem bastante entre si, então a área de incerteza ficou grande e a posição no gráfico é pouco confiável. Isso não é defeito do teste: é ele admitindo que não conseguiu te medir bem, em vez de fingir uma posição.",
    res_refazer_lendo: "Refazer com calma",
    res_esquerda_direita:
      "Esquerda e direita aqui são a dimensão econômica: mais igualdade e mais Estado de um lado, mais mercado e menos Estado do outro.",
    res_mancha: "A mancha mostra onde caiu quem já respondeu. Quanto mais forte, mais gente ali.",
    res_eixos_secundarios: "Os outros quatro eixos",
    res_por_que: "Por que você caiu aqui",
    res_por_que_intro:
      "As respostas que mais puxaram cada eixo, com o instrumento de onde a afirmação veio.",
    res_puxou_para: (polo) => `puxou para ${polo}`,
    res_tradicoes: "Tradições mais próximas de você",
    res_tradicoes_intro:
      "Proximidade medida nos seis eixos. Estar perto de uma tradição não significa concordar com ela em tudo.",
    res_proximidade: (p) => `${p}% de proximidade`,
    res_compartilhar: "Compartilhar",
    res_baixar: "Baixar imagem",
    res_copiar_link: "Copiar link",
    res_link_copiado: "Link copiado",
    res_refazer: "Refazer o teste",
    res_layout: "Modelo do card",
    res_ver_metodologia: "Ver como a conta é feita",

    // populacao
    pop_titulo: "Comparado com quem já respondeu",
    pop_insuficiente: (n, minimo) =>
      `Ainda coletando respostas: ${n} de ${minimo}. Os números de comparação aparecem quando houver gente suficiente para eles significarem alguma coisa.`,
    pop_percentil: (pct, polo) => `Você está mais para ${polo} que ${pct}% de quem respondeu`,
    pop_destoa: "Onde você destoa da sua turma",
    pop_destoa_intro:
      "Afirmações em que sua resposta foge da média de quem caiu no mesmo quadrante que você.",
    pop_sua_resposta: "Você",
    pop_media_quadrante: "Média do seu quadrante",
    pop_total: (n) => `${n} respostas até agora`,

    // eixos
    eixo_economico: "Econômico",
    eixo_autoridade: "Autoridade",
    eixo_fronteiras: "Fronteiras",
    eixo_costumes: "Costumes",
    eixo_ecologia: "Ecologia",
    eixo_povo: "Decisão",

    // As CHAVES continuam igualdade/mercado porque sao identificadores
    // internos: estao no banco, nos nomes das cores dos quadrantes e na
    // validacao da API. So o texto mudou. "Esquerda" e "direita" e como as
    // pessoas reconhecem esse eixo, e e tambem o nome que a propria fonte usa:
    // a dimensao do Chapel Hill Expert Survey se chama "economic left-right".
    polo_igualdade: "Esquerda",
    polo_mercado: "Direita",
    polo_liberdade: "Liberdade",
    polo_autoridade: "Autoridade",
    polo_mundo: "Mundo",
    polo_nacao: "Nação",
    polo_progresso: "Progresso",
    polo_tradicao: "Tradição",
    polo_sustentabilidade: "Sustentabilidade",
    polo_crescimento: "Crescimento",
    polo_instituicoes: "Instituições",
    polo_povo: "Povo",

    // estados
    erro_titulo: "Alguma coisa quebrou",
    erro_tentar: "Tentar de novo",
    carregando: "Carregando",
    nao_encontrado: "Não encontramos essa página",
    voltar_inicio: "Voltar ao início",

    // paginas de texto
    sobre_titulo: "Sobre",
    metodologia_titulo: "Metodologia",
    tradicoes_titulo: "Tradições ideológicas",
    fonte_adaptado: "adaptado do item",
    fonte_construto: "redação própria, baseada em",
  },

  en: {
    marca: "Compass",
    tagline: "Where you land on the political spectrum, and why",
    nav_sobre: "About",
    nav_metodologia: "Methodology",
    nav_idioma: "Português",
    nav_tema_escuro: "Switch to dark theme",
    nav_tema_claro: "Switch to light theme",
    rodape_privacidade: "Nothing here identifies who answered",
    rodape_codigo: "Open source",

    home_titulo: "A political test that shows its work",
    home_intro:
      "Two questions almost no political test answers: where the statements come from, and how much the result can be trusted. Both are answered on screen here.",
    home_diferenca_1_titulo: "The questions come from real research",
    home_diferenca_1:
      "All 48 statements derive from instruments used in academic research, with the source item code recorded and checkable.",
    home_diferenca_2_titulo: "The balance is proven, not promised",
    home_diferenca_2:
      "Anyone who agrees with every statement lands at the center of the chart. That is tested automatically on every change.",
    home_diferenca_3_titulo: "The result comes with a margin of error",
    home_diferenca_3:
      "You get an area, not a dot of false precision, plus the answers that pulled each axis the most.",
    home_escolha_modo: "How much time do you have?",
    home_comecar: "Start",
    home_retomar: "Pick up where I left off",
    home_recomecar: "Start over",
    home_tem_teste: (n) => `You have a test in progress, ${n} answered.`,

    modo_rapido: "Quick",
    modo_padrao: "Standard",
    modo_completo: "Full",
    modo_rapido_desc: "16 questions, about 3 minutes",
    modo_padrao_desc: "32 questions, about 6 minutes",
    modo_completo_desc: "48 questions, maximum precision",

    teste_progresso: (feitas, total) => `${feitas} of ${total}`,
    teste_voltar: "Back",
    teste_sair: "Leave the test",
    teste_dica_teclado: "Press 1 to 5 to answer, Backspace to go back",
    teste_importancia: "Does this matter to you?",
    teste_importancia_baixa: "A little",
    teste_importancia_normal: "Normal",
    teste_importancia_alta: "A lot",
    teste_calculando: "Building your result",

    "resposta-2": "Strongly disagree",
    "resposta-1": "Disagree",
    resposta0: "Neutral or unsure",
    resposta1: "Agree",
    resposta2: "Strongly agree",

    res_titulo: "Your result",
    res_margem: (m) => `margin of ${m}`,
    res_area_explicacao:
      "The area around the dot is your margin of error. It grows when your answers contradict each other, and shrinks when they line up.",
    res_confianca_baixa_titulo: "This result says little about you",
    res_uniforme:
      "You gave the same answer to every statement. Half of them argue the opposite of the other half, by design, so answering everything the same cancels out and the dot lands at the center. That mechanism is exactly what stops the test from pushing anyone who answers on autopilot. Take it again reading each statement and the result starts to mean something.",
    res_contraditorio:
      "Your answers contradict each other quite a bit, so the uncertainty area came out large and the position on the chart is not reliable. That is not a flaw in the test: it is the test admitting it could not measure you well, instead of faking a position.",
    res_refazer_lendo: "Take it again slowly",
    res_esquerda_direita:
      "Left and right here mean the economic dimension: more equality and more state on one side, more market and less state on the other.",
    res_mancha: "The cloud shows where previous respondents landed. The stronger it is, the more people.",
    res_eixos_secundarios: "The other four axes",
    res_por_que: "Why you landed here",
    res_por_que_intro:
      "The answers that pulled each axis the most, with the instrument each statement came from.",
    res_puxou_para: (polo) => `pulled toward ${polo}`,
    res_tradicoes: "Traditions closest to you",
    res_tradicoes_intro:
      "Distance measured across all six axes. Being close to a tradition does not mean agreeing with all of it.",
    res_proximidade: (p) => `${p}% close`,
    res_compartilhar: "Share",
    res_baixar: "Download image",
    res_copiar_link: "Copy link",
    res_link_copiado: "Link copied",
    res_refazer: "Take it again",
    res_layout: "Card style",
    res_ver_metodologia: "See how the scoring works",

    pop_titulo: "Compared with everyone who answered",
    pop_insuficiente: (n, minimo) =>
      `Still collecting answers: ${n} of ${minimo}. Comparison numbers appear once there are enough people for them to mean anything.`,
    pop_percentil: (pct, polo) => `You lean toward ${polo} more than ${pct}% of respondents`,
    pop_destoa: "Where you differ from your own side",
    pop_destoa_intro:
      "Statements where your answer departs from the average of people in the same quadrant as you.",
    pop_sua_resposta: "You",
    pop_media_quadrante: "Your quadrant's average",
    pop_total: (n) => `${n} answers so far`,

    eixo_economico: "Economic",
    eixo_autoridade: "Authority",
    eixo_fronteiras: "Borders",
    eixo_costumes: "Custom",
    eixo_ecologia: "Ecology",
    eixo_povo: "Decision",

    polo_igualdade: "Left",
    polo_mercado: "Right",
    polo_liberdade: "Liberty",
    polo_autoridade: "Authority",
    polo_mundo: "World",
    polo_nacao: "Nation",
    polo_progresso: "Progress",
    polo_tradicao: "Tradition",
    polo_sustentabilidade: "Sustainability",
    polo_crescimento: "Growth",
    polo_instituicoes: "Institutions",
    polo_povo: "The people",

    erro_titulo: "Something broke",
    erro_tentar: "Try again",
    carregando: "Loading",
    nao_encontrado: "We could not find that page",
    voltar_inicio: "Back to the start",

    sobre_titulo: "About",
    metodologia_titulo: "Methodology",
    tradicoes_titulo: "Ideological traditions",
    fonte_adaptado: "adapted from item",
    fonte_construto: "own wording, based on",
  },
};

export function t(lang, chave, ...args) {
  const valor = dict[lang]?.[chave] ?? dict.pt[chave];
  if (valor === undefined) return chave;
  return typeof valor === "function" ? valor(...args) : valor;
}

/** Numero no idioma do app, nunca no locale do navegador. */
export function num(lang, valor, casas = 1) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}
