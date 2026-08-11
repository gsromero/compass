// A versao do banco de perguntas que os agregados devem considerar.
//
// GOTCHA: este numero precisa ser o mesmo do campo `versao` em
// client/src/data/questions.json. Nao da para importar o JSON do client aqui
// sem arrastar o bundle do front para dentro das Functions, entao a sincronia e
// manual. Mudou la, muda aqui.
//
// Por que filtrar: respostas de versoes diferentes nao sao comparaveis.
//   v1 -> v2: o valor 0 deixou de significar "sou moderado" (que entrava na
//             conta como posicao central) e passou a significar "nao sei".
//   v2 -> v3: as 48 afirmacoes foram reescritas. Mesma medida, outra redacao,
//             e redacao diferente muda a resposta das pessoas.
// Somar populacoes de versoes diferentes misturaria coisas medidas com
// reguas diferentes.
//
// Os indices de migrations/0001_init.sql ja tem `versao` como primeira coluna,
// justamente para este filtro.
export const VERSAO = 3;
