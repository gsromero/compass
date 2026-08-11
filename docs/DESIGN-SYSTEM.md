# Compass — design system (fonte de verdade de UI)

> Ler ANTES de qualquer mudança visual. A implementação inteira mora em
> `client/src/index.css`; este arquivo explica o porquê e como usar.

## A ideia

Um instrumento de pesquisa, não um quiz de rede social. A pessoa está lendo afirmações sobre
poder, dinheiro e moral, e a tela precisa dar a ela a calma de quem lê um documento. Daí a coluna
estreita, o espaço em volta e a fonte serifada só nas afirmações.

## A decisão central: a interface é monocromática

**A cor é reservada exclusivamente para os dados do gráfico.** Botões, links e destaques usam a
própria tinta do texto, e não uma cor de marca.

Isso não é estilo, é requisito de produto. Vermelho, azul, verde e amarelo já têm leitura
partidária pronta no Brasil e nos Estados Unidos. Um botão "Começar" em azul, ou um destaque em
vermelho, faria a interface parecer torcer por algum lado, num site cuja razão de existir é
justamente não torcer. Com a interface monocromática o problema deixa de existir.

## Cores (tokens, em `:root`)

| Token | Onde usar |
|---|---|
| `--ink` / `--ink-mid` / `--ink-dim` | Texto principal, secundário e de apoio |
| `--bg` / `--panel` / `--raised` | Fundo da página, cartões, elementos elevados |
| `--line` / `--line-forte` | Bordas, divisórias e grade do gráfico |
| `--acao` / `--acao-tinta` | Botão principal. **É a própria tinta**, ver acima |
| `--q-igualdade-liberdade` e os outros três | Os quadrantes. **Só no gráfico e no card** |
| `--voce` | Seu ponto e sua elipse |
| `--populacao` | A mancha de quem já respondeu |
| `--erro` / `--ok` | Só estado, nunca decoração |

**Nunca escrever cor à mão fora do `index.css`.** A única exceção é `lib/shareCard.js`, e ela é
justificada no próprio arquivo: o card é uma imagem que sai do site e não herda o tema de ninguém,
então precisa de valores fixos.

### Por que os quadrantes são gerados em OKLCH

As quatro cores têm **a mesma leveza e o mesmo croma**, variando só o tom, em passos de 90 graus.
É o jeito tecnicamente correto de garantir que nenhum quadrante fique mais forte, mais bonito ou
mais desejável que outro. Em RGB isso seria impossível de acertar no olho: um azul e um amarelo de
mesmo valor numérico têm pesos visuais muito diferentes.

O croma é baixo de propósito. Elas são rótulo, não torcida.

## Tema claro e escuro

Os dois, por `prefers-color-scheme`. Diferente do vintage, que é só escuro por decisão de produto,
aqui a pessoa pode estar respondendo em qualquer contexto. No escuro os quadrantes ganham um pouco
de leveza para não sumirem no fundo, mas continuam iguais entre si, que é o que importa.

## Tipografia

Dois papéis, **nenhuma fonte baixada da internet**: o site tem que funcionar sem depender de fora.

- **`--fonte-ui`** (fonte do sistema): interface inteira, rótulos, botões, tabelas.
- **`--fonte-texto`** (Georgia e equivalentes): **só as afirmações do questionário**, os resumos
  das tradições e as citações. É o que faz o cartão parecer documento em vez de rede social, e faz
  a pessoa ler com mais calma.

A afirmação usa `clamp(22px, 4.6vw, 30px)` com `text-wrap: balance`: ela é a coisa mais importante
da tela mais vista do site.

## Componentes prontos (reusar, não recriar)

| Classe | Para quê |
|---|---|
| `.coluna` / `.coluna-larga` | Largura de leitura (42rem) e largura de dados (58rem) |
| `.cartao` | Bloco de conteúdo com borda e fundo de painel |
| `.botao` / `.botao-secundario` / `.botao-discreto` | Ação principal, secundária e de navegação |
| `.opcao` | Item de escolha grande, usado na escala de resposta e nos modos. `aria-pressed` marca o escolhido |
| `.chip` | Escolha pequena e opcional: importância e modelo do card |
| `.escala` | A pilha das cinco respostas |
| `.afirmacao` | O enunciado da pergunta |
| `.progresso` | Barra fina do questionário |
| `.barra-eixo` e filhas | Um eixo secundário com posição, margem e polos |
| `.rotulo` | Rótulo pequeno em caixa alta, todo cabeçalho de seção usa |
| `.apoio` | Texto secundário |
| `.aviso` | Caixa tracejada de "ainda coletando respostas" |
| `.rolagem` | Envolve tabela larga. **Tabela nunca faz a página rolar de lado** |
| `.pilha` / `.pilha-larga` / `.linha` / `.grade` | Layout |

## Animação

Só duas: a transição de estado dos controles e a entrada do cartão de pergunta (`.entrando`,
260ms). Tudo dentro de `prefers-reduced-motion`, que zera as duas.

O cartão anima com `key={idAtual}` no React: trocar a pergunta remonta o nó e dispara a animação
sozinha, sem biblioteca e sem estado extra.

## Regras de texto

- **Toda string de interface** vive em `client/src/lib/i18n.js`, em pt e en.
- **Sem travessão (em dash)** em nenhum idioma. Existe teste que barra isso nas perguntas.
- Números pelo `Intl` no **idioma do app**, nunca no locale do navegador. Use `num()` do `i18n.js`.

## O card social

1080x1080, Canvas 2D, três modelos (`classico`, `cartaz`, `minimo`). A geometria vem de
`lib/compass.js`, a mesma que a tela usa, para os dois nunca mostrarem posições diferentes.

**Fundo sempre sólido.** Transparência vira preto no Instagram. Gotcha herdado do BBB.
