import { useLang } from "../lib/lang.jsx";

const MODOS_ORDEM = ["rapido", "padrao", "completo"];

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
