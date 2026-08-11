# Compass — Pendências (tudo que está em aberto)

> Criado em 2026-08-10, na sessão que montou o projeto. Marcar concluídos AQUI.
> Contexto: `CLAUDE.md`. Mapa do código: `docs/ARQUITETURA.md`. UI: `docs/DESIGN-SYSTEM.md`.

## Regras para quem for executar

1. Ler `CLAUDE.md` antes. Toda mudança em branch; nunca direto na `main`.
2. Strings novas em `client/src/lib/i18n.js`, pt E en, sem travessão.
3. Cor nova não existe: usar os tokens do `index.css`.
4. Pergunta nova precisa de fonte, código do item e tipo de derivação. Sem isso o teste barra.
5. Ao concluir algo: marcar aqui, atualizar `handoff_compass.md` e `CHANGELOG.json`.
6. Mudança visual grande: mockup em Artifact e aprovação do dono antes de codar.

---

## Fase 0 — Fundação

- [x] Estrutura de pastas, `package.json` da raiz e do client, `vite.config.js`, `.gitignore`
- [x] `CLAUDE.md`, `AGENTS.md` e as docs de apoio
- [x] `git init` e repositório público no GitHub: github.com/gsromero/compass
- [x] Criar `compass-db` e `compass-db-dev` no D1 (**precisa de autorização do dono**)
- [x] Preencher o `database_id` real no `wrangler.jsonc`

## Fase 1 — Embasamento, perguntas e equilíbrio

- [x] `docs/FONTES.md`: catálogo dos instrumentos, com licenciamento categoria A ou B
- [x] Ler os questionários de verdade (WVS onda 7 e 8, módulos do ISSP, ESEB, LAPOP)
- [x] Mapa item por item: quais itens de origem cobrem quais subtemas de cada eixo
- [x] Escrever as ~48 perguntas, 8 por eixo, 4 de cada lado, com fonte e derivação
- [x] `client/src/lib/scoring.js`
- [x] Bateria de testes de equilíbrio (os 8 do plano) + teste de rastreabilidade de fonte
- [x] `docs/METODOLOGIA.md`
- [ ] **Revisão do dono**: ler as 48 afirmações procurando tom que empurre para algum lado. O
      teste automático pega desequilíbrio estrutural, não tom
- [ ] Piloto com 4 a 6 pessoas de posições políticas diferentes, com uma pergunta ao final:
      "alguma afirmação pareceu escrita para te empurrar para algum lado?"

## Fase 2 — Telas

- [x] `docs/DESIGN-SYSTEM.md` de verdade
- [ ] **Aprovação visual do dono**, testando o site rodando. O dono autorizou seguir sem mockup
      prévio para chegar antes na parte de testar; se a direção visual não agradar, ajustar aqui

## Fase 3 — Questionário

- [x] `lib/i18n.js` e `lib/lang.jsx` (portar do vintage)
- [x] Tela de entrada com escolha de modo e idioma
- [x] Cartão de pergunta: teclas 1 a 5, setas, Backspace, swipe no celular
- [x] Chip de importância, opcional, aparecendo depois da resposta
- [x] Salvamento automático no `localStorage` e retomada
- [x] Escolha adaptativa da próxima pergunta, mantendo o balanço

## Fase 4 — Resultado e card

- [x] Bússola em SVG com elipse de incerteza
- [x] Barras dos 4 eixos secundários com margem
- [x] "Por que você caiu aqui", com a fonte de cada pergunta
- [x] Tradições mais próximas
- [x] Card social em Canvas (portar `shareCard.js` e `shareImage.js` do BBB)
- [x] Link permanente com o resultado codificado na URL

## Fase 5 — Dados da população

- [x] `migrations/0001_init.sql`
- [x] `POST /api/respostas` com validação
- [x] `GET /api/agregados` com `caches.default`
- [x] Percentil, mapa de calor e "onde você destoa"
- [x] Estado "ainda coletando respostas" abaixo de 50

## Fase 6 — Conteúdo e lançamento

- [x] ~12 páginas de tradições ideológicas
- [x] Página **Sobre** com a lista completa de referências
- [x] Página de metodologia com os pesos abertos
- [ ] `og:image` estática por quadrante
- [ ] Projeto no Pages e domínio `compass.gsromerolab.com` (**autorização do dono**)

---

## Armadilhas conhecidas

- Card social com fundo transparente vira preto no Instagram.
- Pages Functions não têm cron: agregado é sob demanda, guardado no cache.
- O modo adaptativo pode reintroduzir viés se escolher só pela informação. Ele tem que manter o
  balanço de codificação, e existe teste simulando 10 mil sessões para provar.

## Depois do lançamento

- [ ] Análise fatorial com dados reais: as perguntas medem mesmo o eixo declarado?
- [ ] Consistência interna por eixo; tirar perguntas que não discriminam
- [ ] Funcionamento diferencial entre pt e en (item que se comporta diferente nos dois idiomas)
- [ ] Piloto com 4 a 6 pessoas de posições diferentes antes de divulgar
