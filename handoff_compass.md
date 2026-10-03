## 2026-10-03, claude

**O que foi feito** (publicado com autorização do dono):

1. **Página pública de Resultados** (`/resultados`, no menu) e um ponto por pessoa no gráfico, no
   lugar da mancha borrada, também no resultado individual. O servidor manda a posição de cada
   resposta, arredondada de 1 em 1 e sem nenhum outro dado; o dono aprovou sabendo disso.
2. **Partidos viraram seção expansível do resultado** (`SecaoPartidos.jsx`); a página `/partidos`
   saiu e redireciona para o início. Mockup aprovado na terceira rodada.
3. **Título da aba** de `/resultados` corrigido (aparecia "não encontramos essa página").
4. Antes disso, no dia 2: aviso de amostra na comparação (`pop_aviso`), porque o dono divulgou no
   Instagram e 83% caíram em Esquerda e Liberdade.

**Cuidado aprendido:** `client/src/lib/partidos.test.js` já existia e quase foi sobrescrito por um
teste novo com o mesmo nome. Ver se o arquivo existe antes de criar.

**Aberto:** eixo de crime e punição (pena de morte etc.), sem decisão; o dono não quer perder as
respostas atuais, o que é possível acrescentando perguntas no fim, sem mudar a versão. Pergunta
opcional de estado, sem decisão. Cópias de teste avulsas (`previa-og`, `pagina-resultados`) ficaram
no Pages; não leem o banco e podem ser apagadas.

## 2026-10-01 (fim de tarde), claude

**O que foi feito:** na branch `fix/card-story`, tudo publicado junto com autorização do dono
("pode colocar tudo no ar"):

1. **Card Story** montado de baixo para cima: a tradição não invade mais o convite.
2. **Etiqueta "Você"** desvia das pílulas de polo (`lugarDaEtiqueta` em `compass.js`, canvas e SVG).
3. **Afirmação reescrita** ("Dá para resolver a crise ambiental só com tecnologia, sem mudar o jeito
   como vivemos"), banco **v4**, `VERSAO = 4` nas Functions. Sem migration.
4. **Partidos:** linha vertical da sua posição atravessando todas as linhas.
5. **Teste rápido fora da escolha** (o dono achou o resultado vago demais com 16 perguntas). Só
   saiu do `SeletorModo`; continua em `scoring.js` para quem tinha um em andamento. Convite do
   visitante agora diz "a partir de 6 min".
6. **Seção de compartilhar nova** (pesquisa na Mobbin, mockup aprovado no artefato "Compass: nova
   seção de compartilhar" depois de três rodadas): faixa própria de ponta a ponta, cards reais em
   leque, "Mostre onde você caiu", WhatsApp com frase pronta, linha do cadeado. O dono vetou
   "Desafie alguém" (política não é desafio) e pediu altura fixa ao trocar de formato.

7. **Depois, publicado à parte (branch `feat/capa-viva`, autorização do dono):** página inicial com
   prévia viva do resultado (mockup "Compass: nova página inicial", opção B) e a verificação da
   Cloudflare no canto da tela, sumindo 1,5 s depois do sucesso (antes abria um vão entre a capa e
   os atalhos).

8. **Resultado sem medida bloqueado** (branch `feat/resultado-bloqueado`): confiança baixa ou tudo
   igual não mostra resultado (tela borrada, aviso no meio, só refazer) e **não grava**. Conferido
   no navegador: dono bloqueado sem Turnstile nem POST; resultado normal ainda grava; visitante vê
   texto próprio; o botão abre /teste.

9. **Banco de produção zerado** a pedido do dono (eram testes dele): 11 respostas e 384 itens.
   `criado_em` só guarda o dia, então não dá para cortar por hora.
10. **Erro "Algo deu errado" ao arrastar cartões no iPhone**: corrigido (`aoMover` em `Teste.jsx`).
    Reproduzido com o WebKit do Playwright (instalado só no scratchpad, fora do projeto).
11. **Prévia de link desenhada na hora** com o resultado real (`functions/og/r`, `@resvg/resvg-wasm`,
    autorizado) e nova prévia geral "Onde você cai?" (`npm run og:geral`).

12. **Aviso de amostra na comparação** (`pop_aviso`): o dono divulgou o link no Instagram (37
    respostas em 2026-10-02, 32 de 38 em Esquerda e Liberdade), então o percentil não fala do
    país. **Aberto:** eixo de crime e punição (pena de morte etc.) discutido, sem decisão; o
    dono não quer perder as respostas atuais, o que é possível só acrescentando perguntas no fim.

13. **Página pública de Resultados** (`/resultados`, branch `feat/pagina-resultados`) e a mancha
    do gráfico virou um ponto por pessoa, também no resultado individual. O servidor passou a
    mandar a posição de cada resposta, arredondada e sem nenhum outro dado; o dono aprovou.

**Verificado:** 394 testes e build; tela conferida em 1300, 1000 e 390 px (altura igual nos três
formatos, sem rolagem lateral).

**Aberto:** comparação dono × visitante; 10ª onda do BLS.

## 2026-10-02, claude

**O que foi feito:** pedidos do dono depois do redesenho, na branch `feat/tema-claro-comparacao`
(**publicado no mesmo dia**, com autorização do dono; conferido em produção: sem botão de tema, teste
abre em lista no computador mesmo com a escolha antiga "cartao", visitante vê a faixa e o convite,
comparação escondida, 0 POST ao abrir link, sem erro no console):

1. **Modo escuro removido** do site inteiro (`tema.jsx`, botão, tokens escuros, `color-scheme`).
2. **Comparação escondida** até `agregados.suficiente`: some a seção e o atalho; o card fica
   sozinho e centralizado na faixa final.
3. **Cards novos** (pesquisa na Mobbin, mockup aprovado no artefato "Cards e Visitante"):
   `shareCard.js` reescrito, claro, Quadrado/Story/Mínimo, frase em primeira pessoa, bússola nova,
   convite no rodapé; tradição só no Story e só ligada. `VitrineCards` virou prévia única + escolha
   de formato + chave.
4. **Visitante de link:** `lib/meusResultados.js` + faixa no topo, terceira pessoa, convite "Agora é
   a sua vez" com `SeletorModo` (extraído da Home).

**Depois, a pedido do dono:** (a) o teste abria em cartão no computador dele porque uma troca
antiga ficava salva para sempre; agora a escolha é guardada por tipo de aparelho (mouse ou toque) e
a chave antiga é apagada. (b) Revisão de texto: "com 5 de resposta" corrigido, termos técnicos
trocados ("pesos publicados", "área de incerteza", "Peso desta resposta" virou "Importância para
você"), leituras sem artigo ("Direita, posição forte"), eixo "Decisão" virou "Quem decide", margem
com a escala dita ("numa escala de −10 a +10"), "Algo deu errado".

**Verificado:** 391 testes e build; local com `wrangler pages dev`: fluxo do dono (sem faixa,
atalho "Compartilhar", os três cards exportados e conferidos), visitante num navegador limpo (faixa,
"Resultado compartilhado", "Resposta: …", atalho "Sua vez", "Começar o teste" leva ao teste), sem
erro no console. Achado e corrigido: no Story com tradição, a caixa invadia o convite.

