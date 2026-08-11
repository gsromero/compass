# Compass — metodologia

> A conta, o relatório de equilíbrio e os limites. Este arquivo alimenta a página `/metodologia`
> do site. De onde vem cada pergunta: `docs/FONTES.md`.

## Por que este arquivo existe

O Political Compass nunca publicou os pesos das afirmações dele. É pedir confiança sem oferecer
como conferir. Aqui a conta inteira está escrita, e a parte que mais importa está automatizada:
existe uma bateria de testes que **quebra o build** se o teste ficar tendencioso.

---

## Os seis eixos

Dois formam o gráfico, porque é o formato que as pessoas reconhecem. Os outros quatro aparecem
como barras.

| Eixo | -10 | +10 | Instrumento que definiu |
|---|---|---|---|
| **Econômico** | Igualdade | Mercado | CHES (dimensão econômica), World Values Survey |
| **Autoridade** | Liberdade | Autoridade | CHES (componente TAN), Very Short Authoritarianism |
| **Fronteiras** | Mundo | Nação | CHES (componente TAN), ISSP National Identity |
| **Costumes** | Progresso | Tradição | World Values Survey (tradicional ↔ secular-racional), Fundamentos Morais |
| **Ecologia** | Sustentabilidade | Crescimento | CHES (componente GAL), New Ecological Paradigm |
| **Povo** | Instituições | Povo | World Values Survey (bateria Q205 a Q210) |

**Sobre o eixo Povo:** o plano original previa um eixo "Ordem ↔ Transformação". Ao ler o
questionário de verdade, os itens que existem e são conferíveis (Q205 a Q210) medem outra coisa,
e melhor: a tensão entre decisão por instituições e especialistas de um lado, e vontade popular
direta do outro. Deixei os itens disponíveis definirem o eixo em vez de forçar itens para caber
num eixo que eu tinha declarado antes. Populismo existe à esquerda e à direita, o que torna esse
eixo informativo justamente por ser independente dos outros.

---

## A conta

Cada resposta vai de **-2** (discordo muito) a **+2** (concordo muito), com **0** neutro de
verdade, que não entra na conta de lado nenhum. Cada resposta pode receber um peso opcional de
importância: **0,5** (baixa), **1** (normal, padrão) ou **1,5** (alta).

A posição em cada eixo:

```
posição = Σ(resposta × peso × importância) ÷ (2 × Σ(|peso| × importância))
```

Isso dá um número de -1 a +1, mostrado de -10 a +10. Dividir pelo que foi **efetivamente
respondido** é o que faz um teste incompleto não distorcer o resultado, e é o que permite que
poucas perguntas sejam exclusivas de um idioma sem quebrar a comparação entre os dois públicos.

### A margem de erro, que é a peça central

Cada resposta, sozinha, dá um palpite de onde a pessoa está naquele eixo. **O quanto esses
palpites discordam entre si vira a margem de erro.** Quem responde de forma coerente ganha uma
elipse apertada; quem se contradiz ganha uma elipse larga, e isso é informação, não defeito.

A conta mistura o que as respostas mostram com um prior de "não sei nada sobre esta pessoa"
(variância de uma opinião uniforme, 1/3), pesando pelo tamanho efetivo da amostra. Sem esse prior,
quem respondesse **uma** pergunta num eixo apareceria com margem zero, que é exatamente o tipo de
precisão falsa que este projeto existe para não cometer. O Political Compass reporta duas casas
decimais e nenhuma incerteza.

Essa mesma margem **decide quando parar de perguntar**. É um mecanismo só com dois usos.

### Modos

| Modo | Perguntas | Como funciona |
|---|---|---|
| Rápido | 16 | Para nos 8 pares |
| Padrão | 32 | Para nos 16 pares, ou antes se todos os eixos convergirem |
| Completo | 48 | Todas |

Nos modos adaptativos, a próxima pergunta é sempre a de maior peso do eixo com a maior margem
naquele momento. Quando todos os eixos têm base mínima e margem apertada, o teste acaba antes do
limite.

---

## Como o equilíbrio é garantido

Das 62 afirmações do Political Compass, **36 são codificadas para a direita e 20 para a esquerda**
(no eixo social, 25 contra 10). Como existe tendência documentada das pessoas a concordar com o
que leem, quem responde no automático é deslocado pela construção do teste, não pelo que pensa.

Aqui isso é tratado em três camadas.

### 1. Codificação balanceada por construção

Cada eixo tem 8 perguntas: **4 em que concordar puxa para um lado e 4 em que puxa para o outro**,
com pesos espelhados. É o mesmo princípio da Very Short Authoritarianism Scale, que é balanceada
por direção de redação de propósito.

### 2. Pares de balanço

As 8 perguntas de cada eixo formam **4 pares**, cada par com um item de peso `-w` e um de `+w`.
O modo adaptativo **só pergunta pares inteiros e só para em fronteira de par**.

Isso resolve um problema sutil que passa despercebido com facilidade: se a escolha das perguntas
fosse feita só por informação, o algoritmo poderia montar um conjunto torto sem querer e trazer o
viés de volta pela porta dos fundos. Com pares, **qualquer subconjunto perguntado é equilibrado**,
em qualquer modo.

### 3. Testes que quebram o build

Em `client/src/lib/equilibrio.test.js`, rodando no `npm run build`:

| # | O que prova |
|---|---|
| 1 | Cada eixo tem o mesmo número de itens dos dois lados, e a soma dos pesos com sinal é zero |
| 2 | **Quem concorda com tudo cai no centro.** E quem discorda de tudo também |
| 3 | Responder neutro em tudo dá exatamente zero |
| 4 | Os dois lados pesam igual, e cada par se anula |
| 5 | O modo adaptativo mantém o equilíbrio, em 2000 sessões simuladas com respostas aleatórias |
| 6 | Nenhum termo carregado, nenhuma afirmação dupla, comprimentos parecidos dos dois lados |
| 7 | Toda pergunta existe nos dois idiomas, e os dois idiomas oferecem o mesmo teste |
| 8 | Quatro tradições ideológicas caem no quadrante que a literatura diz |
| 9 | Toda pergunta declara instrumento, código do item e tipo de derivação |

O teste 2 é o que resume o projeto: **o Political Compass reprovaria nele.**

Detalhe importante do teste 2: quem concorda com tudo cai no centro **com margem grande**, não com
certeza. Cair no centro por indiferença e cair no centro por concordar com tudo são coisas
diferentes, e o resultado sabe distinguir.

### Relatório de equilíbrio, versão 1 do banco

| Eixo | Itens | Concordar puxa neg | puxa pos | Soma dos pesos | Força média neg / pos |
|---|---|---|---|---|---|
| Econômico | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |
| Autoridade | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |
| Fronteiras | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |
| Costumes | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |
| Ecologia | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |
| Povo | 8 | 4 | 4 | 0,000 | 0,85 / 0,85 |

**48 perguntas.** 38 adaptadas de itens conferidos palavra por palavra no questionário oficial do
World Values Survey; 10 de redação própria a partir de construtos documentados.

---

## O que os testes NÃO provam

Ser honesto sobre isso é parte do método.

- **Equilíbrio estrutural não é equilíbrio de tom.** Nenhum teste automático detecta uma afirmação
  escrita de um jeito que soa mais razoável de um lado. Isso exige gente: revisão do dono e
  piloto com pessoas de posições diferentes, ambos em `docs/PENDENCIAS.md`.
- **Não há validação empírica ainda.** Provar que as perguntas medem o que dizem medir exige
  respostas reais e análise fatorial. Quando houver volume, entram nesta página: análise fatorial,
  consistência interna por eixo, itens que não discriminam, e funcionamento diferencial entre
  português e inglês.
- **A escolha dos eixos é uma tese, não um fato.** Seis eixos é uma decisão. Outras pessoas
  dividiriam o espaço político de outro jeito, com bons argumentos.

## Privacidade

Nada identifica quem respondeu: sem IP, sem navegador, sem conta, sem identificador que volte na
próxima visita. O que fica guardado é o vetor de respostas solto, usado só para os números da
população. O link do seu resultado carrega o resultado inteiro codificado na URL, e por isso
funciona sem consultar o banco.
