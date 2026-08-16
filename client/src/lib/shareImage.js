// Compartilhar ou salvar um canvas como PNG.
// Portado do BBB (client/src/lib/shareImage.js), sem a parte de Capacitor:
// aqui e so web. O comportamento util e o mesmo: usa a folha de
// compartilhamento nativa quando o navegador aceita arquivo, e cai para
// download quando nao aceita.

function blobDoCanvas(canvas) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, "image/png");
    } catch {
      // Canvas contaminado por imagem de outra origem: nada a compartilhar.
      resolve(null);
    }
  });
}

function baixar(blob, nome) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** True quando da para abrir a folha nativa com o arquivo junto. */
export function compartilhamentoNativoDisponivel() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const teste = new File([new Blob()], "t.png", { type: "image/png" });
    return navigator.canShare({ files: [teste] });
  } catch {
    return false;
  }
}

export async function compartilharCanvasPng(canvas, nome) {
  const blob = await blobDoCanvas(canvas);
  if (!blob) return;

  const arquivo = new File([blob], nome, { type: "image/png" });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return;
    } catch (erro) {
      // Fechou a folha de compartilhamento: fim. Qualquer outro erro vira download.
      if (erro?.name === "AbortError") return;
    }
  }
  baixar(blob, nome);
}

export async function baixarCanvasPng(canvas, nome) {
  const blob = await blobDoCanvas(canvas);
  if (blob) baixar(blob, nome);
}
