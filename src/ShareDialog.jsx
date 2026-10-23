import React, { useEffect, useRef, useState } from "react";
import {
  X,
  LockKeyhole,
  Copy,
  Download,
  Upload,
  ArrowRight,
} from "lucide-react";
import {
  protectTournament,
  unlockTournament,
  accessLink,
  accessPayload,
} from "./access.js";
import { brandedQRCode } from "./branded-qr.js";
function saveBlob(value, name, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ShareDialog({
  tournament,
  payload: initialPayload,
  restore = false,
  onClose,
  onLoad,
  notify,
}) {
  const [password, setPassword] = useState(""),
    [repeat, setRepeat] = useState(""),
    [input, setInput] = useState("");
  const [payload, setPayload] = useState(initialPayload || ""),
    [link, setLink] = useState(""),
    [qr, setQr] = useState(""),
    [busy, setBusy] = useState(false),
    [qrUnavailable, setQrUnavailable] = useState(false),
    [error, setError] = useState("");
  const close = useRef(null),
    file = useRef(null),
    isRestore = restore || !!initialPayload;
  useEffect(() => {
    const previous = document.activeElement;
    close.current?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const controls = [
          ...close.current
            .closest("[role=dialog]")
            .querySelectorAll("button,input,a[href]"),
        ].filter((el) => !el.disabled && el.offsetParent !== null);
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isRestore) {
        const encoded = payload || accessPayload(input);
        const incoming = await unlockTournament(encoded, password);
        onLoad(incoming);
        onClose();
        notify("Torneio aberto. Pode continuar a editar esta cópia.");
      } else {
        if (password !== repeat) throw new Error("As senhas não coincidem.");
        const encoded = await protectTournament(tournament, password);
        setPayload(encoded);
        const url = accessLink(encoded);
        setLink(url);
        setPassword("");
        setRepeat("");
        try {
          setQr(await brandedQRCode(url));
        } catch {
          setQrUnavailable(true);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="access-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-title"
      >
        <button
          className="close-modal"
          ref={close}
          aria-label="Fechar acesso"
          onClick={onClose}
        >
          <X />
        </button>
        <span className="access-symbol">
          <LockKeyhole size={25} />
        </span>
        <h2 id="access-title">
          {isRestore
            ? "Voltar ao torneio"
            : link
              ? "O acesso está pronto."
              : "Leve o torneio consigo."}
        </h2>
        {!link ? (
          <form onSubmit={submit}>
            {isRestore && !payload && (
              <>
                <label className="field">
                  <span>Link de acesso</span>
                  <textarea
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Cole aqui o link do RandomGroup"
                  />
                </label>
                <input
                  hidden
                  ref={file}
                  type="file"
                  accept=".rg"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      if (f.size > 400_000)
                        throw new Error("O ficheiro é demasiado grande.");
                      setPayload(accessPayload(await f.text()));
                      setInput(f.name);
                      setError("");
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                />
                <button
                  type="button"
                  className="text-button"
                  onClick={() => file.current.click()}
                >
                  <Upload size={16} /> Abrir ficheiro de acesso
                </button>
              </>
            )}
            <p>
              {isRestore
                ? "Introduza a senha definida ao gerar este acesso."
                : "Defina uma senha para abrir esta cópia noutro dispositivo. Guarde o link ou QR code e a senha."}
            </p>
            <label className="field">
              <span>{isRestore ? "Senha" : "Criar senha"}</span>
              <input
                type="password"
                autoComplete={isRestore ? "current-password" : "new-password"}
                minLength={isRestore ? undefined : 8}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isRestore ? "A senha do acesso" : "Pelo menos 8 caracteres"
                }
              />
            </label>
            {!isRestore && (
              <label className="field">
                <span>Repetir senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  placeholder="Confirme a senha"
                />
              </label>
            )}
            {isRestore && (
              <small className="access-note">
                Ao abrir, esta cópia substitui o torneio guardado neste
                navegador.
              </small>
            )}
            {error && (
              <p className="access-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? "A preparar…"
                : isRestore
                  ? "Abrir e editar"
                  : "Gerar acesso"}
              <ArrowRight size={17} />
            </button>
          </form>
        ) : (
          <>
            {qr && (
              <img
                className="access-qr"
                src={qr}
                width="240"
                height="240"
                alt="QR code do acesso ao torneio"
              />
            )}
            {qrUnavailable && (
              <p>
                O QR code não está disponível para esta cópia. Use o link ou
                guarde o ficheiro de acesso.
              </p>
            )}
            {["localhost", "127.0.0.1", "[::1]"].includes(
              window.location.hostname,
            ) && (
              <p className="access-note">
                Este link usa um endereço local. Para partilhar entre
                dispositivos, gere o acesso no site publicado.
              </p>
            )}
            <label className="field">
              <span>Link protegido por senha</span>
              <input readOnly value={link} onFocus={(e) => e.target.select()} />
            </label>
            <div className="access-actions">
              <button
                className="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    notify("Link copiado. Partilhe a senha separadamente.");
                  } catch {
                    notify("Seleccione o link para o copiar.");
                  }
                }}
              >
                <Copy size={16} /> Copiar link
              </button>
              {qr && (
                <a
                  className="button secondary"
                  href={qr}
                  download="RandomGroup-QR.png"
                >
                  <Download size={16} /> QR code
                </a>
              )}
              <button
                className="text-button"
                onClick={() =>
                  saveBlob(`RG1.${payload}`, "RandomGroup-acesso.rg")
                }
              >
                <Download size={16} /> Guardar acesso
              </button>
            </div>
          </>
        )}
        <p className="access-note">
          Cada acesso guarda uma cópia dos resultados actuais. Alterações
          posteriores precisam de um novo link; não há sincronização entre
          dispositivos. A senha protege o acesso partilhado, não bloqueia a
          cópia local.
        </p>
      </section>
    </div>
  );
}
