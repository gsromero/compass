// Gera client/src/data/partidos-bls.json a partir dos dados brutos do
// Brazilian Legislative Surveys (rodada de 2021).
//
// Os dados brutos NAO ficam no repositorio (dados-bls/ esta no .gitignore):
// o download pede cadastro na Harvard Dataverse, e o termo de uso proibe
// expor respostas individuais. So as medias por partido entram no site.
//
// Para refazer a conta: baixe BLS9_full.tab em
// https://doi.org/10.7910/DVN/WM9IZ8, ponha em dados-bls/ e rode
//   node scripts/partidos-bls.mjs

import fs from "node:fs";

const ENTRADA = "dados-bls/BLS9_full.tab";
const SAIDA = "client/src/data/partidos-bls.json";
const RODADA = "2021";

// Abaixo disto a media e instavel e, com uma ou duas notas, vira a resposta de
// uma pessoa so, o que o termo de uso da pesquisa proibe expor.
const MINIMO = 10;

// Variavel da pesquisa -> sigla. Presidentes e a autoavaliacao (lrclass) ficam
// de fora: esta pagina e so de partidos.
const PARTIDOS = {
  lrpsol: "PSOL", lrpcdob: "PCdoB", lrpt: "PT", lrpsb: "PSB", lrpdt: "PDT", lrpv: "PV",
  lrrede: "Rede", lrpros: "PROS", lrcid: "Cidadania", lrmdb: "MDB", lrpsdb: "PSDB",
  lrsd: "Solidariedade", lrpsd: "PSD", lrpode: "Podemos", lrdem: "DEM", lrptb: "PTB",
  lrpl: "PL", lrpp_ppb: "PP", lrrep: "Republicanos", lrpsc: "PSC", lrnovo: "Novo", lrpsl: "PSL",
};

// O que aconteceu com cada sigla depois de 2021. Conferido no TSE:
// Uniao Brasil (fev/2022), PROS->Solidariedade (fev/2023), PSC->Podemos
// (jun/2023), PTB+Patriota->PRD (nov/2023).
const HOJE = {
  DEM: "União Brasil", PSL: "União Brasil", PTB: "PRD", PSC: "Podemos", PROS: "Solidariedade",
};

const [cabecalho, ...linhas] = fs.readFileSync(ENTRADA, "utf8").trim().split("\n");
const colunas = cabecalho.split("\t");
const indice = (nome) => colunas.indexOf(nome);
const daRodada = linhas.map((l) => l.split("\t")).filter((c) => c[indice("wave")] === RODADA);

const partidos = [];
const fora = [];
for (const [variavel, sigla] of Object.entries(PARTIDOS)) {
  const notas = daRodada
    .map((c) => Number(c[indice(variavel)]))
    .filter((x) => Number.isFinite(x) && x >= 1 && x <= 10);
  const n = notas.length;
  if (n < MINIMO) {
    fora.push({ sigla, n });
    continue;
  }
  const media = notas.reduce((s, x) => s + x, 0) / n;
  const dp = Math.sqrt(notas.reduce((s, x) => s + (x - media) ** 2, 0) / (n - 1));
  partidos.push({
    sigla,
    n,
    media: Number(media.toFixed(2)),
    // Intervalo de 95% da media.
    margem: Number(((1.96 * dp) / Math.sqrt(n)).toFixed(2)),
    ...(HOJE[sigla] ? { hoje: HOJE[sigla] } : {}),
  });
}
partidos.sort((a, b) => a.media - b.media);

const saida = {
  fonte: {
    citacao:
      "Zucco, Cesar (2023). Brazilian Legislative Surveys (Waves 1-9, 1990-2021). Harvard Dataverse.",
    doi: "10.7910/DVN/WM9IZ8",
    coordenacao: "Timothy Power e Cesar Zucco",
    rodada: Number(RODADA),
    respondentes: daRodada.length,
    pergunta: "Ideological placement of each party. Using a scale from 1 (more Left) to 10 (more Right)",
  },
  minimo: MINIMO,
  partidos,
  fora,
};
fs.writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n");
console.log(`${partidos.length} partidos, ${fora.length} de fora, ${daRodada.length} respondentes`);
