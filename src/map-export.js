import { toCanvas } from "html-to-image";
import { exportHeader, exportFooter } from "./export-layout.js";
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportTournamentMap(node, tournament, format = "png") {
  if (!node) throw new Error("O mapa ainda não está pronto.");
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
  const clone = node.cloneNode(true),
    sourceInputs = node.querySelectorAll("input");
  clone.querySelectorAll("input").forEach((input, i) => {
    input.value = sourceInputs[i].value;
    input.setAttribute("value", input.value);
  });
  clone.querySelectorAll("*").forEach((el) => {
    el.style.animation = "none";
    el.style.transition = "none";
  });
  clone
    .querySelectorAll(".tournament-tools,.bracket-hint")
    .forEach((el) => el.remove());
  const map = node.querySelector(".bracket-map"),
    mapWidth = Math.ceil(map.getBoundingClientRect().width);
  const exportWidth = Math.max(720, mapWidth + 62);
  const copiedMap = clone.querySelector(".bracket-map");
  copiedMap.style.width = `${mapWidth}px`;
  copiedMap.style.minWidth = `${mapWidth}px`;
  clone.querySelectorAll(".map-connections .route").forEach((route) => {
    const color = route.classList.contains("active") ? "#16804a" : "#a6b6cf";
    route.setAttribute("fill", "none");
    route.setAttribute("stroke", color);
    route.setAttribute("stroke-width", "2");
    Object.assign(route.style, {
      fill: "none",
      stroke: color,
      strokeWidth: "2px",
      strokeDasharray: "none",
    });
  });
  const scroll = clone.querySelector(".bracket-scroll");
  Object.assign(scroll.style, {
    maxHeight: "none",
    height: "auto",
    overflow: "visible",
    width: `${mapWidth + 60}px`,
    margin: "0 auto",
    padding: "24px 30px",
  });
  Object.assign(clone.style, {
    width: `${exportWidth}px`,
    maxWidth: "none",
    overflow: "visible",
    border: "none",
    borderRadius: "0",
  });
  const host = document.createElement("div");
  host.className = "map-export-host";
  Object.assign(host.style, {
    position: "fixed",
    left: "-50000px",
    top: "0",
    width: `${exportWidth}px`,
    background: "#ffffff",
    fontFamily: "Arial,sans-serif",
    color: "#172239",
    padding: "24px 0",
  });
  const header = exportHeader(
    tournament.name,
    `${tournament.entrants.length} participantes`,
  );
  const footer = await exportFooter();
  host.append(header, clone, footer);
  document.body.append(host);
  try {
    const width = Math.ceil(host.scrollWidth),
      height = Math.ceil(host.scrollHeight);
    const ratio = Math.min(
      2,
      Math.sqrt(12_000_000 / (width * height)),
      8192 / Math.max(width, height),
    );
    const canvas = await toCanvas(host, {
      width,
      height,
      pixelRatio: ratio,
      backgroundColor: "#ffffff",
      skipFonts: true,
      style: { position: "static", left: "0", top: "0" },
      filter: (el) => !(el.tagName === "LINK"),
      cacheBust: false,
    });
    const filename = `RandomGroup-${tournament.code}`;
    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      // Keep the complete map on a single landscape A3 page.
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
        compress: true,
      });
      const w = doc.internal.pageSize.getWidth(),
        h = doc.internal.pageSize.getHeight();
      const scale = Math.min((w - 12) / canvas.width, (h - 12) / canvas.height),
        iw = canvas.width * scale,
        ih = canvas.height * scale;
      doc.addImage(
        canvas,
        "PNG",
        (w - iw) / 2,
        (h - ih) / 2,
        iw,
        ih,
        undefined,
        "FAST",
      );
      doc.setProperties({
        title: "RandomGroup",
        subject: tournament.name,
        author: "Aquilivio Maria Cumbe",
      });
      doc.save(`${filename}-mapa.pdf`);
    } else {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob)
        throw new Error(
          "O navegador não conseguiu gerar esta imagem. Tente num computador.",
        );
      download(blob, `${filename}-mapa.png`);
    }
  } finally {
    host.remove();
  }
}
