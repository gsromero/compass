# Compass: mapa do código (para agentes)

> Consultar ANTES de sair explorando o repo. Regra de manutenção: criou ou mudou helper,
> componente ou padrão, atualiza este arquivo na mesma sessão.
> Tudo que está em aberto: `docs/PENDENCIAS.md`. UI: `docs/DESIGN-SYSTEM.md`.
> De onde vem cada pergunta: `docs/FONTES.md`. A conta e os limites: `docs/METODOLOGIA.md`.

## O caminho de uma resposta, da pergunta até o gráfico

```
questions.json  (pergunta + peso por eixo + fonte + tipo de derivação)
   ↓  proximaPergunta(): escolhe a que mais ajuda no eixo mais incerto,
   ↓                     SEM desequilibrar a codificação
cartão do questionário  →  resposta (-2 a +2) + importância (0,5 / 1 / 1,5)
   ↓  cada resposta salva no localStorage na hora
pontuar(respostas)  →  6 eixos, cada um com posição E margem de erro
   ↓            a margem sai do quanto as respostas discordam entre si
   ├─→ elipse na bússola (SVG)          ─┐  mesmo objeto,
   └─→ decisão de parar de perguntar    ─┘  dois usos
   ↓
resultado codificado na URL  →  o link funciona sem banco e sem conta
   ↓  em paralelo, POST /api/respostas (anônimo) alimenta os agregados,
   ↓  UMA vez e só vindo do fim do teste: abrir um link compartilhado não grava
GET /api/agregados  →  percentil, mapa de calor, "onde você destoa"
```

**Faixa etária e gênero não entram nesse fluxo.** São opcionais, perguntados uma vez em
`Teste.jsx` antes da primeira pergunta, e NUNCA vão para o código da URL (ele só reconstrói
respostas, e precisa continuar curto e estável para sempre). Viajam só via `navigate(..., {
state })` de `Teste.jsx` para `Resultado.jsx`, que os inclui no único `POST /api/respostas` que
faz ao montar, junto de `doTeste: true`, que é o que autoriza esse envio.

**Cuidado: o `state` do react-router NÃO some no F5.** Ele mora no `history` do navegador e
sobrevive à recarga. Por isso `Resultado.jsx` apaga o state (`navigate(pathname, { replace: true,
state: null })`) logo depois de enviar, e um `useRef` segura o efeito duplo do StrictMode. Sem
isso, cada recarga e cada amigo abrindo o link virava uma resposta nova nos agregados.

## Helpers de `client/src/lib` (reusar antes de criar)

| Arquivo | O que faz |
|---|---|
| `scoring.js` | **A conta, e fonte única dela.** Posição em cada eixo, margem de erro, quadrante, e a escolha da próxima pergunta no modo adaptativo. Nenhuma tela recalcula nada por fora |
| `questions.js` | Porta de entrada do banco de perguntas: carrega `data/questions.json`, filtra por idioma (`so_no_idioma`) e valida forma. Nenhuma tela lê o JSON direto |
| `i18n.js` | TODAS as strings de interface, pt e en. Valor pode ser função quando tem número no meio |
| `lang.jsx` | `LangProvider` + `useLang()`, devolvendo `{ lang, setLang, t, pick }`. `t` é string de interface; `pick` é texto de conteúdo (objetos `{pt, en}`). A escolha fica no localStorage e manda sobre o navegador |
| `compass.js` | Geometria do gráfico: converte posição de eixo (-10 a +10) em coordenada de SVG, e margem de erro em elipse. Usado pela tela de resultado E pelo card social, para os dois nunca discordarem |
| `shareCard.js` | Card em Canvas 2D, três formatos (`quadrado`, `story`, `minimo`), tema claro, frase do resultado via `manchete.js`. Tradição só no Story e só com `comTradicao`. Fundo sempre sólido |
| `meusResultados.js` | Códigos de resultado feitos neste aparelho (localStorage). Separa o dono de quem recebeu o link |
| `shareImage.js` | `shareCanvasPng()` e `downloadCanvasPng()`: compartilhamento nativo quando o navegador aceita arquivo, download quando não. Portado do BBB, sem a parte de Capacitor |
| `permalink.js` | Codifica e decodifica o resultado na URL. É o que faz o link de resultado funcionar sem banco. `versaoDoCodigo()` separa "link de versão anterior do teste" de "link quebrado", que pedem mensagens diferentes |
| `agregados.js` | Busca `GET /api/agregados` e nunca lança: sem servidor, devolve "dados insuficientes" e a tela esconde as seções que dependem de volume |
| `turnstile.js` | Verificação contra robô (Cloudflare Turnstile), uma vez, no fim do teste, antes do `POST /api/respostas`. Carrega o script da Cloudflare só nessa hora. Chave de produção no código (é pública); em localhost usa a chave oficial de teste, que faz par com o segredo de teste do `.dev.vars` |
| `manchete.js` | A frase que abre o resultado: intensidade de cada eixo principal (`centro`, `leve`, `media`, `forte`) e o polo para onde aponta. O texto fica no i18n (`manchete_<eixo>_<intensidade>`). Também `margemUnica()`, que diz se a margem é igual nos seis eixos |
| `demografia.js` | `FAIXAS_ETARIAS` e `GENEROS`: as listas fechadas da etapa opcional antes da primeira pergunta. `functions/api/respostas.js` valida contra uma CÓPIA dessas listas (runtime separado, não importa daqui). Mudou uma lista, muda a outra |

## Dados (`client/src/data`)

| Arquivo | O que é |
|---|---|
| `questions.json` | O banco de perguntas, versionado. Cada item tem `eixos` (peso com sinal), `fonte` (instrumento, onda, código do item, url), `derivacao` (`adaptado` ou `construto`) e `texto` em pt e en. **Pergunta sem fonte não entra: tem teste que barra** |
| `tradicoes.json` | As tradições ideológicas de referência: posição nos 6 eixos, explicação e leituras, nos dois idiomas. Também serve de teste de validade (cada tradição tem que cair onde a literatura diz) |

## Functions (`functions/api`)

| Rota | O que faz |
|---|---|
| `respostas.js` | `POST`. Valida faixa e tipo de tudo, aceita só ids de pergunta que existem (`_perguntas.js`), sem repetição, e quadrante coerente com o sinal dos eixos. Depois da validação, confere o token do Turnstile com a Cloudflare (`TURNSTILE_SECRET_KEY`, segredo do projeto no Pages; sem `remoteip`, de propósito): sem token válido, 403 e nada gravado. Grava uma linha em `respostas` e as linhas de `itens` **em lote**, cada item com a sua `via` (arrasto, botao, teclado; lista `VIAS` copiada de `lib/agregados.js`), que viaja de `Teste.jsx` para `Resultado.jsx` no `state` da navegação, como a demografia, e nunca no código da URL. `criado_em` guarda só o dia, nunca a hora. Não guarda nada que identifique quem respondeu |
| `_versao.js`, `_perguntas.js` | Cópias da versão e dos ids de `questions.json` (as Functions não importam do client). `client/src/lib/sincronia.test.js` compara as cópias, inclusive as listas de demografia de `respostas.js`, e barra o build se divergirem |
| `agregados.js` | `GET`. Números da população, guardados no `caches.default` por 10 minutos. Abaixo de 50 respostas devolve `{ suficiente: false }` e a tela se ajusta |

## Partidos (`/partidos`)

`data/partidos-bls.json` é GERADO por `scripts/partidos-bls.mjs` a partir dos dados brutos do
Brazilian Legislative Surveys (rodada de 2021), que ficam em `dados-bls/`, **fora do git**: o
download pede cadastro na Harvard Dataverse e o termo proíbe expor respostas individuais. Só entram
partidos com pelo menos 10 notas (`minimo`); `lib/partidos.test.js` segura essa regra, a fonte e a
escala. A página não liga partido a tradição. O ponto "Você" só aparece vindo do resultado
(`state.economico` na navegação), nunca guardado.

## Prévia de link por quadrante

`functions/resultado/[codigo].js` atende `/resultado/:codigo`: busca o `index.html` em
`env.ASSETS`, calcula o quadrante com `lib/previa.js` (que usa `permalink`, `scoring` e
`questions.json`, módulos puros, importados do client de propósito para a conta ser a mesma da
tela) e troca `og:image`, `og:title`, `og:url` com `HTMLRewriter`. Imagens em
`client/public/og/<quadrante>.png`. Código inválido: devolve o `index.html` intacto.

## Componentes novos de 2026-10-01

| Arquivo | O que faz |
|---|---|
| `components/AtalhosSecoes.jsx` | Fileira de atalhos presa no topo do resultado. Marca a seção visível com `IntersectionObserver` e rola sem pôr `#` na URL. Os ids vêm de `SECOES`, fora do componente em `Resultado.jsx` (lista nova a cada render religaria o observador) |
| `components/CabecalhoSecao.jsx` | Rótulo, título e frase curta de cada seção do resultado; os parágrafos longos ficam atrás do "?" |
| `components/MiniBussola.jsx` | Bússola pequena do cartão de tradição: você (cheio) e a tradição (vazada) |
| `components/VitrineCards.jsx` | Os três modelos do card de compartilhar em leque, gerados com o próprio `montarCard` depois da primeira pintura, mais formato, chave da tradição e as ações (`children`) |
| `components/Icones.jsx` | Ícones de linha dos botões de compartilhar (traço em `currentColor`) |
| `components/SeletorModo.jsx` | Padrão e Completo numa linha (o Rápido saiu da escolha em 2026-10). Usado no início e no convite do visitante |
| `components/BussolaAmostra.jsx` | A bússola pequena da página inicial, com o ponto no centro de propósito |

Menu e rodapé saem da mesma lista `LINKS` em `App.jsx`: Início, Tradições, Metodologia, Sobre.

## Erro de render (`client/src/components/ErroLimite.jsx`)

`ErrorBoundary` em torno de `<Routes>` dentro de `App.jsx`, por fora dele ficam `Topo`/`Rodape`: uma
página que quebra mostra uma mensagem no lugar dela, mas o cabeçalho e o rodapé continuam de pé, e
navegar para outra rota reseta o limite (`key={pathname}`). Antes disto o site não tinha nenhum, e
qualquer exceção de render em qualquer componente virava tela em branco sem pista nenhuma. O erro
completo vai para `console.error`; não existe telemetria no projeto por decisão de privacidade.

## Toda troca de página (`AoTrocarDePagina`, em `App.jsx`)

Põe o nome da página na aba (`titulo_aba` no i18n, tabela `TITULO_DA_ROTA`) e volta a rolagem ao
topo. O site é uma página só, então o navegador não faz nenhuma das duas coisas sozinho.

## Testes

Ficam junto do arquivo testado (`scoring.test.js` ao lado de `scoring.js`). A bateria de
equilíbrio é o coração: ela roda no `npm run build`, então **teste vermelho impede o deploy**.
O que ela cobre está em `docs/METODOLOGIA.md`.
