# Handoff — Compass

> Entrada nova sempre no TOPO. Máximo 3 aqui; excedentes vão para `handoff_compass_archive.md`.

## 2026-08-10 — claude

**O que foi feito:** Sessão de fundação. Levantamento do que o Political Compass faz de errado
(desequilíbrio documentado de 36 itens codificados à direita contra 20 à esquerda, e nenhuma base
teórica), pesquisa dos instrumentos de origem para as perguntas, e plano aprovado pelo dono.
Montada a estrutura do repositório seguindo o padrão do `vintage` e do `BBB`: `client/` com Vite e
React, `functions/api/` com Pages Functions, `migrations/` para o D1, e a documentação de apoio.

**Estado atual:** Fase 0 quase pronta. Estrutura de pastas, `package.json` da raiz e do client,
`vite.config.js`, `.gitignore`, `CLAUDE.md`, `AGENTS.md`, `docs/ARQUITETURA.md`,
`docs/PENDENCIAS.md` e o esqueleto do `docs/DESIGN-SYSTEM.md` estão no lugar. Nada de código de
produto ainda: não existe nem pergunta, nem conta, nem tela.

Falta na Fase 0, e **os dois dependem de autorização do dono**: `git init` mais o repositório
público no GitHub, e a criação dos bancos `compass-db` e `compass-db-dev` no D1. O
`wrangler.jsonc` só pode ser escrito depois de criar os bancos, porque precisa do `database_id`.

**Para o próximo agente:** A Fase 1 é a que define se o projeto vale alguma coisa, e ela é longa.
Não sair escrevendo pergunta de cabeça: a ordem é catalogar os instrumentos em `docs/FONTES.md`,
**ler os questionários de verdade** (World Values Survey ondas 7 e 8, módulos do ISSP, ESEB e
LAPOP em português), mapear item por item, e só então escrever. Toda pergunta precisa de fonte,
código do item e tipo de derivação.

A distinção entre `adaptado` e `construto` é jurídica, não estilística: instrumento público de
pesquisa pode ter o item adaptado com citação; escala psicométrica com direitos (VSA, SDO7,
Fundamentos Morais, NEP) entra só como construto, com redação própria. Marcar errado é problema
de verdade.

O plano completo está em `/Users/gsromero/.claude/plans/cheerful-crunching-finch.md`.
