// Verificacao contra robo (Cloudflare Turnstile), feita UMA vez, no fim do
// teste, antes de a resposta entrar nos numeros da populacao.
//
// Quase sempre invisivel (`interaction-only`): so aparece uma caixinha para
// quem a Cloudflare achar suspeito. Falhar aqui nao tira o resultado de
// ninguem; so a resposta deixa de contar nos agregados.
//
// O script vem da Cloudflare e so carrega na tela de resultado, e so quando ha
// resposta para enviar. Quem abre um link compartilhado nao carrega nada.

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// A chave de producao e publica (vai no HTML de qualquer jeito). A de teste e
// a chave oficial da Cloudflare que sempre passa: localhost nao esta cadastrado
// no widget de producao, e o `.dev.vars` local usa o segredo de teste que faz
// par com ela.
const CHAVE_PRODUCAO = "0x4AAAAAAFLPCNBquR8oO3IU";
const CHAVE_TESTE = "1x00000000000000000000AA";

// O mesmo nome que functions/api/respostas.js confere.
export const ACAO = "resposta";

function chaveDoSite() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" ? CHAVE_TESTE : CHAVE_PRODUCAO;
}

let carregando = null;

function carregarScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  carregando ??= new Promise((ok, falha) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? ok(window.turnstile) : falha(new Error("turnstile")));
    script.onerror = () => {
      // Bloqueador de anuncio ou rede fora: deixa tentar de novo depois.
      carregando = null;
      falha(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return carregando;
}

/**
 * Pede o comprovante de que e uma pessoa. Resolve com o token, ou rejeita se a
 * verificacao nao der certo (script bloqueado, desafio recusado, erro de rede).
 * @param {HTMLElement} container onde a caixinha aparece, se precisar aparecer
 * @param {"pt"|"en"} lang
 */
export async function verificarPessoa(container, lang) {
  const turnstile = await carregarScript();
  return new Promise((ok, falha) => {
    turnstile.render(container, {
      sitekey: chaveDoSite(),
      action: ACAO,
      appearance: "interaction-only",
      language: lang === "pt" ? "pt-br" : "en",
      callback: (token) => ok(token),
      "error-callback": () => falha(new Error("turnstile")),
      "expired-callback": () => falha(new Error("turnstile")),
    });
  });
}
