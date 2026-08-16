# Compass: instruções para agentes

O contexto do projeto inteiro está em **`CLAUDE.md`**, na raiz. Ler antes de qualquer coisa.

Atalhos para as docs canônicas:

- `docs/ARQUITETURA.md`: mapa do código. Consultar ANTES de sair explorando o repo.
- `docs/PENDENCIAS.md`: tudo que está em aberto. Marcar concluídos lá.
- `docs/DESIGN-SYSTEM.md`: fonte de verdade de UI. Ler antes de mudança visual.
- `docs/FONTES.md`: de onde vem cada pergunta e o que pode ser copiado.
- `docs/METODOLOGIA.md`: a conta, o relatório de equilíbrio e os limites declarados.

Três regras que quebram o projeto se ignoradas:

1. **Pergunta sem fonte rastreável não entra.** Tem teste que barra.
2. **Mexeu em pergunta ou peso, `npm test` manda.** Os testes de equilíbrio são a razão de existir
   do projeto, não burocracia.
3. **Nunca adicionar dependência sem autorização do dono.**
