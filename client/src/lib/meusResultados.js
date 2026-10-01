// Os resultados feitos NESTE aparelho, para a tela saber se quem abre um link
// e o dono do resultado ou alguem que recebeu o link.
//
// Fica so no navegador, como a escolha de idioma: nada vai para o servidor nem
// para o banco. Se o dono abrir o proprio link em outro aparelho, ele aparece
// como visitante, e isso nao quebra nada: so muda o convite da tela.

const KEY = "compass.meusResultados";
const MAXIMO = 30;

function ler() {
  try {
    const lista = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/** Guarda o codigo de um resultado que acabou de ser feito aqui. */
export function lembrarResultado(codigo) {
  try {
    const lista = [codigo, ...ler().filter((c) => c !== codigo)].slice(0, MAXIMO);
    localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {
    /* sem armazenamento: o dono so vai ver o convite de visitante */
  }
}

/** True quando o resultado foi feito neste aparelho. */
export function eMeuResultado(codigo) {
  return ler().includes(codigo);
}
