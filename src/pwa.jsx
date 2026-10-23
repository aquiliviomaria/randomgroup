import React, { useEffect, useState } from "react";
import { Download, RefreshCw, Share, X, Smartphone } from "lucide-react";
import { registerSW } from "virtual:pwa-register";

export function PWAControls() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      !!navigator.standalone,
  );
  const [showInstall, setShowInstall] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [update, setUpdate] = useState(null);
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  useEffect(() => {
    if (!showInstall) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowInstall(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showInstall]);
  useEffect(() => {
    const welcome = setTimeout(() => setShowInstall(true), 1000);
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    let alive = true;
    const applyUpdate = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (alive) setUpdate(() => () => applyUpdate(true));
      },
      onRegisterError(error) {
        console.warn("PWA indisponível:", error);
      },
    });
    return () => {
      alive = false;
      clearTimeout(welcome);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const install = async () => {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      setInstallPrompt(null);
      setShowInstall(false);
      if (result.outcome === "accepted") setInstalled(true);
    } catch {
      setShowHelp(true);
    } finally {
      setInstalling(false);
    }
  };
  return (
    <>
      {!installed && showInstall && !update && (
        <section
          className="install-notice"
          role="dialog"
          aria-labelledby="install-notice-title"
          aria-describedby="install-notice-description"
        >
          <button
            className="install-notice-close"
            aria-label="Fechar aviso de instalação"
            onClick={() => setShowInstall(false)}
          >
            <X size={18} />
          </button>
          <div className="install-notice-icon">
            <Smartphone size={27} />
          </div>
          <div className="install-notice-content">
            <h2 id="install-notice-title">Leve o RandomGroup consigo.</h2>
            <p id="install-notice-description">
              Instale e abra num toque, mesmo offline.
            </p>
            {showHelp ? (
              <p className="install-help">
                {isIOS ? (
                  <>
                    <Share size={16} /> No Safari, toque em{" "}
                    <strong>Partilhar</strong> →{" "}
                    <strong>Adicionar ao ecrã principal</strong>.
                  </>
                ) : (
                  <>
                    No Chrome ou Edge, abra o menu do navegador e procure{" "}
                    <strong>Instalar aplicação</strong> ou{" "}
                    <strong>Adicionar ao ecrã principal</strong>, quando
                    disponível.
                  </>
                )}
              </p>
            ) : (
              <div className="install-notice-actions">
                <button
                  className="button"
                  onClick={install}
                  disabled={installing}
                >
                  <Download size={16} />{" "}
                  {installing ? "A instalar…" : "Instalar"}
                </button>
                <button
                  className="text-button"
                  onClick={() => setShowInstall(false)}
                >
                  Agora não
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {update && (
        <div className="pwa-message" role="status">
          <RefreshCw size={22} />
          <span>Há uma nova versão do RandomGroup.</span>
          <button className="text-button" onClick={update}>
            Actualizar
          </button>
          <button
            aria-label="Actualizar mais tarde"
            onClick={() => setUpdate(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
