## 2026-08-10, claude

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
