# Compass: Pendências (tudo que está em aberto)

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

## Fase 0: Fundação

- [x] Estrutura de pastas, `package.json` da raiz e do client, `vite.config.js`, `.gitignore`
- [x] `CLAUDE.md`, `AGENTS.md` e as docs de apoio
- [x] `git init` e repositório público no GitHub: github.com/gsromero/compass
- [x] Criar `compass-db` e `compass-db-dev` no D1 (**precisa de autorização do dono**)
- [x] Preencher o `database_id` real no `wrangler.jsonc`

## Fase 1: Embasamento, perguntas e equilíbrio

- [x] `docs/FONTES.md`: catálogo dos instrumentos, com licenciamento categoria A ou B
- [x] Ler os questionários de verdade (WVS onda 7 e 8, módulos do ISSP, ESEB, LAPOP)
- [x] Mapa item por item: quais itens de origem cobrem quais subtemas de cada eixo
- [x] Escrever as ~48 perguntas, 8 por eixo, 4 de cada lado, com fonte e derivação
- [x] `client/src/lib/scoring.js`
- [x] Bateria de testes de equilíbrio (os 8 do plano) + teste de rastreabilidade de fonte
- [x] `docs/METODOLOGIA.md`
- [x] Revisão de redação das 48 afirmações: saiu o tom de memorando, aprovado pelo dono em 11/08
- [ ] **Revisão do dono**: ler as 48 afirmações procurando tom que empurre para algum lado. O
      teste automático pega desequilíbrio estrutural, não tom
- [ ] Piloto com 4 a 6 pessoas de posições políticas diferentes, com uma pergunta ao final:
      "alguma afirmação pareceu escrita para te empurrar para algum lado?"

## Fase 2: Telas

- [x] `docs/DESIGN-SYSTEM.md` de verdade
- [x] Revisão do site inteiro no celular, medida em 375px e 320px: topo com menu hamburguer numa
      linha só, alvo de toque de 44px, tabela larga que avisa que rola
- [x] **Aprovação visual do dono**, testado em previews reais antes de publicar: container único de
      1200px, topo e rodapé de ponta a ponta, cards de diferença removidos da Home, seletor de modo
      lado a lado. Aprovado em 2026-08-16.

## Fase 3: Questionário

- [x] `lib/i18n.js` e `lib/lang.jsx` (portar do vintage)
- [x] Tela de entrada com escolha de modo e idioma
- [x] Cartão de pergunta: teclas 1 a 5, setas, Backspace, swipe no celular
- [x] Chip de importância, opcional, aparecendo depois da resposta
- [x] Salvamento automático no `localStorage` e retomada
- [x] Escolha adaptativa da próxima pergunta, mantendo o balanço

## Fase 4: Resultado e card

- [x] Bússola em SVG com elipse de incerteza
- [x] Barras dos 4 eixos secundários com margem
- [x] "Por que você caiu aqui", com a fonte de cada pergunta
- [x] Tradições mais próximas
- [x] Card social em Canvas (portar `shareCard.js` e `shareImage.js` do BBB)
- [x] Link permanente com o resultado codificado na URL

## Fase 5: Dados da população

- [x] `migrations/0001_init.sql`
- [x] `POST /api/respostas` com validação
- [x] `GET /api/agregados` com `caches.default`
- [x] Percentil, mapa de calor e "onde você destoa"
- [x] Estado "ainda coletando respostas" abaixo de 50

## Fase 6: Conteúdo e lançamento

- [x] ~12 páginas de tradições ideológicas
- [x] Página **Sobre** com a lista completa de referências
- [x] Página de metodologia com os pesos abertos
- [x] Prévia de link: `og:image` única (`client/public/og.png`, ponto no centro de propósito, para
      não sugerir quadrante), favicon e descrições com acento. Feito em 2026-10-01
- [ ] `og:image` por quadrante no link de resultado: exige uma Function que reescreva o HTML de
      `/resultado/:codigo` (o site é SPA, o robô do WhatsApp não roda JS)
- [x] Projeto no Pages criado e primeiro deploy publicado em `compass-429.pages.dev` (2026-08-16,
      autorizado pelo dono). Banco de produção migrado.
- [x] Domínio `compass.gsromerolab.com` conectado (confirmado no ar em 2026-10-01)

---

## Armadilhas conhecidas

- Card social com fundo transparente vira preto no Instagram.
- Pages Functions não têm cron: agregado é sob demanda, guardado no cache.
- O modo adaptativo pode reintroduzir viés se escolher só pela informação. Ele tem que manter o
  balanço de codificação, e existe teste simulando 10 mil sessões para provar.
- **O site não tinha `ErrorBoundary` nenhum até 2026-08-17.** Qualquer exceção não tratada em
  qualquer componente virava tela em branco, sem pista nenhuma. Agora `ErroLimite.jsx` (em torno de
  `<Routes>`, dentro do header/rodapé) mostra uma mensagem e manda o erro pro console. Se aparecer
  um erro de novo, é ali que ele vai estar.

## Bug em produção: tela em branco ao terminar o teste completo (achado e corrigido em 2026-08-17)

- [x] O dono relatou tela em branco ao terminar o modo completo (48 perguntas). Investigação não
      reproduziu exceção na lógica de pontuação/codificação (simulado com 371 testes + sessões
      completas de 48 respostas em vários padrões). Causa mais provável: alguma exceção de render
      ainda não identificada, agravada por não existir `ErrorBoundary` nenhum no site.
- [x] `ErroLimite.jsx` (novo): `ErrorBoundary` em torno de `<Routes>`, mostra mensagem e reseta ao
      trocar de rota. Header e rodapé continuam de pé mesmo se uma página quebrar.
- [x] Bug real encontrado no caminho, corrigido junto: `proximoPar` em `scoring.js` parava de
      perguntar cedo no modo **completo** também (prometia "48 perguntas, precisão máxima" mas podia
      parar em 24). Corrigido: o corte antecipado só vale para modos com limite finito.
- [ ] **Se a tela em branco acontecer de novo**, agora o console do navegador vai ter o erro real.
      Pedir pro dono abrir o DevTools e mandar o que aparecer em vermelho.

## Questionário por arrasto (feito em 2026-08-11)

- [x] Escala de 4 pontos, com "não sei dizer" separado e fora da conta
- [x] Pontuação por pares completos: par com "não sei" cai inteiro
- [x] `lib/gesto.js` com testes: arrasto vira resposta, distância é intensidade
- [x] Cartão arrastável, mantendo lista de botões e teclado
- [x] Dois modos exclusivos (cartão e lista), com troca na tela e escolha guardada
- [x] Agregados filtrando por versão do banco
- [ ] **Se o piloto mostrar que muita gente usa "não sei"**, avaliar avisar na hora ("essa e a
      afirmação oposta vão sair da sua conta") em vez de só explicar depois

## Revisão geral (2026-10-01)

- [x] Abrir link compartilhado ou recarregar o resultado gravava a resposta de novo no banco
- [x] Mancha da população com as células deslocadas (lado negativo puxado para o centro)
- [x] POST aceitava pergunta inventada, repetida e quadrante incoerente
- [x] "% de proximidade" das tradições exagerada (centro dava 64 a 86% com todas): virou posição
- [x] Link de versão antiga mostrava "Alguma coisa quebrou"
- [x] Tela de idade e gênero sem explicação e sem "Pular"
- [x] Título da aba por página e rolagem ao topo ao trocar de página
- [x] `criado_em` só com o dia; idioma e tema não derrubam o site com armazenamento bloqueado
- [x] `0002_demografia.sql` aplicada em produção e revisão publicada (2026-10-01, autorizado)
- [x] Turnstile no POST (2026-10-01): widget criado pelo dono, segredo gravado por ele no Pages,
      verificação dentro de `functions/api/respostas.js`, aviso na página Sobre
- [ ] `og:image` por quadrante: dono perguntou se é só autorizar; falta o "pode fazer". Mostrar as
      quatro imagens antes de codar

## Propostas de interface (pesquisa na Mobbin, mockup aprovado em 2026-10-01)

- [x] 1 · Resultado com manchete, atalhos de seção e Compartilhar no topo
- [x] 2 · Cartão menor, baralho por trás e polegares embaixo (celular e computador)
- [x] 3 · Lista com a afirmação no alto e o peso antes das respostas
- [x] 4 · "Por que você caiu aqui" mostrando a resposta da pessoa, e todas as respostas recolhidas
- [x] 5 · Início com seletor de duração numa linha e amostra do resultado
- [x] 6 · Tradições no menu e no rodapé; cartão de tradição vira link
- [x] Registrar por onde cada resposta veio (`itens.via`: arrasto, botao, teclado), autorizado
      pelo dono em 2026-10-01. Migration `0003_via_resposta.sql`
- [ ] Quando houver volume: comparar a distribuição de respostas por `via` (o arrasto produz mais
      "muito" que o toque?). Se sim, ajustar os limiares de `lib/gesto.js` ou o padrão do celular
- [x] `og:image` por quadrante (2026-10-01): `functions/resultado/[codigo].js` + `client/public/og/`
- [x] Redesenho da página de resultado e da bússola (2026-10-01, mockup aprovado)
- [x] Página "Onde ficam os partidos" com o BLS 2021 (2026-10-01): mínimo de 10 notas; PV e Rede
      de fora por terem 1 nota cada
- [x] Card social: faixa da margem vazava da barra no extremo (+10). Corrigido em `shareCard.js`
- [ ] Quando a 10ª rodada do BLS (2025) for publicada: baixar, rodar `node scripts/partidos-bls.mjs`
      e trocar a rodada; ela terá União Brasil e PRD com nome próprio
- [x] `0003_via_resposta.sql` aplicada em produção e tudo publicado (2026-10-01)
- [ ] Confirmar em produção: um teste completo passando pelo Turnstile real e `itens.via` preenchido
- [ ] No piloto: observar quem usa cada modo e se o arrasto deu resposta diferente da pretendida

## Cards claros, visitante e tema único (2026-10-01, mockup aprovado)

- [x] Modo escuro removido do site inteiro
- [x] Comparação escondida até haver respostas suficientes (sai a seção e o atalho)
- [x] Card claro em três formatos (Quadrado, Story, Mínimo), tradição opcional só no Story
- [x] Visitante de link: faixa com "Fazer o teste", textos em terceira pessoa, convite no fim
- [ ] Opcional, combinado para uma segunda etapa: depois que o visitante faz o teste, mostrar os
      dois pontos na bússola e a comparação eixo a eixo

## Depois do lançamento

- [ ] Análise fatorial com dados reais: as perguntas medem mesmo o eixo declarado?
- [ ] Consistência interna por eixo; tirar perguntas que não discriminam
- [ ] Funcionamento diferencial entre pt e en (item que se comporta diferente nos dois idiomas)
- [ ] Piloto com 4 a 6 pessoas de posições diferentes antes de divulgar
