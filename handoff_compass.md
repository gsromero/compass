## 2026-08-11 — claude

**O que foi feito:** O questionário virou um cartão que se arrasta, e no caminho apareceu um bug
mais importante que a mudança de interface.

**O bug:** "não sei" e "sou moderado" dividiam o mesmo valor (`r: 0`), e a conta tratava os dois
como "minha posição é o centro". Resultado mensurável: quem respondia "não sei" nas 8 afirmações
de um eixo saía com margem 0,65, a MESMA de quem respondia tudo de forma coerente e convicta.

**O conserto, em duas partes.** A escala virou 4 pontos e "não sei" virou uma opção separada que
não entra na conta. E a pontuação passou a ser feita por PAR: um par com um "não sei" é descartado
inteiro. Essa segunda parte não é zelo, é necessária: "não sei" fora da conta vira um "pular", e
pular metade de um par deixa o viés de aquiescência entrar (`(t+a)(-w)` não cancela o `a`).
Medido: pela regra antiga, quem dizia "não sei" de um lado do par e "concordo" do outro era
empurrado para +2,5; agora cai para 0 com margem máxima.

**Estado atual:** 363 testes. Arrasto verificado no navegador nos quatro sentidos de intensidade,
mais os casos de cancelar e de rolagem. Teclado sozinho leva ao resultado. Link da versão 1 é
recusado em vez de abrir com respostas trocadas. Agregados contam só a versão 2 (o banco de dev
tem 174 linhas da 1 e 130 da 2, e o total reportado é 130).

**Para o próximo agente:** três coisas que quebram em silêncio se ignoradas.

1. **`VERSAO` em `functions/api/_versao.js` tem que bater com o `versao` do `questions.json`.** Não
   dá para importar o JSON do client dentro das Functions; a sincronia é manual. Fora de sincronia,
   os agregados param de contar as respostas novas sem erro nenhum.
2. **A escala mora só em `scoring.js`.** Já esteve copiada em `permalink.js` e `Teste.jsx`, e uma
   cópia defasada faria o mesmo link decodificar para outras respostas.
3. **A decisão do gesto mora em `lib/gesto.js`, não no componente.** Se alguém mover a lógica para
   dentro do JSX, ela deixa de ser testada e passa a quebrar sem ninguém ver.

A lista de botões e o teclado NÃO podem sumir: são o único caminho para leitor de tela e teclado.

## 2026-08-10 — claude

**O que foi feito:** O site inteiro, da fundação ao fluxo completo rodando.

Fase 0: repositório público em github.com/gsromero/compass, estrutura no padrão do vintage e do
BBB, bancos `compass-db` e `compass-db-dev` criados no D1.

Fase 1, a que define o valor do projeto: li o questionário mestre do World Values Survey Onda 8
item por item (extraído do PDF com PDFKit via Swift, porque não havia extrator instalado) e
escrevi 48 afirmações, 38 adaptadas de itens com código conferido e 10 de redação própria a partir
de construtos. Bateria de equilíbrio com 320 testes, rodando no `npm run build`.

Fases 2 a 6: design system, i18n pt/en, questionário com teclado, swipe, autosave e escolha
adaptativa, tela de resultado com bússola em SVG, elipse de incerteza, "por que você caiu aqui"
com a fonte de cada pergunta, tradições mais próximas, card social em Canvas, backend anônimo em
D1 com agregados em cache, e as páginas Sobre, Metodologia e Tradições.

**Estado atual:** Roda de ponta a ponta. Testado com `wrangler pages dev` e banco local: 121
respostas sintéticas gravadas, agregados devolvendo distribuição, mapa de calor e média por
pergunta por quadrante, e a validação recusando eixo fora de escala, quadrante inventado e nota
fora da faixa. Build limpo, 82 kB de JS comprimido.

Ainda não foi ao ar: falta criar o projeto no Pages e apontar o domínio, e falta a revisão visual
e de conteúdo do dono.

**Para o próximo agente:** Três coisas que não são óbvias e quebram o projeto se ignoradas.

1. **`npm run build` roda os testes antes de propósito.** A bateria de equilíbrio é a razão de
   existir do site, não burocracia. O teste central é "quem concorda com tudo cai no centro", que
   é o defeito documentado do Political Compass (36 itens codificados à direita contra 20 à
   esquerda). Verifiquei que a bateria tem dentes sabotando um peso: 10 testes caíram.

2. **O equilíbrio depende dos pares.** Cada eixo tem 4 pares de afirmações com pesos espelhados, e
   o modo adaptativo só pergunta pares inteiros e só para em fronteira de par. Se alguém mexer
   nisso para "otimizar" a escolha de perguntas, o viés volta pela porta dos fundos. Existe teste
   simulando 2000 sessões para pegar exatamente isso.

3. **`adaptado` × `construto` é distinção jurídica, não de estilo.** Escala psicométrica com
   direitos (NEP, VSA, SDO7, Fundamentos Morais) entra só como construto, com redação própria.
   Tem teste que barra a marcação errada.

Pegadinha de ambiente: o flag `--d1 DB=<valor>` do `wrangler pages dev` trata o valor como **ID**
do banco, não como nome. Por isso o `dev:pages` usa o UUID do `compass-db-dev`; com o nome, ele
cria um banco local vazio separado e as gravações falham com "nao consegui gravar".

O plano completo está em `/Users/gsromero/.claude/plans/cheerful-crunching-finch.md`.
