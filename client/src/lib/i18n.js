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
    nav_inicio: "Início",
    nav_sobre: "Sobre",
    nav_metodologia: "Metodologia",
    nav_tradicoes: "Tradições",
    nav_tradicoes_detalhe: (n) => `${n} correntes de pensamento`,
    nav_principal: "Menu principal",
    nav_rodape: "Links do rodapé",
    nav_menu_abrir: "Abrir menu",
    nav_menu_fechar: "Fechar menu",
    nav_idioma_pt: "PT-BR",
    nav_idioma_en: "EN-US",
    nav_tema_escuro: "Mudar para o tema escuro",
    nav_tema_claro: "Mudar para o tema claro",
    rodape_privacidade: "Nada aqui identifica quem respondeu",
    rodape_codigo: "Código aberto",

    // entrada
    home_titulo: "Onde você está no espectro político",
    home_intro:
      "Um teste de 48 afirmações tiradas de pesquisas acadêmicas, com os pesos publicados e a margem de erro na tela.",
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
    modo_rapido_qtd: "16 perguntas",
    modo_padrao_qtd: "32 perguntas",
    modo_completo_qtd: "48 perguntas",
    modo_rapido_tempo: "3 min",
    modo_padrao_tempo: "6 min",
    modo_completo_tempo: "precisão máxima",
    home_amostra_titulo: "No fim você recebe",
    home_amostra_posicao: "Sua posição, com a margem de erro desenhada",
    home_amostra_eixos: "Seis eixos, não só esquerda e direita",
    home_amostra_fontes: "A fonte de cada pergunta, e por que você caiu ali",
    home_amostra_tradicoes: "As tradições mais próximas, com leituras",

    // questionario
    teste_progresso: (n, total) => `Pergunta ${n} de ${total}`,
    teste_voltar: "Voltar",
    teste_sair: "Sair do teste",
    teste_dica_teclado: "Use as teclas de 1 a 4 para responder e Backspace para voltar",
    teste_dica_arrasto: "Arraste para o lado. Quanto mais longe, mais forte a resposta.",
    teste_dica_arrasto_esq: "← arraste para discordar",
    teste_dica_arrasto_dir: "para concordar →",
    teste_modo_lista: "Usar lista",
    teste_modo_cartao: "Usar cartão",
    teste_nao_sei: "Não sei dizer",
    teste_nao_sei_ajuda:
      "Esta afirmação não entra na sua conta. Nem ela, nem a afirmação oposta que faz par com ela.",
    teste_importancia: "Peso desta resposta",
    teste_importancia_baixa: "Pouco",
    teste_importancia_normal: "Normal",
    teste_importancia_alta: "Muito",
    teste_calculando: "Montando seu resultado",

    // demografia (opcional, antes da primeira pergunta)
    teste_demografia_titulo: "Antes de começar",
    teste_demografia_idade: "Faixa etária (opcional)",
    teste_demografia_genero: "Gênero (opcional)",
    teste_demografia_intro:
      "Duas perguntas opcionais, só para comparar grupos nos números gerais do site. Não mudam o seu resultado e não identificam você.",
    teste_demografia_continuar: "Continuar",
    teste_demografia_pular: "Pular",
    demografia_genero_feminino: "Feminino",
    demografia_genero_masculino: "Masculino",
    demografia_genero_outro: "Outro",
    demografia_genero_nao_informado: "Prefiro não informar",

    // A chave inclui o sinal da nota (-2 a 2), porque e assim que a tela pede.
    "resposta-2": "Discordo muito",
    "resposta-1": "Discordo",
    resposta1: "Concordo",
    resposta2: "Concordo muito",

    // resultado
    res_titulo: "Seu resultado",
    res_margem: (m) => `margem de ${m}`,
    res_area_explicacao:
      "A área ao redor do ponto é a sua margem de erro. Ela é maior quando suas respostas se contradizem, e menor quando são coerentes entre si.",
    res_confianca_baixa_titulo: "Este resultado diz pouco sobre você",
    res_uniforme:
      "Você deu a mesma nota em todas as afirmações. Metade delas defende o contrário da outra metade, de propósito, então responder tudo igual se anula e o ponto cai no centro. É assim que o teste evita empurrar para algum lado quem responde no automático. Refaça lendo cada afirmação e o resultado passa a significar alguma coisa.",
    res_contraditorio:
      "Suas respostas se contradizem bastante, e a área de incerteza no gráfico ficou grande por causa disso. O teste não conseguiu te medir bem, e prefere dizer isso a inventar uma posição.",
    res_refazer_lendo: "Refazer com calma",
    res_esquerda_direita:
      "Esquerda e direita aqui são a dimensão econômica: mais igualdade e mais Estado de um lado, mais mercado e menos Estado do outro.",
    res_mancha: "A mancha mostra onde caiu quem já respondeu. Quanto mais forte, mais gente ali.",
    res_perfil: "Seu perfil nos seis eixos",
    res_perfil_intro:
      "Uma pétala por eixo, do tamanho da sua convicção e apontando para o lado que você escolheu. Polos opostos ficam em lados opostos, então a forma nunca pode dizer que você é as duas coisas ao mesmo tempo.",
    res_perfil_legenda:
      "A pétala clara por baixo é a margem de erro. Quando ela aparece também do lado oposto, nem o lado daquele eixo ficou definido.",
    res_eixos_secundarios: "Os outros quatro eixos",
    res_por_que: "Por que você caiu aqui",
    res_por_que_intro:
      "As respostas que mais puxaram cada eixo, com o que você respondeu e de onde a afirmação veio.",
    res_puxou_para: (polo) => `puxou para ${polo}`,
    res_voce_respondeu: (resposta) => `Você: ${resposta.toLowerCase()}`,
    res_todas_respostas: "Ver todas as suas respostas",
    // A manchete do resultado: um pedaco por eixo principal, graduado pela
    // intensidade (lib/manchete.js decide qual). So os nomes de polo que o
    // grafico ja usa: nenhum rotulo novo que carregue juizo.
    res_manchete: (econ, aut) => `${econ} e ${aut}`,
    manchete_economico_forte: (polo) => `Bem à ${polo}`,
    manchete_economico_media: (polo) => `À ${polo}`,
    manchete_economico_leve: (polo) => `Levemente à ${polo}`,
    manchete_economico_centro: () => "No centro da economia",
    manchete_autoridade_forte: (polo) => `bem para o lado da ${polo}`,
    manchete_autoridade_media: (polo) => `mais para ${polo}`,
    manchete_autoridade_leve: (polo) => `um pouco para ${polo}`,
    manchete_autoridade_centro: () => "no meio entre Liberdade e Autoridade",
    res_tradicao_topo: (nome) => `Tradição mais próxima: ${nome}.`,
    res_margem_todas: (m) => `Margem de erro de ${m} em todos os eixos.`,
    res_margem_principais: (me, ma) =>
      `Margem de erro de ${me} no econômico e de ${ma} na autoridade.`,
    res_atalhos: "Seções do resultado",
    res_atalho_grafico: "Gráfico",
    res_atalho_eixos: "Seis eixos",
    res_atalho_porque: "Por quê",
    res_atalho_tradicoes: "Tradições",
    res_atalho_comparar: "Comparar",
    res_atalho_compartilhar: "Compartilhar",

    // bussola
    bus_voce: "Você",
    bus_margem: "margem de erro",
    bus_populacao: "onde caiu quem já respondeu",
    bus_tradicoes: "Mostrar as tradições no gráfico",
    bus_tradicoes_legenda: "tradição, só nos dois eixos do gráfico",
    bus_tradicoes_aviso:
      "As tradições aparecem só pela posição nos dois eixos do gráfico. A proximidade de verdade é medida nos seis eixos: uma tradição pode parecer perto aqui e estar longe nos outros quatro.",
    quadrante_igualdade_autoridade: "Esquerda · Autoridade",
    quadrante_mercado_autoridade: "Direita · Autoridade",
    quadrante_igualdade_liberdade: "Esquerda · Liberdade",
    quadrante_mercado_liberdade: "Direita · Liberdade",

    // leitura de uma posicao num eixo (mesmos cortes da manchete)
    leitura_forte: (polo) => `Bem para ${polo}`,
    leitura_media: (polo) => `Mais para ${polo}`,
    leitura_leve: (polo) => `Um pouco para ${polo}`,
    leitura_centro: () => "No centro",

    // secoes do resultado
    sec_perfil: "Perfil",
    sec_explicacao: "Explicação",
    sec_tradicoes: "Tradições",
    sec_comparacao: "Comparação",
    sec_compartilhar: "Compartilhar",
    sec_ajuda: "Como ler esta seção",
    res_seu_card: "Seu card",
    res_escolher_card: (nome) => `Usar o modelo ${nome}`,
    trad_voce: "você",
    trad_ela: "a tradição, nos dois eixos do gráfico",
    pop_faltam: (n, minimo) => `de ${minimo} respostas para liberar a comparação`,
    pop_faltam_texto:
      "Com respostas suficientes aparecem: em que ponto você está em relação a quem respondeu, a mancha de onde as pessoas caíram no gráfico e as afirmações em que você destoa da sua turma. Antes disso, os números seriam ruído.",
    res_ler_tradicao: "Ler sobre essa tradição →",
    res_todas_tradicoes: (n) => `Ver as ${n} tradições`,
    res_tradicoes: "Tradições mais próximas de você",
    res_tradicoes_intro:
      "Proximidade medida nos seis eixos. Estar perto de uma tradição não significa concordar com ela em tudo.",
    // Posicao, e nao porcentagem: a distancia nos seis eixos dava 64% a 86%
    // de "proximidade" com TODAS as tradicoes para quem esta no centro.
    res_proximidade: (n) => (n === 1 ? "A mais próxima" : `${n}ª mais próxima`),
    res_compartilhar: "Compartilhar",
    res_baixar: "Baixar imagem",
    res_copiar_link: "Copiar link",
    res_link_copiado: "Link copiado",
    res_refazer: "Refazer o teste",
    res_layout: "Modelo do card",
    res_layout_classico: "Clássico",
    res_layout_cartaz: "Cartaz",
    res_layout_minimo: "Mínimo",
    res_ver_metodologia: "Ver como a conta é feita",
    res_link_antigo_titulo: "Este link é de uma versão anterior do teste",
    res_link_antigo_corpo:
      "As afirmações mudaram desde que este resultado foi feito, então ele não pode ser mostrado com as perguntas de hoje. Refaça o teste para ver onde você está agora.",
    res_link_invalido_titulo: "Este link de resultado não abriu",
    res_link_invalido_corpo:
      "O endereço pode ter sido cortado ao copiar. Confira se ele veio inteiro, ou faça o teste para ter o seu.",
    res_fazer_teste: "Fazer o teste",

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
    erro_limite_corpo:
      "Isso não deveria ter acontecido. Voltar ao início e começar de novo costuma resolver.",
    carregando: "Carregando",
    nao_encontrado: "Não encontramos essa página",
    voltar_inicio: "Voltar ao início",

    // paginas de texto
    sobre_titulo: "Sobre",
    metodologia_titulo: "Metodologia",
    tradicoes_titulo: "Tradições ideológicas",

    // partidos (dados do Brazilian Legislative Surveys)
    partidos_titulo: "Onde ficam os partidos",
    partidos_rotulo: (ano) => `Partidos · Brazilian Legislative Survey ${ano}`,
    partidos_intro: (n, ano) =>
      `Como os próprios parlamentares posicionam cada partido, numa escala de 1 (mais à esquerda) a 10 (mais à direita). ${n} deputados e senadores responderam em ${ano}.`,
    partidos_aviso:
      "O Compass não posiciona partidos e não liga partidos a tradições. Esta página só mostra o que a pesquisa mediu, com uma régua só: esquerda e direita.",
    partidos_grafico: "Posição média de cada partido, de 1 (mais à esquerda) a 10 (mais à direita)",
    partidos_voce: "Você",
    partidos_voce_eixo: "eixo econômico",
    partidos_hoje: (sigla) => `hoje parte do ${sigla}`,
    partidos_notas: (n) => `${n} notas`,
    partidos_esquerda: "← mais à esquerda",
    partidos_direita: "mais à direita →",
    partidos_como_ler: "Como ler",
    partidos_como_ler_texto:
      "Cada ponto é a média das notas que os parlamentares deram ao partido, de 1 a 10. O traço em volta é a margem de erro: quanto menos gente avaliou, maior ele fica. A linha mais escura no meio é o 5,5, o centro da escala.",
    partidos_mudou: (ano) => `O que mudou desde ${ano}`,
    partidos_mudou_texto:
      "DEM e PSL formaram o União Brasil (2022). O PROS foi incorporado ao Solidariedade e o PSC ao Podemos (2023). PTB e Patriota formaram o PRD (2023). Partidos criados depois da pesquisa não aparecem.",
    partidos_fora: "Quem ficou de fora, e por quê",
    partidos_fora_texto: (minimo, lista) =>
      `Só entram partidos avaliados por pelo menos ${minimo} parlamentares. Abaixo disso a média é instável e, com uma ou duas notas, vira a resposta de uma pessoa só, o que a pesquisa proíbe expor. Ficaram de fora: ${lista}.`,
    partidos_fora_item: (sigla, n) => `${sigla} (${n} ${n === 1 ? "nota" : "notas"})`,
    partidos_voce_titulo: "Você nesta régua",
    partidos_voce_texto:
      "O seu ponto é o seu eixo econômico, levado para a mesma escala de 1 a 10. As duas medidas não são iguais: a pesquisa pergunta a posição geral de cada partido, o Compass mede só a economia. Compare com cuidado.",
    partidos_fonte: "Fonte",
    partidos_coordenacao: (quem) => `Projeto coordenado por ${quem}.`,
    partidos_link: "Onde ficam os partidos →",
    partidos_link_texto:
      "Como os parlamentares posicionam cada partido de esquerda a direita, segundo uma pesquisa acadêmica de 2021.",
    teste_titulo_aba: "Teste",
    titulo_aba: (pagina) => (pagina ? `${pagina} · Compass` : "Compass"),
    fonte_adaptado: "adaptado do item",
    fonte_construto: "redação própria, baseada em",
  },

  en: {
    marca: "Compass",
    tagline: "Where you land on the political spectrum, and why",
    nav_inicio: "Home",
    nav_sobre: "About",
    nav_metodologia: "Methodology",
    nav_tradicoes: "Traditions",
    nav_tradicoes_detalhe: (n) => `${n} schools of thought`,
    nav_principal: "Main menu",
    nav_rodape: "Footer links",
    nav_menu_abrir: "Open menu",
    nav_menu_fechar: "Close menu",
    nav_idioma_pt: "PT-BR",
    nav_idioma_en: "EN-US",
    nav_tema_escuro: "Switch to dark theme",
    nav_tema_claro: "Switch to light theme",
    rodape_privacidade: "Nothing here identifies who answered",
    rodape_codigo: "Open source",

    home_titulo: "Where you stand on the political spectrum",
    home_intro:
      "A test of 48 statements taken from academic surveys, with the weights published and the margin of error on screen.",
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
    modo_rapido_qtd: "16 questions",
    modo_padrao_qtd: "32 questions",
    modo_completo_qtd: "48 questions",
    modo_rapido_tempo: "3 min",
    modo_padrao_tempo: "6 min",
    modo_completo_tempo: "max precision",
    home_amostra_titulo: "At the end you get",
    home_amostra_posicao: "Your position, with the margin of error drawn",
    home_amostra_eixos: "Six axes, not just left and right",
    home_amostra_fontes: "Where each question comes from, and why you landed there",
    home_amostra_tradicoes: "The closest traditions, with reading suggestions",

    teste_progresso: (n, total) => `Question ${n} of ${total}`,
    teste_voltar: "Back",
    teste_sair: "Leave the test",
    teste_dica_teclado: "Press 1 to 4 to answer, Backspace to go back",
    teste_dica_arrasto: "Drag sideways. The further you go, the stronger the answer.",
    teste_dica_arrasto_esq: "← drag to disagree",
    teste_dica_arrasto_dir: "to agree →",
    teste_modo_lista: "Use the list",
    teste_modo_cartao: "Use the card",
    teste_nao_sei: "I could not say",
    teste_nao_sei_ajuda:
      "This statement is left out of your score, and so is the opposite statement paired with it.",
    teste_importancia: "Weight of this answer",
    teste_importancia_baixa: "A little",
    teste_importancia_normal: "Normal",
    teste_importancia_alta: "A lot",
    teste_calculando: "Building your result",

    teste_demografia_titulo: "Before you start",
    teste_demografia_idade: "Age range (optional)",
    teste_demografia_genero: "Gender (optional)",
    teste_demografia_intro:
      "Two optional questions, only to compare groups in the site's overall numbers. They do not change your result and do not identify you.",
    teste_demografia_continuar: "Continue",
    teste_demografia_pular: "Skip",
    demografia_genero_feminino: "Female",
    demografia_genero_masculino: "Male",
    demografia_genero_outro: "Other",
    demografia_genero_nao_informado: "Prefer not to say",

    "resposta-2": "Strongly disagree",
    "resposta-1": "Disagree",
    resposta1: "Agree",
    resposta2: "Strongly agree",

    res_titulo: "Your result",
    res_margem: (m) => `margin of ${m}`,
    res_area_explicacao:
      "The area around the dot is your margin of error. It grows when your answers contradict each other, and shrinks when they line up.",
    res_confianca_baixa_titulo: "This result says little about you",
    res_uniforme:
      "You gave the same answer to every statement. Half of them argue the opposite of the other half, by design, so answering everything the same cancels out and the dot lands at the center. That is how the test avoids pushing anyone who answers on autopilot. Take it again reading each statement and the result starts to mean something.",
    res_contraditorio:
      "Your answers contradict each other a lot, and that is why the uncertainty area came out large. The test could not measure you well, and would rather say so than invent a position.",
    res_refazer_lendo: "Take it again slowly",
    res_esquerda_direita:
      "Left and right here mean the economic dimension: more equality and more state on one side, more market and less state on the other.",
    res_mancha: "The cloud shows where previous respondents landed. The stronger it is, the more people.",
    res_perfil: "Your profile across the six axes",
    res_perfil_intro:
      "One petal per axis, sized by how strongly you hold it and pointing at the side you picked. Opposite poles sit on opposite sides, so the shape can never claim you are both things at once.",
    res_perfil_legenda:
      "The pale petal underneath is the margin of error. When it also shows up on the opposite side, not even the side of that axis is settled.",
    res_eixos_secundarios: "The other four axes",
    res_por_que: "Why you landed here",
    res_por_que_intro:
      "The answers that pulled each axis the most, with what you answered and where each statement came from.",
    res_puxou_para: (polo) => `pulled toward ${polo}`,
    res_voce_respondeu: (resposta) => `You: ${resposta.toLowerCase()}`,
    res_todas_respostas: "See all your answers",
    res_manchete: (econ, aut) => `${econ}, ${aut}`,
    manchete_economico_forte: (polo) => `Far to the ${polo}`,
    manchete_economico_media: (polo) => `To the ${polo}`,
    manchete_economico_leve: (polo) => `Slightly to the ${polo}`,
    manchete_economico_centro: () => "In the economic centre",
    manchete_autoridade_forte: (polo) => `strongly toward ${polo}`,
    manchete_autoridade_media: (polo) => `leaning toward ${polo}`,
    manchete_autoridade_leve: (polo) => `slightly toward ${polo}`,
    manchete_autoridade_centro: () => "between Liberty and Authority",
    res_tradicao_topo: (nome) => `Closest tradition: ${nome}.`,
    res_margem_todas: (m) => `Margin of error of ${m} on every axis.`,
    res_margem_principais: (me, ma) =>
      `Margin of error of ${me} on economics and ${ma} on authority.`,
    res_atalhos: "Result sections",
    res_atalho_grafico: "Chart",
    res_atalho_eixos: "Six axes",
    res_atalho_porque: "Why",
    res_atalho_tradicoes: "Traditions",
    res_atalho_comparar: "Compare",
    res_atalho_compartilhar: "Share",

    bus_voce: "You",
    bus_margem: "margin of error",
    bus_populacao: "where previous respondents landed",
    bus_tradicoes: "Show the traditions on the chart",
    bus_tradicoes_legenda: "tradition, on the chart's two axes only",
    bus_tradicoes_aviso:
      "Traditions are placed by their position on the chart's two axes only. Real closeness is measured on all six: a tradition can look close here and be far on the other four.",
    quadrante_igualdade_autoridade: "Left · Authority",
    quadrante_mercado_autoridade: "Right · Authority",
    quadrante_igualdade_liberdade: "Left · Liberty",
    quadrante_mercado_liberdade: "Right · Liberty",

    leitura_forte: (polo) => `Strongly toward ${polo}`,
    leitura_media: (polo) => `Leaning toward ${polo}`,
    leitura_leve: (polo) => `Slightly toward ${polo}`,
    leitura_centro: () => "In the centre",

    sec_perfil: "Profile",
    sec_explicacao: "Explanation",
    sec_tradicoes: "Traditions",
    sec_comparacao: "Comparison",
    sec_compartilhar: "Share",
    sec_ajuda: "How to read this section",
    res_seu_card: "Your card",
    res_escolher_card: (nome) => `Use the ${nome} style`,
    trad_voce: "you",
    trad_ela: "the tradition, on the chart's two axes",
    pop_faltam: (n, minimo) => `of ${minimo} answers to unlock the comparison`,
    pop_faltam_texto:
      "With enough answers you will see where you stand compared with other respondents, the cloud of where people landed on the chart, and the statements where you differ from your own side. Before that, the numbers would be noise.",
    res_ler_tradicao: "Read about this tradition →",
    res_todas_tradicoes: (n) => `See all ${n} traditions`,
    res_tradicoes: "Traditions closest to you",
    res_tradicoes_intro:
      "Distance measured across all six axes. Being close to a tradition does not mean agreeing with all of it.",
    res_proximidade: (n) =>
      n === 1 ? "Closest" : `${n}${{ 2: "nd", 3: "rd" }[n] ?? "th"} closest`,
    res_compartilhar: "Share",
    res_baixar: "Download image",
    res_copiar_link: "Copy link",
    res_link_copiado: "Link copied",
    res_refazer: "Take it again",
    res_layout: "Card style",
    res_layout_classico: "Classic",
    res_layout_cartaz: "Poster",
    res_layout_minimo: "Minimal",
    res_ver_metodologia: "See how the scoring works",
    res_link_antigo_titulo: "This link is from an earlier version of the test",
    res_link_antigo_corpo:
      "The statements have changed since this result was made, so it cannot be shown against today's questions. Take the test again to see where you stand now.",
    res_link_invalido_titulo: "This result link did not open",
    res_link_invalido_corpo:
      "The address may have been cut off when it was copied. Check that it came through whole, or take the test to get your own.",
    res_fazer_teste: "Take the test",

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
    erro_limite_corpo: "This should not have happened. Going back to the start and trying again usually fixes it.",
    carregando: "Loading",
    nao_encontrado: "We could not find that page",
    voltar_inicio: "Back to the start",

    sobre_titulo: "About",
    metodologia_titulo: "Methodology",
    tradicoes_titulo: "Ideological traditions",

    partidos_titulo: "Where the parties stand",
    partidos_rotulo: (ano) => `Parties · Brazilian Legislative Survey ${ano}`,
    partidos_intro: (n, ano) =>
      `How Brazilian legislators themselves place each party, on a scale from 1 (most left) to 10 (most right). ${n} deputies and senators answered in ${ano}.`,
    partidos_aviso:
      "Compass does not place parties and does not link parties to traditions. This page only shows what the survey measured, on a single scale: left and right.",
    partidos_grafico: "Average position of each party, from 1 (most left) to 10 (most right)",
    partidos_voce: "You",
    partidos_voce_eixo: "economic axis",
    partidos_hoje: (sigla) => `now part of ${sigla}`,
    partidos_notas: (n) => `${n} ratings`,
    partidos_esquerda: "← more to the left",
    partidos_direita: "more to the right →",
    partidos_como_ler: "How to read it",
    partidos_como_ler_texto:
      "Each dot is the average of the ratings legislators gave the party, from 1 to 10. The bar around it is the margin of error: the fewer people rated it, the wider it gets. The darker line in the middle is 5.5, the centre of the scale.",
    partidos_mudou: (ano) => `What changed since ${ano}`,
    partidos_mudou_texto:
      "DEM and PSL merged into União Brasil (2022). PROS was absorbed by Solidariedade and PSC by Podemos (2023). PTB and Patriota merged into PRD (2023). Parties created after the survey do not appear.",
    partidos_fora: "Who is left out, and why",
    partidos_fora_texto: (minimo, lista) =>
      `Only parties rated by at least ${minimo} legislators are shown. Below that the average is unstable and, with one or two ratings, it becomes a single person's answer, which the survey forbids disclosing. Left out: ${lista}.`,
    partidos_fora_item: (sigla, n) => `${sigla} (${n} ${n === 1 ? "rating" : "ratings"})`,
    partidos_voce_titulo: "You on this scale",
    partidos_voce_texto:
      "Your dot is your economic axis, converted to the same 1 to 10 scale. The two measures are not the same: the survey asks for each party's overall position, Compass measures only the economy. Compare with care.",
    partidos_fonte: "Source",
    partidos_coordenacao: (quem) => `Project led by ${quem}.`,
    partidos_link: "Where the parties stand →",
    partidos_link_texto:
      "How Brazilian legislators place each party from left to right, according to a 2021 academic survey.",
    teste_titulo_aba: "Test",
    titulo_aba: (pagina) => (pagina ? `${pagina} · Compass` : "Compass"),
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
/** Numero com sinal explicito (+3,4 / −2,0), para posicao num eixo. */
export function numSinal(lang, valor, casas = 1) {
  const arredondado = Number(valor.toFixed(casas));
  const sinal = arredondado > 0 ? "+" : arredondado < 0 ? "−" : "";
  return sinal + num(lang, Math.abs(arredondado), casas);
}

export function num(lang, valor, casas = 1) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}
