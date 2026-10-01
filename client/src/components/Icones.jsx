/**
 * Icones de linha dos botoes de compartilhar. Traco em currentColor, para
 * herdar a cor do botao; sempre decorativos (o texto do botao diz a acao).
 */
function Icone({ children, ...resto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...resto}
    >
      {children}
    </svg>
  );
}

export const IconeCompartilhar = () => (
  <Icone>
    <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Icone>
);

export const IconeWhatsApp = () => (
  <Icone strokeWidth="1.8">
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
    <path
      d="M9 9.5c.3 2 2.5 4.3 4.6 4.7l1.1-1.2 1.6.8c-.3 1.2-1.3 1.7-2.3 1.6-3-.4-5.5-3-5.9-5.9-.1-1 .5-2 1.6-2.3l.8 1.6z"
      fill="currentColor"
      stroke="none"
    />
  </Icone>
);

export const IconeBaixar = () => (
  <Icone>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icone>
);

export const IconeLink = () => (
  <Icone>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icone>
);

export const IconeCadeado = () => (
  <Icone strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icone>
);
