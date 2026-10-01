-- Por onde cada resposta foi dada: 'arrasto' (cartao arrastado), 'botao'
-- (toque ou clique num botao, nos dois modos) ou 'teclado' (teclas 1 a 4).
--
-- Existe para medir uma suspeita: o arrasto pode produzir respostas mais
-- extremas do que o toque, porque a forca vem da distancia do gesto. Se
-- produzir, a propria interface empurra o resultado, e isso precisa aparecer
-- nos dados. NULL nas respostas anteriores a esta coluna. Nao identifica
-- ninguem: e o mesmo tipo de informacao que o idioma.

ALTER TABLE itens ADD COLUMN via TEXT;
