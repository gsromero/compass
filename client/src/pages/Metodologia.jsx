import { Link } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { num } from "../lib/i18n.js";
import { EIXOS_META, TODAS } from "../lib/questions.js";
import { EIXOS } from "../lib/scoring.js";

// A tabela de pesos aberta. E o diferencial em relacao ao Political Compass,
// que nunca publicou os dele, entao ela precisa estar na tela e nao so no
// repositorio.

const TEXTO = {
  pt: {
    intro:
      "Aqui está a conta inteira: o peso de todas as 48 afirmações, de onde cada uma veio e como o resultado é calculado. Nada disso é segredo, e essa é a diferença.",
    eixos_t: "O que cada eixo mede",
    eixos_esquerda_direita:
      "No gráfico o eixo horizontal aparece como esquerda e direita, que é como as pessoas reconhecem essa dimensão e é também o nome que a fonte usa: a dimensão do Chapel Hill Expert Survey se chama economic left-right. Na prática ela mede quanto do resultado econômico deveria vir do Estado e quanto do mercado. Esquerda é mais igualdade e mais Estado; direita é mais mercado e mais responsabilidade individual.",
    conta_t: "Como a posição é calculada",
    conta:
      "Cada resposta vale de -2 (discordo muito) a +2 (concordo muito). Não existe ponto do meio: \"não sei dizer\" é uma opção à parte e fica fora da conta. A importância que você marca multiplica o peso da resposta: 0,5 para pouco, 1 para normal e 1,5 para muito.",
    formula: "posição = soma(resposta x peso x importância) / (2 x soma(|peso| x importância))",
    conta2:
      "Dividir pelo que foi efetivamente respondido é o que faz um teste incompleto não distorcer o resultado. O número vai de -1 a +1 e aparece de -10 a +10.",
    margem_t: "Como a margem de erro é calculada",
    margem:
      "Cada resposta, sozinha, dá um palpite de onde você está naquele eixo. O quanto esses palpites discordam entre si vira a margem. Quem responde de forma coerente ganha uma área apertada, e quem se contradiz ganha uma área larga, o que é informação e não defeito. A conta mistura o que suas respostas mostram com um ponto de partida de \"não sei nada sobre esta pessoa\", pesando pelo tamanho da amostra: sem isso, quem responde uma única afirmação de um eixo apareceria com margem zero, que é precisão falsa.",
    equilibrio_t: "Como o equilíbrio é garantido",
    equilibrio:
      "Cada eixo tem 8 afirmações: 4 em que concordar puxa para um lado e 4 em que puxa para o outro, com pesos espelhados. As 8 formam 4 pares, e o teste só pergunta pares inteiros e só conta pares inteiros. Assim qualquer subconjunto continua equilibrado, inclusive no modo rápido. Se a escolha fosse feita só por informação, o algoritmo poderia montar um conjunto torto sem querer e trazer o viés de volta pela porta dos fundos.",
    relatorio_t: "Relatório de equilíbrio",
    tabela_t: "Todas as afirmações e seus pesos",
    col_afirmacao: "Afirmação",
    col_eixo: "Eixo",
    col_peso: "Peso",
    col_fonte: "Fonte",
    col_derivacao: "Derivação",
    r_eixo: "Eixo",
    r_itens: "Itens",
    r_neg: "Concordar puxa",
    r_pos: "Concordar puxa",
    r_soma: "Soma dos pesos",
    r_forca: "Força média",
    voltar_sobre: "Ver as fontes e os limites",
  },
  en: {
    intro:
      "Here is the whole calculation: the weights of all 48 statements, where each came from, and how the result is computed. None of it is secret, and that is the difference.",
    eixos_t: "What each axis measures",
    eixos_esquerda_direita:
      "On the chart the horizontal axis appears as left and right, which is how people recognise this dimension and also what the source calls it: the Chapel Hill Expert Survey dimension is named economic left-right. In practice it measures how much of the economic outcome should come from the state and how much from the market. Left is more equality and more state; right is more market and more individual responsibility.",
    conta_t: "How the position is calculated",
    conta:
      "Each answer runs from -2 (strongly disagree) to +2 (strongly agree), with 0 a true neutral that counts for no side. The importance you mark multiplies the weight of the answer: 0.5 for a little, 1 for normal and 1.5 for a lot.",
    formula: "position = sum(answer x weight x importance) / (2 x sum(|weight| x importance))",
    conta2:
      "Dividing by what was actually answered is what keeps an incomplete test from distorting the result. The number runs from -1 to +1 and is shown from -10 to +10.",
    margem_t: "How the margin of error is calculated",
    margem:
      "Each answer, on its own, gives a guess about where you sit on that axis. How much those guesses disagree with each other becomes the margin. Consistent answers earn a tight area; contradictory ones earn a wide area, and that is information rather than a flaw. The calculation blends what your answers show with a starting point of 'I know nothing about this person', weighted by sample size: without that, answering a single question on an axis would show a margin of zero, which is false precision.",
    equilibrio_t: "How balance is guaranteed",
    equilibrio:
      "Each axis has 8 statements: 4 where agreeing pulls one way and 4 where it pulls the other, with mirrored weights. The 8 form 4 pairs, and the adaptive mode only asks whole pairs and only stops at a pair boundary. That keeps any subset of questions balanced, including in quick mode. If selection went by information alone, the algorithm could assemble a lopsided set by accident and let the bias back in through the side door.",
    relatorio_t: "Balance report",
    tabela_t: "Every statement and its weight",
    col_afirmacao: "Statement",
    col_eixo: "Axis",
    col_peso: "Weight",
    col_fonte: "Source",
    col_derivacao: "Derivation",
    r_eixo: "Axis",
    r_itens: "Items",
    r_neg: "Agreeing pulls",
    r_pos: "Agreeing pulls",
    r_soma: "Sum of weights",
    r_forca: "Mean strength",
    voltar_sobre: "See the sources and limits",
  },
};

export default function Metodologia() {
  const { t, lang } = useLang();
  const texto = TEXTO[lang] ?? TEXTO.pt;

  const relatorio = EIXOS.map((eixo) => {
    const itens = TODAS.filter((p) => p.eixo === eixo);
    const neg = itens.filter((p) => p.peso < 0);
    const pos = itens.filter((p) => p.peso > 0);
    const forca = (grupo) =>
      grupo.reduce((s, p) => s + Math.abs(p.peso), 0) / (grupo.length || 1);
    return {
      eixo,
      itens: itens.length,
      neg: neg.length,
      pos: pos.length,
      soma: itens.reduce((s, p) => s + p.peso, 0),
      forca: `${num(lang, forca(neg), 2)} / ${num(lang, forca(pos), 2)}`,
    };
  });

  return (
    <main className="coluna coluna-larga pilha-larga" style={{ paddingBlock: "40px 64px" }}>
      <div className="pilha">
        <h1>{t("metodologia_titulo")}</h1>
        <p style={{ fontSize: "17px" }}>{texto.intro}</p>
      </div>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.eixos_t}</h2>
        <p className="apoio">{texto.eixos_esquerda_direita}</p>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.conta_t}</h2>
        <p className="apoio">{texto.conta}</p>
        <code
          className="cartao"
          style={{ fontSize: "13.5px", overflowX: "auto", display: "block" }}
        >
          {texto.formula}
        </code>
        <p className="apoio">{texto.conta2}</p>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.margem_t}</h2>
        <p className="apoio">{texto.margem}</p>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.equilibrio_t}</h2>
        <p className="apoio">{texto.equilibrio}</p>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.relatorio_t}</h2>
        <div className="rolagem">
          <table>
            <thead>
              <tr>
                <th>{texto.r_eixo}</th>
                <th>{texto.r_itens}</th>
                <th>{texto.r_neg} &darr;</th>
                <th>{texto.r_pos} &uarr;</th>
                <th>{texto.r_soma}</th>
                <th>{texto.r_forca}</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.map((linha) => (
                <tr key={linha.eixo}>
                  <td>{t(`eixo_${linha.eixo}`)}</td>
                  <td>{linha.itens}</td>
                  <td>{linha.neg}</td>
                  <td>{linha.pos}</td>
                  <td>{num(lang, linha.soma, 3)}</td>
                  <td>{linha.forca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.tabela_t}</h2>
        <div className="rolagem">
          <table>
            <thead>
              <tr>
                <th>{texto.col_afirmacao}</th>
                <th>{texto.col_eixo}</th>
                <th>{texto.col_peso}</th>
                <th>{texto.col_fonte}</th>
                <th>{texto.col_derivacao}</th>
              </tr>
            </thead>
            <tbody>
              {TODAS.map((pergunta) => (
                <tr key={pergunta.id}>
                  <td className="texto-longo">{pergunta.texto[lang]}</td>
                  <td>{t(`eixo_${pergunta.eixo}`)}</td>
                  <td>
                    {num(lang, pergunta.peso, 1)}{" "}
                    <span className="fonte-tag">
                      {t(`polo_${pergunta.peso < 0 ? EIXOS_META[pergunta.eixo].neg : EIXOS_META[pergunta.eixo].pos}`)}
                    </span>
                  </td>
                  <td>
                    {pergunta.fonte.instrumento} {pergunta.fonte.item}
                  </td>
                  <td>
                    {pergunta.derivacao === "adaptado"
                      ? t("fonte_adaptado")
                      : t("fonte_construto")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Link to="/sobre" className="botao botao-secundario" style={{ justifySelf: "start" }}>
        {texto.voltar_sobre}
      </Link>
    </main>
  );
}
