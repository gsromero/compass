// A versao do banco de perguntas que os agregados devem considerar.
//
// GOTCHA: este numero precisa ser o mesmo do campo `versao` em
// client/src/data/questions.json. Nao da para importar o JSON do client aqui
// sem arrastar o bundle do front para dentro das Functions, entao a sincronia e
// manual. Mudou la, muda aqui.
//
// Por que filtrar: respostas de versoes diferentes nao sao comparaveis. Na
// versao 1 o valor 0 significava "sou moderado" e entrava na conta como
// posicao central; na 2 ele significa "nao sei" e nao entra. Somar as duas
// populacoes misturaria coisas que foram medidas com reguas diferentes.
//
// Os indices de migrations/0001_init.sql ja tem `versao` como primeira coluna,
// justamente para este filtro.
export const VERSAO = 2;
