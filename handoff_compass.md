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
