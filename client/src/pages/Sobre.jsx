import { Link } from "react-router-dom";
import { useLang } from "../lib/lang.jsx";
import { TODAS } from "../lib/questions.js";

// As referencias vivem aqui, na tela, e nao so num documento do repositorio.
// O site promete que da para conferir de onde veio cada pergunta, e promessa
// que so existe no README nao vale nada para quem esta respondendo.
const REFERENCIAS = [
  {
    id: "wvs",
    nome: "World Values Survey",
    url: "https://www.worldvaluessurvey.org/documents/WVS-8_QUESTIONNAIRE_V11_FINAL_Jan_2024.pdf",
    categoria: "A",
    o_que: {
      pt: "A maior pesquisa comparativa de valores do mundo, rodando desde 1981. As perguntas daqui vieram do questionario mestre da Onda 8, lido item por item. Os codigos Q___ que aparecem no seu resultado sao os desse documento.",
      en: "The largest comparative values survey in the world, running since 1981. The questions here come from the Wave 8 master questionnaire, read item by item. The Q___ codes shown in your result are from that document.",
    },
  },
  {
    id: "issp",
    nome: "ISSP National Identity",
    url: "https://issp.org/data-download/by-topic/",
    categoria: "B",
    o_que: {
      pt: "Modulo do International Social Survey Programme sobre identidade nacional, aplicado em 1995, 2003, 2013 e 2023. Cobre nacionalismo, protecionismo e cooperacao entre paises.",
      en: "The International Social Survey Programme module on national identity, fielded in 1995, 2003, 2013 and 2023. It covers nationalism, protectionism and cooperation between countries.",
    },
  },
  {
    id: "nep",
    nome: "New Ecological Paradigm",
    url: "https://www.researchgate.net/publication/279892834_Measuring_Endorsement_of_the_New_Ecological_Paradigm_A_Revised_NEP_Scale",
    categoria: "B",
    o_que: {
      pt: "A medida de preocupacao ambiental mais usada no mundo, de Dunlap e colegas. Cada pergunta do eixo Ecologia corresponde a uma das cinco facetas dela.",
      en: "The most widely used measure of environmental concern, by Dunlap and colleagues. Each question on the Ecology axis maps to one of its five facets.",
    },
  },
  {
    id: "ches",
    nome: "Chapel Hill Expert Survey",
    url: "https://hooghe.web.unc.edu/wp-content/uploads/sites/11492/2021/11/2021_Jolly-et-al_-Chapel-Hill-Expert-Survey-trend-file-1999-2019.pdf",
    categoria: "eixos",
    o_que: {
      pt: "O padrao para descrever espaco politico em democracias, com a dimensao economica esquerda-direita e a dimensao GAL-TAN. Definiu quais eixos existem aqui.",
      en: "The standard for describing political space in democracies, with the economic left-right dimension and the GAL-TAN dimension. It defined which axes exist here.",
    },
  },
  {
    id: "vsa",
    nome: "Very Short Authoritarianism Scale",
    url: "https://jspp.psychopen.eu/index.php/jspp/article/view/5047",
    categoria: "eixos",
    o_que: {
      pt: "Versao curta e validada da escala de autoritarismo de Altemeyer, por Bizumic e Duckitt. Vale mencao especial: ela e balanceada por direcao de redacao por construcao, que e exatamente o principio adotado neste site.",
      en: "A short, validated version of Altemeyer's authoritarianism scale, by Bizumic and Duckitt. Worth a special mention: it is balanced by wording direction by design, which is exactly the principle this site adopts.",
    },
  },
  {
    id: "beaton",
    nome: "Beaton et al., Cross-Cultural Adaptation",
    url: "https://lab.research.sickkids.ca/pscoreprogram/wp-content/uploads/sites/72/2017/12/Beaton2000-GuidelinesCrossCulturalAdaptation.pdf",
    categoria: "metodo",
    o_que: {
      pt: "O guia de adaptacao de questionarios entre culturas. Traducao literal nao basta: o que precisa ser preservado e a equivalencia conceitual.",
      en: "The guide to adapting questionnaires across cultures. Literal translation is not enough: what must be preserved is conceptual equivalence.",
    },
  },
];

const TEXTO = {
  pt: {
    intro:
      "O Compass e um teste politico de dois eixos, no espirito do Political Compass, com tres diferencas que sao a razao de ele existir.",
    d1_t: "As perguntas vem de instrumentos de pesquisa reais",
    d1: "Cada uma das 48 afirmacoes deriva de um item de pesquisa academica, com o instrumento e o codigo do item registrados e mostrados no seu resultado. O Political Compass nunca publicou de onde vem as afirmacoes dele nem quanto cada uma pesa.",
    d2_t: "O equilibrio e provado por teste automatico",
    d2: "Das 62 afirmacoes do Political Compass, 36 sao codificadas para a direita e 20 para a esquerda. Como as pessoas tendem a concordar com o que leem, quem responde no automatico e deslocado pela construcao do teste. Aqui existe uma bateria de testes que impede o site de ir ao ar se isso acontecer, e o principal deles e direto: quem concorda com todas as afirmacoes tem que cair no centro do grafico.",
    d3_t: "O resultado vem com margem de erro",
    d3: "Voce recebe uma area, nao um ponto com duas casas decimais. A area cresce quando suas respostas se contradizem e encolhe quando elas se sustentam, e e a mesma conta que decide quando o teste pode parar de perguntar.",
    fontes_t: "De onde vem as perguntas",
    fontes_i:
      "Duas categorias, porque nem todo instrumento pode ser reusado do mesmo jeito. Da categoria A a afirmacao e adaptada do item original, com citacao. Da categoria B eu uso so o construto e escrevo a afirmacao com minhas palavras, porque o licenciamento dessas escalas para uso aberto e ambiguo.",
    cat_A: "Item adaptado, com citacao",
    cat_B: "Redacao propria, construto citado",
    cat_eixos: "Definiu os eixos",
    cat_metodo: "Metodo",
    limites_t: "O que este teste nao e",
    limites: [
      "Os itens de origem usam formatos variados: escala de 1 a 10 entre duas frases, escolha forcada, concordancia de 4 pontos. Aqui tudo virou uma escala unica de 5 pontos. A derivacao e rastreavel, mas o resultado nao e o instrumento original e nao herda a validacao dele.",
      "A redacao em ingles foi conferida no questionario oficial. A redacao em portugues e adaptacao minha, seguindo equivalencia conceitual, porque os questionarios nacionais sao distribuidos junto dos microdados e nao como documentos avulsos.",
      "Onde fica o zero e decisao normativa, nao fato. Aqui o zero e o meio da escala de resposta, e nao a media de quem respondeu, para o centro nao andar conforme o publico do site muda.",
      "Os testes provam equilibrio estrutural, nao equilibrio de tom. Nenhuma maquina detecta uma afirmacao escrita de um jeito que soa mais razoavel de um lado.",
      "Ainda nao ha validacao empirica. Provar que as perguntas medem o que dizem medir exige respostas reais e analise fatorial.",
    ],
    privacidade_t: "Privacidade",
    privacidade:
      "Nada identifica quem respondeu: sem IP, sem navegador, sem conta, sem identificador que volte na proxima visita. Fica guardado so o vetor de respostas solto, usado para os numeros de comparacao. O link do seu resultado carrega o resultado inteiro codificado na propria URL, e por isso funciona sem consultar banco nenhum.",
    ver_metodologia: "Ver a conta completa",
  },
  en: {
    intro:
      "Compass is a two-axis political test in the spirit of the Political Compass, with three differences that are its reason to exist.",
    d1_t: "The questions come from real research instruments",
    d1: "Each of the 48 statements derives from an academic research item, with the instrument and item code recorded and shown in your result. The Political Compass never published where its statements come from or how much each one weighs.",
    d2_t: "The balance is proven by automated tests",
    d2: "Of the Political Compass's 62 statements, 36 are coded to the right and 20 to the left. Since people tend to agree with what they read, anyone answering on autopilot is displaced by the construction of the test. Here a test suite blocks the site from shipping if that happens, and the main one is blunt: anyone who agrees with every statement must land at the center of the chart.",
    d3_t: "The result comes with a margin of error",
    d3: "You get an area, not a dot with two decimal places. The area grows when your answers contradict each other and shrinks when they hold together, and it is the same calculation that decides when the test can stop asking.",
    fontes_t: "Where the questions come from",
    fontes_i:
      "Two categories, because not every instrument can be reused the same way. From category A the statement is adapted from the original item, with citation. From category B I use only the construct and write the statement in my own words, because the licensing of those scales for open use is ambiguous.",
    cat_A: "Item adapted, with citation",
    cat_B: "Own wording, construct cited",
    cat_eixos: "Defined the axes",
    cat_metodo: "Method",
    limites_t: "What this test is not",
    limites: [
      "The source items use varied formats: a 1 to 10 scale between two statements, forced choice, 4-point agreement. Here everything became a single 5-point scale. The derivation is traceable, but the result is not the original instrument and does not inherit its validation.",
      "The English wording was checked against the official questionnaire. The Portuguese wording is my own adaptation, following conceptual equivalence, because national questionnaires ship with the microdata rather than as standalone documents.",
      "Where zero sits is a normative decision, not a fact. Here zero is the middle of the response scale, not the average of respondents, so the center does not drift as the site's audience changes.",
      "The tests prove structural balance, not balance of tone. No machine detects a statement worded so that it sounds more reasonable on one side.",
      "There is no empirical validation yet. Proving the questions measure what they claim requires real answers and factor analysis.",
    ],
    privacidade_t: "Privacy",
    privacidade:
      "Nothing identifies who answered: no IP, no browser, no account, no identifier that comes back on the next visit. Only the bare answer vector is stored, used for the comparison numbers. Your result link carries the entire result encoded in the URL itself, which is why it works without consulting any database.",
    ver_metodologia: "See the full scoring",
  },
};

export default function Sobre() {
  const { t, lang, pick } = useLang();
  const texto = TEXTO[lang] ?? TEXTO.pt;

  const contagem = TODAS.reduce((acc, p) => {
    acc[p.fonte.instrumento] = (acc[p.fonte.instrumento] ?? 0) + 1;
    return acc;
  }, {});

  const rotuloCategoria = {
    A: texto.cat_A,
    B: texto.cat_B,
    eixos: texto.cat_eixos,
    metodo: texto.cat_metodo,
  };

  return (
    <main className="coluna pilha-larga" style={{ paddingBlock: "40px 64px" }}>
      <div className="pilha">
        <h1>{t("sobre_titulo")}</h1>
        <p style={{ fontSize: "17px" }}>{texto.intro}</p>
      </div>

      <div className="pilha">
        {[1, 2, 3].map((n) => (
          <div key={n} className="pilha" style={{ gap: "4px" }}>
            <h2 style={{ fontSize: "18px" }}>{texto[`d${n}_t`]}</h2>
            <p className="apoio">{texto[`d${n}`]}</p>
          </div>
        ))}
      </div>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.fontes_t}</h2>
        <p className="apoio">{texto.fontes_i}</p>
        <div className="pilha">
          {REFERENCIAS.map((ref) => (
            <div key={ref.id} className="cartao pilha" style={{ gap: "6px" }}>
              <div className="linha" style={{ justifyContent: "space-between" }}>
                <a href={ref.url} target="_blank" rel="noreferrer">
                  <strong style={{ fontSize: "16px" }}>{ref.nome}</strong>
                </a>
                <span className="fonte-tag">
                  {rotuloCategoria[ref.categoria]}
                  {contagem[ref.nome] ? ` · ${contagem[ref.nome]}` : ""}
                </span>
              </div>
              <p className="apoio">{pick(ref.o_que)}</p>
            </div>
          ))}
        </div>
        <Link to="/metodologia" className="botao botao-secundario" style={{ justifySelf: "start" }}>
          {texto.ver_metodologia}
        </Link>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.limites_t}</h2>
        <div className="pilha">
          {texto.limites.map((limite, i) => (
            <p key={i} className="apoio">
              {limite}
            </p>
          ))}
        </div>
      </section>

      <section className="pilha">
        <h2 style={{ fontSize: "20px" }}>{texto.privacidade_t}</h2>
        <p className="apoio">{texto.privacidade}</p>
      </section>
    </main>
  );
}
