# Compass

Um teste político de dois eixos, no espírito do [Political Compass](https://www.politicalcompass.org/),
com três diferenças que são a razão de ele existir:

**1. As perguntas vêm de instrumentos de pesquisa reais.** Cada afirmação do teste é derivada de
um item do World Values Survey, do ISSP, do European Social Survey, do LAPOP ou do Estudo
Eleitoral Brasileiro — com o instrumento, a onda e o código do item registrados no próprio banco
de perguntas e publicados no site. O Political Compass nunca publicou de onde vêm as dele.

**2. O equilíbrio é provado por teste automático, não afirmado.** Das 62 afirmações do Political
Compass, 36 são codificadas para a direita e só 20 para a esquerda. Como as pessoas tendem a
concordar com o que leem, quem responde no automático é empurrado para um lado pela construção do
teste. Aqui existe uma bateria de testes que **quebra o build** se isso acontecer — incluindo o
mais direto de todos: *um respondente que concorda com absolutamente tudo tem que cair no centro
do gráfico*.

**3. O resultado explica.** Não é um ponto com dois parágrafos genéricos: é a sua posição com
**margem de erro**, quais das suas respostas puxaram cada eixo e de onde elas vieram, como você se
compara com quem já respondeu, e em quais pontos você destoa de quem caiu no mesmo quadrante.

Em português e inglês, com as perguntas adaptadas em cada idioma a partir dos questionários
nacionais dos instrumentos de origem — não traduzidas uma da outra.

## Estado

**Em construção.** Ainda não publicado.

## Documentação

| Arquivo | O que tem |
|---|---|
| [`docs/FONTES.md`](docs/FONTES.md) | De onde vem cada pergunta e o que pode ser reusado |
| [`docs/METODOLOGIA.md`](docs/METODOLOGIA.md) | A conta, o relatório de equilíbrio e os limites declarados |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Mapa do código |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Fonte de verdade de UI |
| [`CLAUDE.md`](CLAUDE.md) | Contexto do projeto para agentes de IA |

## Rodando

```sh
npm install && (cd client && npm install)
npm test          # os testes de equilíbrio e da conta
npm run dev       # front sozinho
npm run dev:pages # front + API + banco de desenvolvimento
```

## Privacidade

Nada identifica quem respondeu: sem IP, sem navegador, sem conta, sem identificador que volte na
próxima visita. O que é guardado é o vetor de respostas solto, usado só para os números da
população que aparecem no resultado.
