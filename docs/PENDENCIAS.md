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
- [ ] `git init` e repositório público no GitHub (**precisa de autorização do dono**)
- [ ] Criar `compass-db` e `compass-db-dev` no D1 (**precisa de autorização do dono**)
- [ ] Preencher o `database_id` real no `wrangler.jsonc`

## Fase 1 — Embasamento, perguntas e equilíbrio

- [ ] `docs/FONTES.md`: catálogo dos instrumentos, com licenciamento categoria A ou B
- [ ] Ler os questionários de verdade (WVS onda 7 e 8, módulos do ISSP, ESEB, LAPOP)
- [ ] Mapa item por item: quais itens de origem cobrem quais subtemas de cada eixo
- [ ] Escrever as ~48 perguntas, 8 por eixo, 4 de cada lado, com fonte e derivação
- [ ] `client/src/lib/scoring.js`
- [ ] Bateria de testes de equilíbrio (os 8 do plano) + teste de rastreabilidade de fonte
- [ ] `docs/METODOLOGIA.md`
- [ ] **Entregar para o dono revisar**: perguntas, tabela de fontes e relatório de equilíbrio

## Fase 2 — Telas

- [ ] Mockup de entrada, questionário, resultado e card social, publicado como Artifact
- [ ] `docs/DESIGN-SYSTEM.md` de verdade (hoje é só um esqueleto)
- [ ] **Aprovação do dono antes de codar o frontend**

## Fase 3 — Questionário

- [ ] `lib/i18n.js` e `lib/lang.jsx` (portar do vintage)
- [ ] Tela de entrada com escolha de modo e idioma
- [ ] Cartão de pergunta: teclas 1 a 5, setas, Backspace, swipe no celular
- [ ] Chip de importância, opcional, aparecendo depois da resposta
- [ ] Salvamento automático no `localStorage` e retomada
- [ ] Escolha adaptativa da próxima pergunta, mantendo o balanço

## Fase 4 — Resultado e card

- [ ] Bússola em SVG com elipse de incerteza
- [ ] Barras dos 4 eixos secundários com margem
- [ ] "Por que você caiu aqui", com a fonte de cada pergunta
- [ ] Tradições mais próximas
- [ ] Card social em Canvas (portar `shareCard.js` e `shareImage.js` do BBB)
- [ ] Link permanente com o resultado codificado na URL

## Fase 5 — Dados da população

- [ ] `migrations/0001_init.sql`
- [ ] `POST /api/respostas` com validação
- [ ] `GET /api/agregados` com `caches.default`
- [ ] Percentil, mapa de calor e "onde você destoa"
- [ ] Estado "ainda coletando respostas" abaixo de 50

## Fase 6 — Conteúdo e lançamento

- [ ] ~12 páginas de tradições ideológicas
- [ ] Página **Sobre** com a lista completa de referências
- [ ] Página de metodologia com os pesos abertos
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
