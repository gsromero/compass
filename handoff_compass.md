## 2026-10-01 (madrugada), claude

**O que foi feito:** tudo que o dono aprovou em mockup, na branch `feat/turnstile-modo-resposta`,
junto do Turnstile e da `via` já prontos. **Publicado no mesmo dia, tudo junto, com autorização do
dono:** 0003 aplicada em produção antes do deploy; conferido em compass.gsromerolab.com (prévia
por quadrante via `curl`, link quebrado com a prévia geral, POST sem token recusado, resultado,
vitrine e partidos renderizando sem erro, 0 POST ao abrir link).

1. **Página de partidos** (`/partidos`): BLS 2021, 20 partidos, mínimo de 10 notas (PV e Rede de
   fora, 1 nota cada; o dono pediu que o PCdoB entrasse, e com 10 ele entra). Fusões conferidas
   no TSE. Dados brutos em `dados-bls/` (gitignored), médias geradas por `scripts/partidos-bls.mjs`.
   Link discreto no fim da seção de tradições do resultado.
2. **Prévia por quadrante:** Function `functions/resultado/[codigo].js` com `HTMLRewriter`. Imagens
   refeitas com os polos na horizontal, coerentes com a bússola nova.
3. **Redesenho do resultado e da bússola**, conforme o artefato "Resultado Redesenhado".
4. **Card:** a faixa da margem vazava no extremo (+10).

**Verificado:** 389 testes e build; `wrangler pages dev` local, celular e computador, pt e en,
claro e escuro; teste inteiro passa pelo Turnstile de teste e grava 1 linha; F5 não reenvia;
`curl` na Function devolve `og:image` do quadrante e a geral para link quebrado. Três defeitos
achados só ao renderizar e corrigidos: cartões de eixo estourando em duas colunas no celular,
"↓ Liberdade" encostando no nome do quadrante, e a etiqueta "Você" saindo do desenho com margem
grande.

**Ainda não confirmado em produção:** o Turnstile com a chave real num teste completo (exige
gravar uma resposta de verdade; o dono pode fazer o próprio teste e conferir se `itens.via` veio
preenchido) e a prévia aparecendo no WhatsApp.

## 2026-10-01 (noite), claude

**O que foi feito:** Turnstile ligado, na branch `feat/turnstile`. O dono criou o widget no painel
(Managed, domínios `compass.gsromerolab.com` e `localhost`) e gravou ele mesmo o segredo no Pages
(`wrangler pages secret put TURNSTILE_SECRET_KEY`). A Secret Key nunca passou pelo chat.

- `lib/turnstile.js`: carrega o script da Cloudflare só no fim do teste, `interaction-only`
  (quase sempre invisível), e devolve o token. Abrir um link compartilhado não carrega nada.
- `respostas.js`: valida o corpo, depois confere o token no `siteverify` (sem `remoteip`), 403 se
  falhar. Falha não tira o resultado de ninguém; a resposta só não conta.
- Sobre: o parágrafo de privacidade explica a verificação, nos dois idiomas. No caminho, três
  palavras sem acento corrigidas nos limites ("é rastreável", "não é o instrumento", "há").
- Local: `.dev.vars` com o segredo oficial de teste da Cloudflare, par da chave de teste usada em
  localhost.

**Junto, na mesma branch (renomeada para `feat/turnstile-modo-resposta`):** o dono decidiu que
o site anota por onde cada resposta veio. `itens.via` (migration 0003, aplicada só no D1 local):
`arrasto`, `botao` ou `teclado`. Testado respondendo pelos três jeitos: 6/5/5 gravados certos.
**Antes do deploy, aplicar a 0003 em produção.** O texto de privacidade do Sobre menciona isso.

**Imagem de prévia por quadrante:** dono disse sim. Quatro imagens em mockup no artefato Design
"Prévias por Quadrante", esperando aprovação. Plano técnico: Function em
`functions/resultado/[codigo].js` com HTMLRewriter trocando `og:image`; ela pode importar
`lib/permalink.js`, `lib/scoring.js` e `questions.json` (puros, sem DOM; nenhuma pergunta usa
`so_no_idioma`, então o código decodifica igual em pt e en).

**Verificado:** POST sem token recebe 403; teste inteiro no navegador local passa pela verificação
e grava 1 linha (201); F5 não reenvia; 381 testes e build.

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
