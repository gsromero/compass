// O teste em andamento, guardado no navegador.
// Fechar o navegador no meio do teste e reabrir tem que voltar de onde parou:
// e a diferenca entre um questionario que da vontade de terminar e um que da
// vontade de abandonar.

const KEY = "compass.sessao";

/** @returns {{modo: string, respostas: object, fila: string[]} | null} */
export function carregar() {
  try {
    const bruto = localStorage.getItem(KEY);
    if (!bruto) return null;
    const sessao = JSON.parse(bruto);
    if (!sessao?.respostas || typeof sessao.respostas !== "object") return null;
    return sessao;
  } catch {
    // Armazenamento cheio, desligado ou com lixo dentro: melhor comecar do zero
    // do que quebrar a tela inicial.
    return null;
  }
}

export function salvar(sessao) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessao));
  } catch {
    // Nao poder salvar nao pode impedir de responder.
  }
}

export function limpar() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada a fazer */
  }
}

export function quantasRespondidas(sessao) {
  return Object.keys(sessao?.respostas ?? {}).length;
}
