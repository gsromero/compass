## 2026-10-02, claude

**O que foi feito:** pedidos do dono depois do redesenho, na branch `feat/tema-claro-comparacao`
(sem commit, sem deploy, aguardando o dono):

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
