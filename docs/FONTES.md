# Compass: de onde vem cada pergunta

> Este arquivo é a fonte de verdade sobre a origem das perguntas. Ele alimenta a página **Sobre**
> do site. Pergunta nova sem entrada aqui não entra no banco: existe teste que barra.

O Political Compass nunca publicou de onde vêm as afirmações dele nem quanto cada uma pesa. Este
arquivo existe para que aqui a resposta seja conferível por qualquer pessoa.

## As duas categorias, e por que a diferença importa

Nem todo instrumento pode ser reusado do mesmo jeito. A distinção abaixo é **jurídica, não
estilística**, e cada pergunta do banco carrega o campo `derivacao` dizendo em qual dela caiu.

### Categoria A: instrumentos públicos de pesquisa → `adaptado`

Questionários publicados como infraestrutura pública de pesquisa, feitos para serem reusados com
citação. Daqui a redação da afirmação é **adaptada do item original**, e o banco registra o
instrumento, a onda e o código do item para qualquer um conferir.

### Categoria B: escalas com direitos ou itens não conferíveis → `construto`

Escalas psicométricas cujo licenciamento para uso aberto é ambíguo, e também itens cuja redação
original eu não consegui conferir na fonte primária. Daqui **não copio a redação**: uso a escala
para definir o construto e a direção esperada, e **escrevo a afirmação com minhas palavras**,
citando a escala como base conceitual.

**Marcar um item da categoria B como `adaptado` é erro de verdade, não detalhe.** Existe teste em
`client/src/lib/equilibrio.test.js` que barra isso.

---

## Os instrumentos usados

### World Values Survey: 38 afirmações adaptadas, e mais 1 como construto

A maior pesquisa comparativa de valores do mundo, rodando desde 1981. As duas dimensões que o
Inglehart e o Welzel extraíram dela explicam mais de 70% da variação entre países, e é isso que
faz um teste em dois idiomas medir a pessoa em vez de medir o país.

- **Documento consultado:** [questionário mestre da Onda 8 (2024-2026), versão 11 de janeiro de
  2024](https://www.worldvaluessurvey.org/documents/WVS-8_QUESTIONNAIRE_V11_FINAL_Jan_2024.pdf),
  19 páginas, lido item por item nesta sessão. Os códigos `Q___` no banco de perguntas são os
  desse documento.
- **Atenção à numeração:** os itens econômicos são `Q107` a `Q111` na Onda 8. Na Onda 7 os mesmos
  itens eram `Q106` a `Q110`. O banco cita sempre a onda junto do código, por isso.
- **Itens usados:** Q17, Q25, Q26, Q107, Q108, Q109, Q110, Q114, Q116, Q117, Q120, Q122, Q124,
  Q147, Q148, Q152, Q153, Q193, Q195, Q196, Q197, Q198, Q201, Q202, Q205, Q206, Q207, Q208, Q209,
  Q210, Q211, Q214, Q216, Q218, Q227.
- O Brasil participou de cinco das sete ondas realizadas até aqui.

### ISSP National Identity: 4 perguntas · categoria B

Módulo do International Social Survey Programme sobre identidade nacional, aplicado em 1995, 2003,
2013 e 2023. Cobre nacionalismo, protecionismo e cooperação entre países, que é o eixo Fronteiras.

- [Módulos e questionários por tema](https://issp.org/data-download/by-topic/)
- Entrou como `construto` porque não consegui conferir a redação exata dos itens na fonte primária
  nesta sessão. Se um dia eu conferir, essas quatro perguntas podem virar `adaptado`.

### New Ecological Paradigm: 5 perguntas · categoria B

A escala de Dunlap e colegas é a medida de preocupação ambiental mais usada no mundo, com cinco
facetas: limites ao crescimento, antropocentrismo, fragilidade do equilíbrio natural,
excepcionalismo humano e crise ecológica. Cada uma das cinco perguntas do eixo Ecologia
corresponde a uma faceta.

- [Measuring Endorsement of the New Ecological Paradigm: A Revised NEP Scale](https://www.researchgate.net/publication/279892834_Measuring_Endorsement_of_the_New_Ecological_Paradigm_A_Revised_NEP_Scale)
- Entrou como `construto`: o licenciamento da escala para uso aberto e comercial é ambíguo.

---

## Instrumentos que definiram os eixos mas não geraram perguntas

Estes serviram para decidir **quais eixos existem** e o que cada um mede:

- **[Chapel Hill Expert Survey](https://hooghe.web.unc.edu/wp-content/uploads/sites/11492/2021/11/2021_Jolly-et-al_-Chapel-Hill-Expert-Survey-trend-file-1999-2019.pdf)**
  O padrão para descrever espaço político em democracias, com a dimensão econômica
  esquerda-direita e a dimensão GAL-TAN (verde/alternativo/libertário contra
  tradicional/autoritário/nacionalista). Os eixos Econômico, Fronteiras e Ecologia saem daí.
- **[Very Short Authoritarianism Scale (Bizumic & Duckitt, 2018)](https://jspp.psychopen.eu/index.php/jspp/article/view/5047)**
  Versão curta e validada da escala de Altemeyer. Vale menção especial: ela é **balanceada por
  direção de redação por construção**, que é exatamente o princípio adotado aqui.
- **[Moral Foundations Questionnaire-2](https://www.sciencedirect.com/science/article/pii/S0191886923002623)**
  Informou o eixo Costumes.
- **[Inglehart–Welzel / World Values Survey](https://en.wikipedia.org/wiki/Inglehart%E2%80%93Welzel_cultural_map_of_the_world)**
  As duas dimensões culturais que sustentam a comparabilidade entre idiomas.

## Método de adaptação entre idiomas

- **[Beaton et al., Guidelines for the Process of Cross-Cultural Adaptation](https://lab.research.sickkids.ca/pscoreprogram/wp-content/uploads/sites/72/2017/12/Beaton2000-GuidelinesCrossCulturalAdaptation.pdf)**
  Tradução literal não basta; o que precisa ser preservado é a equivalência **conceitual**.

---

## Limitações que eu declaro, em vez de esconder

**1. As afirmações foram reescritas para soar como gente falando.**
A versão 3 do banco reescreveu as 48 sem mexer no que cada uma mede: saiu o `deveria` repetido em
mais da metade delas, saíram as concessivas longas e o hedge. O item de origem continua o mesmo, e
é ele que a citação promete.

**2. A redação em português é minha, não a oficial brasileira.**
O World Values Survey e o ISSP publicam os questionários nacionais junto dos microdados, não como
documentos avulsos. Consegui conferir a redação **em inglês** no questionário mestre oficial; a
redação **em português** é adaptação minha, seguindo equivalência conceitual. Isso é melhor do que
uma tradução literal, e é pior do que o instrumento nacional de verdade. Pegar as versões
brasileiras oficiais está em `docs/PENDENCIAS.md`.

**3. Mudei o formato dos itens, e isso tem custo.**
Os itens de origem usam formatos variados: escala de 1 a 10 entre duas frases opostas (Q107 a
Q111), escolha forçada entre duas posições (Q122), concordância de 4 pontos (Q124, Q201 a Q210),
menção em lista (Q17). Aqui tudo virou uma escala única de concordância de 4 pontos, com "não sei dizer" à parte. A derivação é
rastreável, mas **o resultado não é o instrumento original e não herda automaticamente a validação
dele**.

**4. Cada pergunta carrega um eixo só.**
No mundo real as opiniões se sobrepõem, e uma afirmação sobre imposto de herança fala de economia
e também de tradição. Optei por carga única porque é o que torna o equilíbrio **demonstrável** por
teste. É simplificação consciente.

**5. Onde fica o zero é decisão normativa, e não um fato.**
Aqui o zero é o meio da escala de resposta, não a média de quem respondeu, para o centro não andar
conforme o público do site muda. É uma escolha defensável, não a única possível.

**6. Ainda não há validação empírica.**
Os testes provam equilíbrio **estrutural**. Provar que as perguntas medem mesmo o que dizem medir
exige respostas reais e análise fatorial. Isso está em `docs/PENDENCIAS.md`, e vai para a página
de metodologia quando houver volume.
