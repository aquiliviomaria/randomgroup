import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { brandedQRCode, APP_URL } from "./branded-qr.js";
export function AppQRCode() {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let active = true;
    brandedQRCode(APP_URL)
      .then((image) => {
        if (active) setQr(image);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="app-qr-card">
      {qr && (
        <img
          src={qr}
          width="260"
          height="260"
          alt="QR code do RandomGroup com a marca ao centro"
        />
      )}
      <a href={APP_URL} target="_blank" rel="noreferrer">
        randomgroup.vercel.app
      </a>
      {qr && (
        <a
          className="button secondary"
          href={qr}
          download="RandomGroup-app-QR.png"
        >
          <Download size={17} /> Descarregar QR code
        </a>
      )}
    </div>
  );
}
