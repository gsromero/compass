# Compass — design system (fonte de verdade de UI)

> **Este arquivo ainda é um esqueleto.** A identidade visual será desenhada na Fase 2, publicada
> como mockup em Artifact, e só depois da aprovação do dono é que vira código e vira este
> documento de verdade.
>
> Enquanto isso: **não escrever CSS novo neste projeto.** Não existe token aprovado para usar, e
> cor à mão é exatamente o que este arquivo existe para impedir.

## O que já está decidido

- **Tema claro e escuro.** Diferente do vintage (que é só escuro por decisão de produto), aqui a
  pessoa pode estar respondendo em qualquer contexto, e o resultado vai ser compartilhado.
- **Nenhuma fonte baixada da internet.** O site tem que funcionar sem depender de fora.
- **Nenhuma biblioteca de UI.** Gráficos em SVG escrito à mão, animação em CSS, card em Canvas 2D.
- **Cor não pode carregar significado político.** Vermelho e azul, verde e amarelo, todos já têm
  leitura partidária pronta no Brasil e nos EUA. A paleta dos quadrantes precisa ser escolhida
  para **não** sugerir que um lado é o certo: mesma saturação, mesmo peso visual, nenhum quadrante
  mais bonito que o outro. Isso é requisito de produto, não gosto.
- **Tudo respeita `prefers-reduced-motion`.**
- **Sem travessão (em dash)** em texto de interface, em nenhum idioma.

## A ser definido na Fase 2

- Paleta e tokens em `client/src/index.css`
- Tipografia e escala
- O cartão de pergunta, que é a tela mais vista do site
- A bússola: grade, rótulos dos eixos, ponto e elipse
- As barras dos eixos secundários
- Os layouts do card social
- Estados de carregando, erro e "ainda coletando respostas"
