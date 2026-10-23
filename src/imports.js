// Files are parsed locally. No document content is sent to a server.
export function cleanImportedText(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim().replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, ""))
    .filter(Boolean)
    .join("\n");
}
export async function readDocument(file) {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Escolha um ficheiro com até 10 MB.");
  const ext = file.name.split(".").pop().toLowerCase();
  let text = "";
  if (["txt", "md"].includes(ext)) text = await file.text();
  else if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await (mammoth.default || mammoth).extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    text = result.value;
  } else if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const task = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      isEvalSupported: false,
    });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > 100)
        throw new Error("Importe um PDF com até 100 páginas.");
      for (let n = 1; n <= pdf.numPages; n++) {
        const content = await (await pdf.getPage(n)).getTextContent();
        let previousY = null;
        for (const item of content.items) {
          if (!("str" in item)) continue;
          const y = item.transform[5];
          if (previousY !== null && Math.abs(y - previousY) > 3) text += "\n";
          text += item.str + (item.hasEOL ? "\n" : " ");
          previousY = item.hasEOL ? null : y;
        }
        text += "\n";
      }
    } finally {
      await task.destroy();
    }
  } else throw new Error("Use PDF, DOCX, MD ou TXT.");
  text = cleanImportedText(text);
  if (!text)
    throw new Error(
      "Não foi encontrado texto. Se o PDF é uma imagem digitalizada, copie os nomes manualmente.",
    );
  return text;
}
