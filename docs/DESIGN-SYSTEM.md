# Compass: design system (fonte de verdade de UI)

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

**Peso igual não quer dizer apagado.** A primeira versão usava croma 0,075 e o gráfico ficava
lavado; hoje é 0,145, quase o dobro, e a igualdade entre os quatro continua intacta porque o que
importa é serem idênticos em leveza e croma, não serem fracos.

**O quadrante onde a pessoa caiu é só um pouco mais forte que os outros** (0,34 contra 0,24). Com
uma diferença grande, o gráfico passa a dizer "este lado é o certo", que é justamente o que a
paleta de peso igual existe para não dizer. Quem mostra onde a pessoa está é o ponto, não a cor de
fundo.

## Tema claro e escuro

**O claro é o padrão, sempre.** O site abre claro para todo mundo, inclusive para quem tem o
computador inteiro no escuro, e o escuro existe como escolha da pessoa. Decisão do dono, em
10/08/2026.

Por isso **não existe `prefers-color-scheme` neste projeto**: o tema é um atributo `data-tema` no
`<html>`, controlado por `lib/tema.jsx` e guardado no `localStorage`. Quem for adicionar cor nova
precisa declará-la nos dois blocos, `:root` e `:root[data-tema="escuro"]`.

No escuro os quadrantes ganham um pouco de leveza para não sumirem no fundo, mas continuam iguais
entre si, que é o que importa.

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

## A bússola

Três camadas, nesta ordem de importância visual:

1. **A mancha da população** é o fundo de dados: células de 2 pontos do eixo, desenhadas como
   retângulos e passadas por um `feGaussianBlur`. **Não usar um ponto por célula.** A primeira
   versão fazia isso e o gráfico parecia ter defeito: bolinha espalhada não se lê como densidade,
   se lê como sujeira. Borrada, a mesma informação vira uma nuvem, que é o que ela é.

   **`--populacao` é neutra de propósito.** Ela já foi azulada, e com os quadrantes coloridos isso
   fazia a mesma cor significar duas coisas: região e quantidade. Neutra, as funções ficam
   separadas: a cor identifica o quadrante, a sombra indica quanta gente.
2. **A elipse da margem de erro** é **só contorno tracejado**, sem preenchimento. Com preenchimento
   ela virava um disco cinza que competia com a mancha e escondia justamente o que a mancha tem a
   dizer.
3. **O seu ponto** é sólido, com um anel da cor do painel por baixo, para não sumir sobre a mancha.

Os rótulos ficam na ponta de cada eixo: Esquerda e Direita deitados nas laterais, Autoridade e
Liberdade em cima e embaixo. Com os quatro na linha de cima não dava para saber qual pertencia a
qual eixo.

**Atenção ao mexer nos rótulos do eixo econômico:** o texto na tela é "Esquerda" e "Direita", mas
as chaves de i18n continuam `polo_igualdade` e `polo_mercado`, e os identificadores internos
continuam `igualdade` e `mercado`. Eles estão nos nomes das variáveis de cor dos quadrantes, nos
valores gravados no banco e na validação da API. Renomear a chave quebra os dados já gravados.

**A mancha sempre vem com legenda.** Sem ela, a pessoa olha e acha que é defeito. E o texto da
legenda é neutro entre os temas ("quanto mais forte"), porque no claro a mancha escurece e no
escuro ela clareia.

## O questionário tem dois modos, e nunca os dois ao mesmo tempo

**Cartão** (arrastar) e **lista** (botões). Mostrar os dois juntos polui a tela e deixa a
experiência pior do que qualquer um deles sozinho; foi assim na primeira versão e estava ruim.

- **O padrão segue o aparelho**: `(pointer: coarse)` abre no cartão, o resto na lista. Arrastar com
  o dedo é ótimo, arrastar com o mouse é pior que clicar.
- **O botão de trocar fica no topo**, ao lado do progresso, e a escolha fica guardada no navegador.
- **No modo cartão a lista continua no DOM**, invisível, e **reaparece ao receber foco**
  (`.escala-oculta:focus-within`). Ela é o único caminho de quem usa leitor de tela ou só o
  teclado; escondê-la de vez trocaria poluição por exclusão.
- **O cartão ocupa a altura da tela** (`.tela-teste` em coluna, `.palco` com `flex: 1`). Todos os
  cartões têm a mesma altura mesmo com afirmações curtas: num baralho que se arrasta, cartão que
  muda de tamanho a cada pergunta fica inquieto.

### O gesto

Arrasta-se para o lado para responder: a direção diz se concorda, **a distância diz o quanto**.
Um pouco é "concordo", muito é "concordo muito". Nada de quatro sentidos para decorar.

- **A decisão mora em `lib/gesto.js`**, não no componente. Gesto é a parte que quebra em silêncio
  porque ninguém escreve teste de arrastar; isolada, ela é testável e o componente só aplica.
- **Os limiares são fração do ALCANCE, e não da largura do cartão.** Alcance é o quanto o dedo
  consegue arrastar naquela tela: do centro do cartão até a borda mais próxima da janela, com teto
  de 60% da largura do cartão para uma tela enorme não exigir um arrasto absurdo.

  A diferença já causou defeito. Com os limiares presos ao cartão, as faixas ficavam assim:
  iPhone SE 80px contra 87px (equilibrado), mas desktop 152px contra 360px e tela grande 152px
  contra 610px. No celular o cartão quase preenche a tela e as duas medidas coincidem; no desktop
  o cartão para em 42rem e a janela continua crescendo, então a faixa do "muito", que não tem fim,
  inchava. Medindo pelo alcance, as duas faixas ficam **iguais em qualquer tela**, e há teste que
  varre pixel a pixel para garantir.
- **`touch-action: pan-y` no cartão.** Deixa a página rolar no vertical e entrega o horizontal ao
  gesto. Sem isso, arrastar de lado rolaria a página junto.
- **O cartão não tem rótulo fixo de lado nenhum.** Só a etiqueta da resposta que o arrasto daria,
  na base do cartão, com o polegar uma linha acima do texto. Já houve rótulos fixos sobrepostos ao
  cartão, depois acima dele e depois na base; nenhum era necessário, e todos competiam com a
  afirmação, que é o que a pessoa precisa ler.
- **A etiqueta fica sempre montada, e só muda de opacidade.** Entrando e saindo do DOM ela mudava a
  altura em 21px e fazia a afirmação pular a cada arrasto. Reservar altura na mão seria chute que
  quebra em outra fonte.

  **Atenção à grade do `.palco`:** duas faixas, `1fr auto`, com o cartão esticando e a dica colada
  embaixo. Já teve três; sobrar uma faixa faz o cartão pegar a que não estica e encolher de 564px
  para 211px.
- **A ordem da tela é por frequência de uso:** cartão, dica, importância, "não sei", e por último a
  lista de botões. No celular a lista é a alternativa; no desktop mandam o mouse e o teclado.
- **No modo cartão tudo é centralizado**, e no modo lista o conteúdo fica no meio vertical da tela
  em vez de colado no topo. O bloco de importância é centralizado nos dois modos.
- **A lista de botões e o teclado nunca podem sumir.** São o único caminho para quem usa leitor de
  tela ou só o teclado, e arrastar com mouse é pior que clicar.
- Sob `prefers-reduced-motion`, o cartão troca na hora, sem voar.

### Polegares

Um polegar para "concordo", dois para "concordo muito", e virados para baixo do lado de discordar.
Desenhados à mão em SVG, porque a regra é não trazer biblioteca de ícone para dois traços.

**Só na etiqueta do arrasto**, no modo cartão. Na lista não entram: lá o número da tecla e o rótulo
já bastam, e o ícone só apertava o botão.

**São decorativos, e por isso ficam com `aria-hidden`.** Quem carrega o sentido é o texto ao lado:
ícone sozinho não é lido por leitor de tela e não é entendido do mesmo jeito por todo mundo.

### A lista de respostas

Uma opção embaixo da outra, sempre, com o número da tecla visível em qualquer tela. Chegou a ser
uma grade de duas colunas com polegar, e isso exigiu uma cadeia de três blocos de CSS só para
"Concordo muito" caber numa linha. Voltando à coluna única, todos eles saíram: **remendo que existe
só por causa de outra decisão morre junto com ela.**

Lição que ficou daquela cadeia: regra responsiva espalhada pelo arquivo se sobrescreve sem ninguém
notar. Se voltar a existir, mantenha tudo junto e do mais amplo para o mais estreito.

**"Não sei dizer" é discreto de propósito.** O defeito da resposta do meio nunca foi ela existir,
foi ser o botão mais fácil de apertar, no meio da lista e na altura do polegar. Lados sem esforço,
"não sei" deliberado.

## O radar de perfil

Uma petala por eixo, apontando para o polo em que a pessoa pende, do tamanho da conviccao. Fica ao
lado das quatro barras, e mostra os seis eixos de uma vez.

**A regra que nao pode quebrar:** os dois polos do mesmo eixo ficam a 180 graus um do outro, e cada
eixo desenha UMA petala so. Sem isso acontece o que acontece no radar de politica mais conhecido
que circula por ai: "esquerda" e "direita" viram pontas independentes e a mesma pessoa aparece
esticada para os dois lados ao mesmo tempo. Ha teste em `lib/perfil.test.js` para isso.

**Nao usar um poligono unico ligando as doze pontas.** A primeira versao fazia isso: estava correta
e ficava horrivel, porque so metade das pontas tem valor e a linha mergulhava ate o centro entre
elas, virando um catavento.

A petala clara por baixo e a margem de erro. Quando ela aparece **tambem do lado oposto**, esta
dizendo o que a elipse da bussola nao consegue dizer: nem de que lado daquele eixo a pessoa esta
ficou definido.

Os rotulos dos polos que a pessoa NAO defende ficam apagados, e nao escondidos: sumir com eles
tiraria a referencia de qual eixo e qual.

## O card social

1080x1080, Canvas 2D, três modelos (`classico`, `cartaz`, `minimo`). A geometria vem de
`lib/compass.js`, a mesma que a tela usa, para os dois nunca mostrarem posições diferentes.

**Fundo sempre sólido.** Transparência vira preto no Instagram. Gotcha herdado do BBB.
