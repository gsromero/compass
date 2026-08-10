# Compass — bússola política com resultado explicado (contexto do repositório)

Teste político de dois eixos, no espírito do Political Compass, mas com três coisas que ele não
tem: **perguntas derivadas de instrumentos de pesquisa reais e citados**, **equilíbrio provado por
teste automático** e um **resultado que explica por que você caiu ali**.

Vai no ar em **compass.gsromerolab.com** (Cloudflare Pages). Repositório **público**.
Estágio: **em construção**, ainda não publicado.

Este arquivo é o contexto do projeto para agentes que trabalham DENTRO deste repositório.
Regra de ouro: aqui fica só o que NÃO é óbvio pelo código.

## Usuário

- **Guilherme Romero** — dono do produto, **não programador**. Sabe o que quer, não escreve código.
- Como trabalhar com ele:
  - Agir de forma autônoma; confirmar **apenas** antes de: apagar dados, gastar dinheiro, ações
    irreversíveis ou algo voltado para fora (publicar, deploy de produção).
  - Explicações simples, sem jargão.
  - Pode mandar screenshots de erro: olhar a imagem.
  - **Prefere ver mockup antes de mudança visual grande**: publicar como Artifact e esperar o ok.
  - Aprovação em um contexto não vale para o próximo.

## Como trabalhar

- **Plano antes de código:** até 5 linhas (o que muda, onde, o que reusa) e só então executar.
  Mudar o mínimo que resolve; nenhuma feature não pedida.
- **Ler `docs/ARQUITETURA.md` ANTES de explorar o repo**; atualizá-lo ao criar helper ou padrão novo.
- Tudo que está em aberto vive em `docs/PENDENCIAS.md`. Marcar concluídos lá.

### Escada de reuso (parar no primeiro degrau que resolver)

1. **A plataforma já resolve?** `Intl` no idioma do app, Canvas 2D, SVG, `caches.default`,
   Web Share API, `localStorage`, CSS puro. Foi assim que nasceram o gráfico (SVG à mão), as
   animações (CSS) e o card social (Canvas).
2. **Uma dependência JÁ instalada resolve?** São três no front: `react`, `react-dom`,
   `react-router-dom`. **Nunca adicionar dependência nova sem autorização do dono.**
3. **O projeto já tem?** Helpers de `client/src/lib`, tokens do `index.css`, padrões do ARQUITETURA.
   Estender > copiar.
4. Só então código novo, e em `lib/` ou `components/`, nunca dentro de uma página.

### Definição de "pronto"

- Estados cobertos: carregando, erro com retry, vazio (nunca vazio falso em cima de erro).
- Entrada validada; erro claro em vez de aceitar lixo.
- Sem string ou cor à mão: i18n e tokens.
- **Verificar de verdade**: rodar o fluxo afetado, não só o build.

## Stack

- **Cloudflare Pages**, saída de build em `client/dist` (`wrangler.jsonc`).
- **Front**: Vite + React 18 + react-router-dom, em `client/`.
- **Backend**: Pages Functions em `functions/api/`.
- **Banco**: D1. `compass-db` (produção) e `compass-db-dev` (desenvolvimento), binding `DB`.
- **Testes**: Vitest. `npm run build` **roda os testes antes**, de propósito: teste de equilíbrio
  vermelho tem que impedir o deploy.
- É **ES modules**, não CommonJS.
- **Zero biblioteca de UI**: gráficos em SVG à mão, animação em CSS, card social em Canvas 2D.

## Estrutura

```
client/src/lib/       helpers reusáveis (scoring, i18n, share, compass)
client/src/data/      questions.json (banco de perguntas) e tradicoes.json
client/src/components/  componentes de UI
client/src/pages/     uma pasta por rota
functions/api/        endpoints (Pages Functions)
migrations/           SQL do D1, em ordem
docs/                 ARQUITETURA, PENDENCIAS, DESIGN-SYSTEM, FONTES, METODOLOGIA
```

Docs canônicas: mapa do código em `docs/ARQUITETURA.md`, UI em `docs/DESIGN-SYSTEM.md`,
**de onde vem cada pergunta em `docs/FONTES.md`**, a conta e os limites em `docs/METODOLOGIA.md`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Front sozinho, na 5173. `/api` vai por proxy para a 8788 |
| `npm run dev:pages` | Front + Functions + D1 **de desenvolvimento**. É o que testa de verdade |
| `npm test` | Os testes de equilíbrio e da conta |
| `npm run build` | Testes e depois build. Falhou teste, não builda |
| `npm run deploy` | **PRODUÇÃO.** Só com autorização do dono |
| `npm run db:migrate:dev` | Migrations no D1 local |
| `npm run db:migrate:prod` | **PRODUÇÃO.** Migrations no `compass-db` |

## Ambientes

- **Desenvolvimento**: `compass-db-dev`. É o banco que `dev:pages` usa.
- **Produção**: `compass-db`, ligado ao projeto `compass` no Pages, em `compass.gsromerolab.com`.
- Ordem ao mexer no banco: escrever a migration → aplicar no dev → testar → só então produção.

## Regras de UI

- **Ler `docs/DESIGN-SYSTEM.md` antes de qualquer mudança visual.** Nunca cor à mão fora do
  `index.css`.
- **Toda string de interface** vive em `client/src/lib/i18n.js`, em **pt e en**. Nada de texto
  fixo no JSX.
- Datas e números seguem o **idioma do app**, não o do navegador.
- **Sem travessão (em dash)** em texto de UI, em nenhum idioma.
- Animações respeitam `prefers-reduced-motion`.

## Produto (o que não é óbvio pelo código)

- **São 6 eixos, mas só 2 no gráfico.** Econômico e Autoridade formam a bússola porque é o que as
  pessoas reconhecem; Fronteiras, Costumes, Ecologia e Mudança aparecem como barras.
- **Toda pergunta tem fonte rastreável.** Cada item de `questions.json` carrega o instrumento de
  origem, o código do item e o tipo de derivação (`adaptado` ou `construto`). Pergunta sem fonte
  não entra: tem teste que barra.
- **`adaptado` × `construto` é questão de licenciamento, não de estilo.** Instrumento público de
  pesquisa (WVS, ISSP, ESS, LAPOP, ESEB) pode ter o item adaptado com citação. Escala psicométrica
  com direitos (VSA, SDO7, Fundamentos Morais, NEP) entra só como construto, com redação própria.
  **Nunca marcar uma pergunta de categoria B como `adaptado`.**
- **O equilíbrio é a razão de existir do projeto.** Quem responde "concordo" em tudo tem que cair
  no centro. Isso é teste automático, e é o que o Political Compass reprovaria. Mexeu em pergunta
  ou peso, os testes mandam.
- **O modo adaptativo escolhe mantendo o balanço.** Se ele escolhesse só pela informação, poderia
  montar um conjunto torto e trazer o viés de volta pela porta dos fundos.
- **A incerteza tem dois usos**: desenha a elipse no gráfico e decide quando parar de perguntar.
  É um mecanismo só; mexer nele mexe nas duas coisas.
- **O zero é o meio da escala, não a média dos respondentes.** Decisão normativa, declarada no
  site, para o centro não andar conforme o público muda.
- **Nada identifica quem respondeu.** Sem IP, sem navegador, sem conta, sem identificador que
  volte. Só o vetor de respostas solto.
- **O link de resultado não depende do banco**: o código na URL carrega o resultado inteiro.

## Git

- **Toda mudança em uma branch.** Nunca commitar direto na `main`.
- Prefixos: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`.
- Fluxo: branch → commits → push → (aprovação do dono) → merge `--no-ff` na `main` → deploy →
  apagar branch.
- Commit e push **só quando o dono pedir**.

## Handoff e Changelog

Ao fim de toda sessão com mudanças, atualizar `handoff_compass.md` (entrada nova no TOPO, máximo 3)
e `CHANGELOG.json` (mais nova no topo, máximo 5). Excedentes vão para os arquivos `_archive`.
Ler o handoff recente **antes de começar**.

## Gotchas

- **Fundo do card social tem que ser sólido.** Transparência vira preto no Instagram.
- **Pages Functions não têm cron.** Os agregados são calculados sob demanda e guardados no
  `caches.default`; não existe job que recalcula sozinho.
- **Gravação da tabela `itens` é em lote** (`db.batch`), nunca em laço: são dezenas de linhas por
  resposta.
- **Abaixo de 50 respostas** as seções de percentil, mapa de calor e "onde você destoa" não
  aparecem. É de propósito, não é bug.
