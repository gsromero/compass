// Faixa etaria e genero: a etapa opcional antes da primeira pergunta.
// Nao mudam o resultado da pessoa, so alimentam agregados publicos futuros.
//
// GOTCHA: `functions/api/respostas.js` valida contra a MESMA lista de
// generos, mas nao pode importar daqui (runtime separado, Pages Functions
// nao arrasta o bundle do client). Mudou aqui, muda la tambem.

// Faixas nao precisam de traducao: "16-24" le igual nos dois idiomas.
export const FAIXAS_ETARIAS = ["16-24", "25-34", "35-44", "45-54", "55-64", "65+"];

// Generos tem rotulo traduzido via `demografia_genero_${valor}` no i18n.js.
export const GENEROS = ["feminino", "masculino", "outro", "nao_informado"];
