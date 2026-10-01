import { useLang } from "../lib/lang.jsx";

// O "rapido" saiu da escolha em 2026-10: com 16 perguntas o resultado ficava vago
// demais. Continua em scoring.js para quem tinha um teste rapido em andamento.
const MODOS_ORDEM = ["padrao", "completo"];

/**
 * A duracao do teste em tres partes numa linha so. Usado na pagina inicial e
 * no convite "Agora e a sua vez" de quem abre o resultado de outra pessoa.
 */
export default function SeletorModo({ modo, setModo }) {
  const { t } = useLang();
  return (
    <div className="seletor-modo">
      {MODOS_ORDEM.map((chave) => (
        <button
          key={chave}
          type="button"
          aria-pressed={modo === chave}
          onClick={() => setModo(chave)}
        >
          <strong>{t(`modo_${chave}`)}</strong>
          <span>{t(`modo_${chave}_qtd`)}</span>
          <span>{t(`modo_${chave}_tempo`)}</span>
        </button>
      ))}
    </div>
  );
}
