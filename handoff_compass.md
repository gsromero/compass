## 2026-10-01, claude

**O que foi feito:** revisão geral do site a pedido do dono, e depois correção de tudo que ela
achou, na branch `fix/revisao-geral` (sem commit, aguardando o dono). A etapa de idade e gênero, que
estava pronta mas sem commit direto na `main` e sem registro aqui, veio junto para a branch.

**Os três que estragavam dados em silêncio:**
1. Abrir um link de resultado compartilhado, ou recarregar, gravava a resposta de novo. Agora só
   grava com `state.doTeste` (posto por `Teste.jsx`), e o state é apagado após o envio, porque ele
   sobrevive ao F5 (a ARQUITETURA dizia o contrário, corrigido).
2. A mancha da população usava `CAST(eixo / 2)`, que trunca para o zero: -1,9 era desenhado em +1.
   Agora usa a mesma faixa da distribuição, centros -9 a +9.
3. O POST aceitava qualquer id de pergunta. Agora confere contra `_perguntas.js`, recusa repetição e
   quadrante incoerente com o sinal dos eixos (zero aceita os dois lados, por causa do arredondamento).

**O resto:** tradições por posição (1ª, 2ª, 3ª) em vez de "% de proximidade"; mensagem própria para
link de versão antiga e link quebrado; explicação e "Pular" na tela de demografia; título da aba e
rolagem ao topo por página; `og.png`, favicon e meta tags com acento; `criado_em` só com o dia;
`lang.jsx` e `tema.jsx` não derrubam mais o site com armazenamento bloqueado.

**Verificado de verdade:** 374 testes, build, POSTs à mão contra `wrangler pages dev` com o D1 local,
e o fluxo inteiro num Chrome sem janela via DevTools Protocol: o teste grava 1 linha, F5 e "amigo
abrindo o link" gravam 0, tradições e mensagens nos dois idiomas, aba e rolagem certas, sem erro no
console.

**Publicado no mesmo dia**, com autorização do dono: merge `--no-ff` na `main`, `0002_demografia.sql`
aplicada em produção ANTES do deploy, deploy, e conferido em compass.gsromerolab.com (páginas, og.png,
favicon, POST falso recusado, abrir link de resultado não grava). O dono liberou `npm run
db:migrate:prod` e `npm run deploy` nas permissões locais do Claude Code; outras ações de produção
continuam pedindo permissão.

**Para o próximo agente:** Turnstile está autorizado e esperando as chaves (ver PENDENCIAS). Os POSTs
para caminhos aleatórios no domínio são a detecção de robôs da Cloudflare (zona), não o Compass. A
página de resultado não tem `<h1>` (só um rótulo), vale corrigir junto de outra mudança nela.

## 2026-08-17, claude

**O que foi feito:** o dono relatou, ao vivo, que terminou o teste no modo completo (48 perguntas)
e caiu numa tela em branco em vez do resultado. Investiguei o caminho inteiro (`Teste.jsx` →
`scoring.js` → `permalink.js` → `Resultado.jsx`), rodei os 371 testes e simulei sessões completas
de 48 respostas em vários padrões direto contra o código real. Nada disso reproduziu uma exceção.

**O achado que explica a tela em branco, mesmo sem reproduzir a causa exata:** o site não tinha
NENHUM `ErrorBoundary`. `main.jsx` ia direto de `StrictMode` para `App`, então qualquer exceção de
render, em qualquer componente, em qualquer página, virava tela em branco sem pista nenhuma — o
React desmonta a árvore toda e não sobra nada. Não consegui reproduzir a exceção sem o navegador e
as respostas reais do dono, então tratei os dois lados: consertei o que já sabia que estava errado,
e instrumentei o site para que, se acontecer de novo, a causa apareça.

**`ErroLimite.jsx` (novo, `client/src/components`)**: `ErrorBoundary` em volta de `<Routes>` dentro
de `App.jsx`, por fora de `Topo`/`Rodape` — uma página que quebra mostra mensagem no lugar dela, mas
cabeçalho e rodapé continuam de pé, e trocar de rota reseta o limite (`key={pathname}`). O erro
completo vai para `console.error`; sem telemetria nova, por decisão de privacidade do projeto.
Testado forçando um `throw` de propósito numa página, confirmando a mensagem, o console e o reset
ao navegar, e removendo o `throw` depois.

**Bug real encontrado no caminho, corrigido junto**: `proximoPar` em `scoring.js` parava de
perguntar cedo no modo **completo** também, apesar de prometer "48 perguntas, precisão máxima".
Simulei um padrão de resposta coerente e o completo parou em 24/48. Corrigido: o corte antecipado
por confiança suficiente só vale para modos com limite finito (`limite !== Infinity`). Testado com
um teste novo em `fluxo.test.js` e confirmado no navegador de verdade, terminando o modo completo
com um padrão que antes cortaria cedo: 48 respostas, chegou no resultado sem erro.

**Para o próximo agente:** se a tela em branco acontecer de novo, o `ErrorBoundary` agora existe, e
o console do navegador vai ter o erro real (mensagem + stack). Pedir pro dono abrir o DevTools e
mandar o que aparecer em vermelho é o caminho mais rápido para a causa raiz de verdade, porque a
lógica de pontuação e codificação já está provada correta por simulação.

## 2026-08-16, claude

**O que foi feito:** Revisão completa do site no celular (o dono relatou "tudo está muito ruim,
principalmente o header"), depois o topo ganhou menu hamburguer e um seletor de idioma segmentado,
e por fim o site foi ao ar pela primeira vez.

**A revisão de celular:** auditoria automatizada em 375px e 320px achou o topo em três linhas
(114px, botão de tema órfão), alvos de toque de 34px em vez de 44px, e a tabela de afirmações
cortando o texto sem avisar que rolava para o lado. Corrigido com topo em duas linhas, um bloco
`(pointer: coarse)` padronizando alvo mínimo, e sombra de rolagem em CSS puro na classe `.rolagem`.

**O topo, de novo:** com os três links por extenso (Início, Sobre, Metodologia) mais idioma e tema,
o topo voltou a não caber no celular. Os três links saíram para um menu hamburguer; idioma e tema
continuam sempre visíveis, por serem escolha de estado e não navegação. O idioma trocou de um ciclo
por clique para um controle segmentado (PT-BR | EN-US), nos dois tamanhos de tela.

**Dois bugs de especificidade de CSS**, achados só ao testar no navegador: `.linha` e
`.botao-discreto` (utilitários que dão `display:flex`/`inline-flex`) empatavam em especificidade
com as classes novas que escondem esses elementos, e venciam a cascata por virem depois no arquivo.
O CSS parecia certo lendo o código; só quebrou ao renderizar. Corrigido com seletores mais
específicos (`.topo-direita .topo-links`, `button.topo-hamburguer`), não reordenando o arquivo.

**O site foi ao ar:** banco de produção migrado (existia mas estava vazio), projeto `compass`
criado no Cloudflare Pages, primeiro deploy publicado e testado (`/`, `/sobre`, `/metodologia` e
`/api/agregados` respondendo contra o banco real). **Falta só conectar o domínio
`compass.gsromerolab.com`**, passo manual no painel da Cloudflare que o dono ainda não fez.

**Depois do ar, o dono pediu três ajustes de layout**, cada um testado num deploy de prévia (URL
separada, sem afetar produção) antes de aprovar:

1. **Coluna larga demais de vazio nas laterais.** As duas larguras de container (42rem leitura,
   58rem dados) viraram uma só, `--coluna: 75rem` (1200px), usada em toda página.
2. **Header e rodapé de ponta a ponta.** Eles saíram de dentro de `.coluna`: agora o fundo e a
   borda vão até a borda da tela, só o conteúdo interno mantém a margem lateral de 20px.
3. **Header do celular em duas linhas.** Virou uma linha só até 320px: o seletor de idioma perdeu
   padding horizontal (não a altura do alvo de toque) só nesse breakpoint.

No caminho, os três cards de "diferença" da Home saíram (repetiam o que a página Sobre já explica),
e a escolha de modo (Rápido/Padrão/Completo) virou três colunas lado a lado e mais altas em vez de
lista empilhada. Aprovado e publicado em produção.

**Para o próximo agente:** o dono ainda não revisou as 48 afirmações procurando tom tendencioso, e
não fez o piloto com 4 a 6 pessoas. Nenhum dos dois bloqueia o site estar no ar, mas os dois
deveriam acontecer antes de divulgar o link amplamente. Ver `docs/PENDENCIAS.md`.
