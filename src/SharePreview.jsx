import React, { useEffect, useState } from "react";
import { usePreviewZoom } from "./usePreviewZoom.js";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Render the actual files that will be shared, including every exported footer.
export function SharePreview({
  files,
  onReady,
  expanded = false,
  onToggleExpanded,
}) {
  const [page, setPage] = useState(0),
    [pdf, setPDF] = useState(null),
    [source, setSource] = useState(""),
    [original, setOriginal] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const zoom = usePreviewZoom(source, expanded);
  const isPDF = files[0].type === "application/pdf";
  const total = isPDF ? pdf?.numPages || 0 : files.length;

  useEffect(() => {
    let active = true,
      task;
    const url = URL.createObjectURL(files[0]);
    setOriginal(url);
    onReady(false);
    if (isPDF) {
      (async () => {
        const [pdfjs, worker, buffer] = await Promise.all([
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
          files[0].arrayBuffer(),
        ]);
        if (!active) return;
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        task = pdfjs.getDocument({
          data: new Uint8Array(buffer),
          isEvalSupported: false,
        });
        const doc = await task.promise;
        if (active) setPDF(doc);
      })().catch(() => {
        if (active) {
          setError(
            "Não foi possível mostrar o PDF aqui. Pode abri-lo para conferir.",
          );
          setLoading(false);
        }
      });
    }
    return () => {
      active = false;
      URL.revokeObjectURL(url);
      task?.destroy();
    };
  }, [files, isPDF, onReady]);

  useEffect(() => {
    if (isPDF && !pdf) return;
    let active = true,
      render,
      url;
    setLoading(true);
    setError("");
    setSource("");
    onReady(false);
    (async () => {
      if (isPDF) {
        const sheet = await pdf.getPage(page + 1);
        if (!active) return;
        const base = sheet.getViewport({ scale: 1 });
        const viewport = sheet.getViewport({
          scale: Math.min(1600 / base.width, 2200 / base.height),
        });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        render = sheet.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        });
        await render.promise;
        if (!active) return;
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("preview");
        url = URL.createObjectURL(blob);
      } else url = URL.createObjectURL(files[page]);
      if (active) setSource(url);
      else if (url) URL.revokeObjectURL(url);
    })().catch((error) => {
      if (active && error.name !== "RenderingCancelledException") {
        setError(
          "Não foi possível mostrar esta página. Abra o ficheiro para conferir.",
        );
        setLoading(false);
      }
    });
    return () => {
      active = false;
      render?.cancel();
      if (url) URL.revokeObjectURL(url);
    };
  }, [files, isPDF, pdf, page, onReady]);

  const move = (direction) => {
    onReady(false);
    setLoading(true);
    zoom.reset();
    setPage((n) => n + direction);
  };
  return (
    <section
      className="share-preview"
      aria-label="Pré-visualização dos resultados"
    >
      <div className="share-preview-toolbar">
        <strong>Pré-visualização · {isPDF ? "PDF" : "PNG"}</strong>
        <div className="share-preview-tools">
          <button
            type="button"
            aria-label={
              expanded ? "Sair da tela inteira" : "Abrir em tela inteira"
            }
            aria-pressed={expanded}
            onClick={onToggleExpanded}
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            disabled={loading || !!error}
            aria-label={
              zoom.scale > 1
                ? "Ajustar pré-visualização"
                : "Ampliar pré-visualização"
            }
            onClick={zoom.toggle}
          >
            {zoom.scale > 1 ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>
        </div>
      </div>
      <p className="share-preview-touch-hint">
        Duplo toque ou dois dedos para ampliar. Arraste para explorar.{" "}
        <span>{Math.round(zoom.scale * 100)}%</span>
      </p>
      <div
        ref={zoom.frame}
        style={zoom.frameStyle}
        className={`share-preview-frame ${zoom.scale > 1 ? "zoomed" : ""}`}
        tabIndex={0}
        aria-label="Resultado completo; amplie para ver os detalhes"
        aria-busy={loading}
      >
        {loading && <p role="status">A carregar pré-visualização…</p>}
        {source && (
          <img
            ref={zoom.image}
            style={zoom.imageStyle}
            draggable={false}
            src={source}
            alt={`Pré-visualização dos resultados em ${isPDF ? "PDF" : "PNG"}, página ${page + 1}`}
            onLoad={() => {
              zoom.fit();
              setLoading(false);
              onReady(true);
            }}
            onError={() => {
              setLoading(false);
              setError(
                "Não foi possível mostrar a imagem. Abra o ficheiro para conferir.",
              );
            }}
          />
        )}
        {error && <p role="alert">{error}</p>}
      </div>
      <div className="share-preview-navigation">
        <button
          type="button"
          aria-label="Página anterior da pré-visualização"
          disabled={loading || page === 0}
          onClick={() => move(-1)}
        >
          <ChevronLeft size={19} />
        </button>
        <span aria-live="polite">
          {isPDF ? "Página" : "Imagem"} {page + 1} de {total || "…"}
        </span>
        <button
          type="button"
          aria-label="Próxima página da pré-visualização"
          disabled={loading || page + 1 >= total}
          onClick={() => move(1)}
        >
          <ChevronRight size={19} />
        </button>
        <a
          href={isPDF ? original : source || original}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            if (error) onReady(true);
          }}
        >
          <ExternalLink size={15} /> Abrir {isPDF ? "PDF" : "imagem"}
        </a>
      </div>
    </section>
  );
}
