# Compass — mapa do código (para agentes)

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
   ↓  em paralelo, POST /api/respostas (anônimo) alimenta os agregados
GET /api/agregados  →  percentil, mapa de calor, "onde você destoa"
```

## Helpers de `client/src/lib` (reusar antes de criar)

| Arquivo | O que faz |
|---|---|
| `scoring.js` | **A conta, e fonte única dela.** Posição em cada eixo, margem de erro, quadrante, e a escolha da próxima pergunta no modo adaptativo. Nenhuma tela recalcula nada por fora |
| `questions.js` | Porta de entrada do banco de perguntas: carrega `data/questions.json`, filtra por idioma (`so_no_idioma`) e valida forma. Nenhuma tela lê o JSON direto |
| `i18n.js` | TODAS as strings de interface, pt e en. Valor pode ser função quando tem número no meio |
| `lang.jsx` | `LangProvider` + `useLang()`, devolvendo `{ lang, setLang, toggle, t, pick }`. `t` é string de interface; `pick` é texto de conteúdo (objetos `{pt, en}`). A escolha fica no localStorage e manda sobre o navegador |
| `compass.js` | Geometria do gráfico: converte posição de eixo (-10 a +10) em coordenada de SVG, e margem de erro em elipse. Usado pela tela de resultado E pelo card social, para os dois nunca discordarem |
| `shareCard.js` | Card 1080x1080 em Canvas 2D, sem dependência. Fundo sempre sólido (transparência vira preto no Instagram). Portado do BBB |
| `shareImage.js` | `shareCanvasPng()` e `downloadCanvasPng()`: compartilhamento nativo quando o navegador aceita arquivo, download quando não. Portado do BBB, sem a parte de Capacitor |
| `permalink.js` | Codifica e decodifica o resultado na URL. É o que faz o link de resultado funcionar sem banco |
| `agregados.js` | Busca `GET /api/agregados` e nunca lança: sem servidor, devolve "dados insuficientes" e a tela esconde as seções que dependem de volume |

## Dados (`client/src/data`)

| Arquivo | O que é |
|---|---|
| `questions.json` | O banco de perguntas, versionado. Cada item tem `eixos` (peso com sinal), `fonte` (instrumento, onda, código do item, url), `derivacao` (`adaptado` ou `construto`) e `texto` em pt e en. **Pergunta sem fonte não entra: tem teste que barra** |
| `tradicoes.json` | As tradições ideológicas de referência: posição nos 6 eixos, explicação e leituras, nos dois idiomas. Também serve de teste de validade (cada tradição tem que cair onde a literatura diz) |

## Functions (`functions/api`)

| Rota | O que faz |
|---|---|
| `respostas.js` | `POST`. Valida faixa e tipo de tudo, grava uma linha em `respostas` e as linhas de `itens` **em lote**. Não guarda nada que identifique quem respondeu |
| `agregados.js` | `GET`. Números da população, guardados no `caches.default` por 10 minutos. Abaixo de 50 respostas devolve `{ suficiente: false }` e a tela se ajusta |

## Testes

Ficam junto do arquivo testado (`scoring.test.js` ao lado de `scoring.js`). A bateria de
equilíbrio é o coração: ela roda no `npm run build`, então **teste vermelho impede o deploy**.
O que ela cobre está em `docs/METODOLOGIA.md`.
