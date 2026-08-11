-- Respostas anonimas, so para os numeros de comparacao que aparecem no
-- resultado (percentil, mancha no grafico e "onde voce destoa").
--
-- O que NAO existe aqui, de proposito: IP, user agent, conta, cookie, ou
-- qualquer identificador que volte na proxima visita. Nao da para ligar duas
-- respostas a mesma pessoa, e isso e a promessa que o site faz na tela.

CREATE TABLE respostas (
  id           TEXT PRIMARY KEY,
  criado_em    INTEGER NOT NULL,
  idioma       TEXT NOT NULL,
  versao       INTEGER NOT NULL,
  quadrante    TEXT NOT NULL,
  economico    REAL NOT NULL,
  autoridade   REAL NOT NULL,
  fronteiras   REAL NOT NULL,
  costumes     REAL NOT NULL,
  ecologia     REAL NOT NULL,
  povo         REAL NOT NULL
);

CREATE INDEX idx_respostas_versao ON respostas (versao, quadrante);

-- Uma linha por afirmacao respondida. Existe para calcular a media por
-- pergunta DENTRO de cada quadrante, que e o que alimenta o "onde voce
-- destoa", e e tambem o que vai permitir a analise fatorial quando houver
-- volume. Gravada em lote, nunca em laco: sao ate 48 linhas por resposta.
CREATE TABLE itens (
  resposta_id  TEXT NOT NULL,
  pergunta     TEXT NOT NULL,
  r            INTEGER NOT NULL,
  quadrante    TEXT NOT NULL,
  versao       INTEGER NOT NULL,
  PRIMARY KEY (resposta_id, pergunta)
);

CREATE INDEX idx_itens_agregado ON itens (versao, quadrante, pergunta);
