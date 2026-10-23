import React, { useEffect, useState } from "react";
import { Download, RefreshCw, Share, X } from "lucide-react";
import { registerSW } from "virtual:pwa-register";

export function PWAControls() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      !!navigator.standalone,
  );
  const [iosHelp, setIosHelp] = useState(false);
  const [update, setUpdate] = useState(null);
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  useEffect(() => {
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
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const install = async () => {
    if (!installPrompt) {
      setIosHelp(true);
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (result.outcome === "accepted") setInstalled(true);
  };
  return (
    <>
      {!installed && (installPrompt || isIOS) && (
        <button
          className="install-button"
          aria-label="Instalar"
          title="Instalar RandomGroup"
          onClick={install}
        >
          <Download size={18} />
          <span>Instalar</span>
        </button>
      )}
      {iosHelp && (
        <div className="pwa-message" role="status">
          <Share size={22} />
          <span>
            No Safari, toque em <strong>Partilhar</strong> e depois em{" "}
            <strong>Adicionar ao ecrã principal</strong>.
          </span>
          <button
            aria-label="Fechar instruções"
            onClick={() => setIosHelp(false)}
          >
            <X size={18} />
          </button>
        </div>
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
