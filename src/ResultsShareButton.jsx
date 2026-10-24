import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SharePreview } from "./SharePreview.jsx";
import { Share2, X, FileText, Image, Download } from "lucide-react";

async function downloadFiles(files) {
  let blob = files[0],
    name = files[0].name;
  if (files.length > 1) {
    const { zipSync } = await import("fflate");
    const entries = Object.fromEntries(
      await Promise.all(
        files.map(async (file) => [
          file.name,
          new Uint8Array(await file.arrayBuffer()),
        ]),
      ),
    );
    blob = new Blob([zipSync(entries, { level: 0 })], {
      type: "application/zip",
    });
    name = "RandomGroup-resultados.zip";
  }
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ResultsShareButton({ prepare, disabled = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="button secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Share2 size={17} /> Partilhar resultados
      </button>
      {open && (
        <ResultsShareDialog prepare={prepare} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ResultsShareDialog({ prepare, onClose }) {
  const [files, setFiles] = useState([]),
    [format, setFormat] = useState(""),
    [previewReady, setPreviewReady] = useState(false),
    [expanded, setExpanded] = useState(false),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const close = useRef(null);
  const panel = useRef(null),
    expandedNow = useRef(false),
    nativeSession = useRef(false),
    lastNativeExit = useRef(-Infinity);
  const preparedFiles = useRef({});
  const exitExpanded = () => {
    expandedNow.current = false;
    setExpanded(false);
    if (document.fullscreenElement === panel.current)
      document.exitFullscreen?.().catch(() => {});
  };
  const toggleExpanded = () => {
    if (expandedNow.current) {
      exitExpanded();
      return;
    }
    expandedNow.current = true;
    setExpanded(true);
    // The viewport layout also works on phones without the Fullscreen API.
    panel.current
      ?.requestFullscreen?.({ navigationUI: "hide" })
      .then(() => {
        if (
          !expandedNow.current &&
          document.fullscreenElement === panel.current
        )
          document.exitFullscreen?.().catch(() => {});
      })
      .catch(() => {});
  };
  useEffect(() => {
    const root = panel.current;
    const change = () => {
      if (document.fullscreenElement === root) {
        nativeSession.current = true;
      } else if (nativeSession.current) {
        nativeSession.current = false;
        expandedNow.current = false;
        lastNativeExit.current = performance.now();
        setExpanded(false);
      }
    };
    document.addEventListener("fullscreenchange", change);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      expandedNow.current = false;
      if (document.fullscreenElement === root)
        document.exitFullscreen?.().catch(() => {});
    };
  }, []);
  useEffect(() => {
    const previous = document.activeElement,
      overflow = document.body.style.overflow;
    close.current?.focus();
    document.body.style.overflow = "hidden";
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (expandedNow.current) exitExpanded();
        else if (performance.now() - lastNativeExit.current > 300) onClose();
      }
      if (event.key === "Tab") {
        const controls = [
          ...close.current
            .closest("[role=dialog]")
            .querySelectorAll("button,a[href]"),
        ].filter((el) => !el.disabled && el.offsetParent !== null);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const generate = async (nextFormat) => {
    if (busy || (nextFormat === format && files.length)) return;
    setError("");
    if (preparedFiles.current[nextFormat]) {
      setPreviewReady(false);
      setFormat(nextFormat);
      setFiles(preparedFiles.current[nextFormat]);
      return;
    }
    setBusy(nextFormat);
    try {
      const prepared = await prepare(nextFormat);
      preparedFiles.current[nextFormat] = prepared;
      setPreviewReady(false);
      setFormat(nextFormat);
      setFiles(prepared);
    } catch (error) {
      setError(error.message || "Não foi possível preparar os resultados.");
    } finally {
      setBusy("");
    }
  };
  let canShare = false;
  try {
    canShare =
      files.length > 0 &&
      !!navigator.share &&
      !!navigator.canShare?.({ files });
  } catch {
    /* File sharing is not supported in every browser. */
  }
  // This call happens on a separate click, after generation, preserving user activation.
  const share = async () => {
    setError("");
    try {
      await navigator.share({ files, title: "RandomGroup" });
    } catch (error) {
      if (error.name !== "AbortError")
        setError(
          "Não foi possível abrir a partilha. Pode tentar novamente ou descarregar os ficheiros.",
        );
    }
  };
  return createPortal(
    <div
      className={`modal-backdrop ${expanded ? "fullscreen-preview-backdrop" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={panel}
        className={`result-share-modal ${files.length ? "has-preview" : ""} ${expanded ? "preview-fullscreen" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-share-title"
      >
        <button
          className="close-modal"
          ref={close}
          aria-label="Fechar partilha"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 id="result-share-title">Partilhar resultados</h2>
        {!files.length ? (
          <>
            <p>Escolha o formato.</p>
            <div className="share-format-options">
              <button
                className="button secondary"
                disabled={!!busy}
                onClick={() => generate("pdf")}
              >
                <FileText size={22} />{" "}
                {busy === "pdf" ? "A preparar PDF…" : "PDF"}
              </button>
              <button
                className="button secondary"
                disabled={!!busy}
                onClick={() => generate("png")}
              >
                <Image size={22} /> {busy === "png" ? "A preparar PNG…" : "PNG"}
              </button>
            </div>
            {busy && (
              <p role="status">
                A preparar os resultados com logo, QR code e assinatura…
              </p>
            )}
          </>
        ) : (
          <>
            <p className="share-dialog-intro">
              Confira os resultados antes de partilhar.
            </p>
            <div
              className="share-format-switch"
              role="group"
              aria-label="Formato dos resultados"
            >
              {["pdf", "png"].map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={format === option}
                  disabled={!!busy}
                  onClick={() => generate(option)}
                >
                  {option === "pdf" ? (
                    <FileText size={16} />
                  ) : (
                    <Image size={16} />
                  )}
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            {busy && <p role="status">A preparar {busy.toUpperCase()}…</p>}
            <SharePreview
              key={format}
              files={files}
              onReady={setPreviewReady}
              expanded={expanded}
              onToggleExpanded={toggleExpanded}
            />
            {!canShare && (
              <p className="share-file-note">
                Este navegador não permite partilhar ficheiros directamente.
                Descarregue e envie pela aplicação que preferir.
              </p>
            )}
            <div className="share-file-actions">
              {canShare && (
                <button
                  className="button"
                  onClick={share}
                  disabled={!previewReady || !!busy}
                >
                  <Share2 size={17} /> Partilhar ficheiro
                  {files.length > 1 ? "s" : ""}
                </button>
              )}
              <button
                className="button secondary"
                disabled={!!busy}
                onClick={() =>
                  downloadFiles(files).catch(() =>
                    setError("Não foi possível descarregar. Tente novamente."),
                  )
                }
              >
                <Download size={17} /> Descarregar{" "}
                {files[0].type === "application/pdf"
                  ? "PDF"
                  : files.length > 1
                    ? "PNGs (ZIP)"
                    : "PNG"}
              </button>
            </div>
          </>
        )}
        {error && (
          <p className="share-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>,
    document.body,
  );
}
