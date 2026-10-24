import { toCanvas } from "html-to-image";
import { exportHeader, exportFooter } from "./export-layout.js";

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportResultsPNG(
  node,
  data,
  { returnFiles = false } = {},
) {
  if (!node || node.querySelector(".member-placeholder"))
    throw new Error("Espere pela apresentação de todos os resultados.");
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
  const host = document.createElement("div");
  host.className = "results-export";
  host.style.cssText =
    "position:fixed;left:-50000px;top:0;width:1140px;padding:20px 0;background:white;color:#172239";
  const grid = document.createElement("div");
  grid.className = node.className;
  const header = exportHeader(
    data.title,
    `${data.groups.reduce((n, g) => n + g.members.length, 0)} participantes`,
  );
  header.style.paddingBottom = "12px";
  const subtitle = document.createElement("p");
  subtitle.className = "export-summary";
  subtitle.textContent = data.subtitle;
  const footer = await exportFooter();
  const pageLabel = document.createElement("span");
  pageLabel.style.cssText = "display:block;font-size:11px;margin-top:5px";
  footer.firstElementChild.append(pageLabel);
  host.append(header, subtitle, grid, footer);
  document.body.append(host);
  try {
    // Split long groups by measured height; each continuation keeps its identity.
    const cards = [];
    for (const source of node.children) {
      const template = source.cloneNode(true);
      template.querySelectorAll("*").forEach((el) => {
        el.style.animation = "none";
        el.style.transition = "none";
      });
      template.style.animation = "none";
      const members = [...template.querySelector(".members").children];
      template.querySelector(".members").replaceChildren();
      let part = template.cloneNode(true),
        continuation = 0;
      grid.replaceChildren(part);
      const finish = () => {
        cards.push(part);
        continuation++;
      };
      for (const member of members) {
        part.querySelector(".members").append(member);
        if (
          part.getBoundingClientRect().height > 1900 &&
          part.querySelector(".members").children.length > 1
        ) {
          member.remove();
          finish();
          part = template.cloneNode(true);
          const label = document.createElement("small");
          label.className = "export-continuation";
          label.textContent = `Continuação ${continuation + 1}`;
          part.querySelector("header").after(label);
          grid.replaceChildren(part);
          part.querySelector(".members").append(member);
        }
      }
      finish();
    }
    const pages = [];
    let page = [],
      used = 0;
    for (let i = 0; i < cards.length; i += 2) {
      const row = cards.slice(i, i + 2);
      grid.replaceChildren(...row);
      const height = Math.max(
        ...row.map((card) => card.getBoundingClientRect().height),
      );
      if (page.length && used + height + 12 > 2500) {
        pages.push(page);
        page = [];
        used = 0;
      }
      page.push(...row);
      used += height + 12;
    }
    if (page.length) pages.push(page);
    const files = {};
    const prepared = [];
    const filename = `RandomGroup-${data.type}-${new Date().toISOString().slice(0, 10)}`;
    for (const [index, cards] of pages.entries()) {
      grid.replaceChildren(...cards);
      pageLabel.textContent =
        pages.length > 1 ? `${index + 1} / ${pages.length}` : "";
      const width = Math.ceil(host.scrollWidth),
        height = Math.ceil(host.scrollHeight);
      const canvas = await toCanvas(host, {
        width,
        height,
        pixelRatio: Math.min(
          2,
          Math.sqrt(12_000_000 / (width * height)),
          8192 / Math.max(width, height),
        ),
        backgroundColor: "#ffffff",
        skipFonts: true,
        style: { position: "static", left: "0", top: "0" },
        filter: (el) => el.tagName !== "LINK",
      });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob)
        throw new Error(
          "O navegador não conseguiu gerar a imagem. Tente novamente.",
        );
      if (returnFiles)
        prepared.push(
          new File(
            [blob],
            `${filename}${pages.length > 1 ? `-${String(index + 1).padStart(2, "0")}` : ""}.png`,
            { type: "image/png" },
          ),
        );
      else if (pages.length === 1) save(blob, `${filename}.png`);
      else
        files[`${filename}-${String(index + 1).padStart(2, "0")}.png`] =
          new Uint8Array(await blob.arrayBuffer());
    }
    if (!returnFiles && pages.length > 1) {
      const { zipSync } = await import("fflate");
      save(
        new Blob([zipSync(files, { level: 0 })], { type: "application/zip" }),
        `${filename}.zip`,
      );
    }
    return returnFiles ? prepared : pages.length;
  } finally {
    host.remove();
  }
}
