-- Faixa etaria e genero: colunas OPCIONAIS, adicionadas depois do lancamento.
-- NULL quando a pessoa pula a etapa (o padrao). Nao mudam o resultado de
-- ninguem, so enriquecem os agregados publicos por faixa etaria e genero.
-- Continuam fora daqui: nome, data de nascimento, IP, ou qualquer coisa que
-- volte para a mesma pessoa.

ALTER TABLE respostas ADD COLUMN faixa_etaria TEXT;
ALTER TABLE respostas ADD COLUMN genero TEXT;
