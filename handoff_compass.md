## 2026-10-01 (tarde), claude

**O que foi feito:** as seis propostas de interface, pesquisadas na Mobbin e aprovadas pelo dono
em mockup (artefato Design "Propostas de Tela Compass"), implementadas e **publicadas no mesmo dia** com autorização do dono (merge `--no-ff`, deploy,
conferido em compass.gsromerolab.com sem gravar nada: elementos novos presentes, 0 POST ao abrir
link de resultado, nenhum erro no console).

1. **Resultado:** manchete em palavras (`lib/manchete.js` + i18n), atalhos de seção presos no topo
   (`AtalhosSecoes.jsx`), Compartilhar e Copiar link logo abaixo da bússola, margem igual dita uma
   vez só (`BarraEixo semMargem`).
2. **Cartão:** coluna de 42rem, cartão com teto de altura, baralho por trás em CSS, fileira de
   quatro polegares sempre visível. A `.escala-oculta` (lista escondida que reaparecia ao foco)
   saiu: os polegares são botões de verdade e cumprem esse papel.
3. **Lista:** afirmação no alto, peso ("Peso desta resposta") ANTES das opções nos dois modos.
4. **Por quê:** selo "Você: discordo muito" e `<details>` com todas as respostas.
5. **Início:** seletor de duração numa linha, amostra do resultado com ponto no centro
   (`BussolaAmostra.jsx`), duas colunas no computador.
6. **Navegação:** Tradições no menu e no rodapé (lista `LINKS` única em `App.jsx`), cartão de
   tradição vira link.

**Verificado de verdade:** 381 testes, build, `wrangler pages dev` local fotografado em 390px e
1366px, pt e en, claro e escuro; teste inteiro respondido só pelos polegares chega ao resultado e
grava 1 linha; nenhum erro no console. Dois defeitos achados só ao renderizar e corrigidos: o peso
quebrava em duas linhas no celular, e as beiradas do baralho ficavam escondidas (escala a partir
do centro; agora da base).

**Para o próximo agente:** o dono gostou da ideia de gravar o modo de resposta (cartão ou lista)
para medir se o arrasto puxa respostas mais extremas, mas ainda não autorizou. Exige migration.

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
