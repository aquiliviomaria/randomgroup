import { jsPDF } from "jspdf";
import { RESULT_COLORS, rankAppearance } from "./result-identity.js";
import { brandedQRCode } from "./branded-qr.js";
async function loadFont(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Não foi possível carregar a fonte do relatório.");
  let binary = "";
  for (const byte of new Uint8Array(await response.arrayBuffer()))
    binary += String.fromCharCode(byte);
  return btoa(binary);
}
export async function reportFont() {
  return loadFont((await import("./assets/report-font.ttf?url")).default);
}
export function buildReport({
  title,
  groups,
  subtitle = "",
  createdAt = new Date(),
  font,
  boldFont,
  type,
  appQR,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  if (font) {
    doc.addFileToVFS("RandomGroup.ttf", font);
    doc.addFont("RandomGroup.ttf", "RandomGroup", "normal");
    if (boldFont) {
      doc.addFileToVFS("RandomGroup-Bold.ttf", boldFont);
      doc.addFont("RandomGroup-Bold.ttf", "RandomGroup", "bold");
    }
  }
  const face = font ? "RandomGroup" : "helvetica";
  const weight = (bold) =>
    doc.setFont(face, bold && (!font || boldFont) ? "bold" : "normal");
  const isOrder =
    type === "order" ||
    (groups.length > 0 && groups.every((g) => /^\d+º lugar$/.test(g.name)));
  const margin = 12,
    gap = 7,
    width = (210 - margin * 2 - gap) / 2,
    bottom = 273;
  doc.setProperties({
    title: "RandomGroup",
    subject: title,
    author: "Aquilivio Maria Cumbe",
    creator: "RandomGroup",
  });
  let y = 0;
  function brand() {
    doc.setFillColor("#1557e8");
    doc.circle(margin + 1.6, 14.1, 1.6, "F");
    doc.setFillColor("#16804a");
    doc.circle(margin + 5.5, 14.1, 1.6, "F");
    doc.setFillColor("#d93644");
    doc.circle(margin + 3.55, 18, 1.6, "F");
    weight(true);
    doc.setFontSize(16);
    doc.setTextColor("#141b29");
    doc.text("RandomGroup", margin + 10, 18.3);
    const end = margin + 10 + doc.getTextWidth("RandomGroup");
    doc.setTextColor("#1557e8");
    doc.text(".", end, 18.3);
    doc.setDrawColor("#dce3ef");
    doc.setLineWidth(0.2);
    doc.line(end + 5.5, 13, end + 5.5, 19.3);
    weight(false);
    doc.setFontSize(9);
    doc.setTextColor("#526078");
    doc.text("Juntos, por acaso.", end + 10, 17.4);
  }
  function header() {
    brand();
    weight(true);
    doc.setTextColor("#172239");
    doc.setFontSize(11);
    const headings = doc.splitTextToSize(title, 186);
    doc.text(headings, margin, 29);
    y = 31 + headings.length * 4.2;
    weight(false);
    doc.setFontSize(7.5);
    doc.setTextColor("#526078");
    const summary = doc.splitTextToSize(
      subtitle ||
        `${groups.length} resultados · ${groups.reduce((n, g) => n + g.members.length, 0)} participantes`,
      186,
    );
    doc.text(summary, margin, y);
    y += summary.length * 3.2 + 5;
  }
  function medal(x, top, index) {
    const style = rankAppearance(index),
      cy = top + 3.2,
      r = 3.1;
    if (index < 3) {
      doc.setFillColor(style.metal);
      doc.triangle(x - 2, cy + 1.8, x - 2.8, cy + 5.5, x + 0.8, cy + 3.5, "F");
      doc.setFillColor(style.color);
      doc.triangle(x, cy + 2, x + 2.8, cy + 5.5, x + 2.1, cy + 1.7, "F");
    }
    doc.setDrawColor(style.metal);
    doc.setFillColor(style.fill);
    doc.setLineWidth(0.35);
    doc.circle(x, cy, r, "FD");
    if (index < 3) {
      doc.setLineWidth(0.16);
      doc.circle(x, cy, r - 0.8, "S");
    }
    weight(true);
    doc.setTextColor(style.color);
    doc.setFontSize(8);
    doc.text(String(index + 1), x, cy + 1, { align: "center" });
    weight(false);
  }
  function peopleIcon(x, y, color) {
    doc.setDrawColor(color);
    doc.setLineWidth(0.25);
    doc.circle(x, y, 0.65, "S");
    doc.circle(x - 1.65, y + 0.45, 0.5, "S");
    doc.circle(x + 1.65, y + 0.45, 0.5, "S");
    doc.path([
      { op: "m", c: [x - 1.15, y + 2.7] },
      { op: "c", c: [x - 1.15, y + 1.2, x + 1.15, y + 1.2, x + 1.15, y + 2.7] },
    ]);
    doc.stroke();
    doc.line(x - 2.8, y + 2.7, x - 2.4, y + 1.8);
    doc.line(x + 2.4, y + 1.8, x + 2.8, y + 2.7);
  }
  function check(x, y) {
    doc.setDrawColor("#16804a");
    doc.setLineWidth(0.3);
    doc.line(x, y, x + 0.6, y + 0.6);
    doc.line(x + 0.6, y + 0.6, x + 1.8, y - 0.7);
  }
  header();
  const fullTop = y,
    entries = [];
  for (const [index, group] of groups.entries()) {
    const style = isOrder
      ? rankAppearance(index)
      : {
          color: RESULT_COLORS[index % RESULT_COLORS.length],
          fill: ["#edf3ff", "#edf8f1", "#fff0f0", "#f3efff"][index % 4],
        };
    weight(true);
    doc.setFontSize(9);
    const heading = doc.splitTextToSize(group.name, width - 25);
    weight(false);
    doc.setFontSize(7.8);
    const members = group.members
      .map((p) => ({
        name: p.name,
        initial: p.name.charAt(0).toUpperCase(),
        lines: doc.splitTextToSize(
          `${p.name}${p.values?.length ? ` · ${p.values.join(" · ")}` : ""}`,
          width - 19,
        ),
      }))
      .map((p) => ({
        ...p,
        height: Math.max(5.2, p.lines.length * 3.1 + 1.6),
      }));
    doc.setFontSize(7.3);
    const theme = group.theme
      ? doc.splitTextToSize(group.theme, width - 13)
      : [];
    let current = [],
      used = 0,
      start = 0;
    const overhead = 12 + (theme.length ? theme.length * 3 + 4 : 0) + 7;
    const available = bottom - fullTop - overhead - 4;
    const push = () => {
      entries.push({
        group,
        index,
        style,
        heading,
        theme,
        members: current,
        start,
        height: overhead + used,
      });
      start += current.length;
      current = [];
      used = 0;
    };
    for (const person of members) {
      if (current.length && used + person.height > available) push();
      current.push(person);
      used += person.height;
    }
    if (current.length || !members.length) push();
  }
  for (let i = 0; i < entries.length; i += 2) {
    const pair = entries.slice(i, i + 2),
      height = Math.max(...pair.map((c) => c.height));
    if (y + height > bottom) {
      doc.addPage();
      header();
    }
    pair.forEach((card, col) => {
      const x = margin + col * (width + gap),
        { style, index, group } = card;
      doc.setLineWidth(0.2);
      doc.setFillColor("#ffffff");
      doc.setDrawColor("#dfe5ee");
      doc.roundedRect(x, y, width, card.height, 2.5, 2.5, "FD");
      doc.setFillColor(style.color);
      doc.roundedRect(x + 0.1, y + 0.1, width - 0.2, 0.8, 0.4, 0.4, "F");
      if (isOrder) medal(x + 6, y + 2, index);
      else {
        doc.setFillColor(style.fill);
        doc.roundedRect(x + 3, y + 3, 7, 7, 1.4, 1.4, "F");
        weight(true);
        doc.setFontSize(8);
        doc.setTextColor(style.color);
        doc.text(String(index + 1).padStart(2, "0"), x + 6.5, y + 7.6, {
          align: "center",
        });
      }
      weight(true);
      doc.setTextColor("#172239");
      doc.setFontSize(9);
      doc.text(card.heading, x + 13, y + (isOrder ? 6.3 : 7.4));
      if (!isOrder) peopleIcon(x + width - 6, y + 4.4, style.color);
      if (card.start) {
        weight(false);
        doc.setFontSize(6);
        doc.setTextColor("#62728a");
        doc.text("continuação", x + 13, y + 9.5);
      }
      doc.setDrawColor("#e9edf4");
      doc.setLineWidth(0.15);
      doc.line(x + 3, y + 11, x + width - 3, y + 11);
      let rowY = y + 13;
      if (card.theme.length) {
        weight(true);
        doc.setFontSize(7.3);
        doc.setTextColor(style.color);
        doc.text(card.theme, x + 4, rowY + 2);
        rowY += card.theme.length * 3 + 4;
      }
      for (const person of card.members) {
        const cy = rowY + 1.9;
        doc.setFillColor(style.fill);
        doc.roundedRect(x + 3, cy - 1.6, 3.6, 3.6, 1, 1, "F");
        weight(true);
        doc.setFontSize(6.6);
        doc.setTextColor(style.color);
        doc.text(person.initial, x + 4.8, cy + 0.9, { align: "center" });
        weight(false);
        doc.setFontSize(7.8);
        doc.setTextColor("#172239");
        doc.text(person.lines, x + 9, rowY + 2.5);
        check(x + width - 5.2, cy + 0.8);
        rowY += person.height;
      }
      const foot = y + card.height - 4.5;
      doc.setDrawColor("#edf0f5");
      doc.line(x + 3, foot - 1, x + width - 3, foot - 1);
      weight(false);
      doc.setFontSize(6.3);
      doc.setTextColor("#62728a");
      doc.text(
        `${group.members.length} ${group.members.length === 1 ? "pessoa" : "pessoas"}${card.start ? " · continuação" : ""}`,
        x + 3,
        foot + 1.4,
      );
    });
    y += height + 5;
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    weight(false);
    doc.setDrawColor("#dde5ef");
    doc.line(12, 279, 198, 279);
    doc.setFontSize(7);
    doc.setTextColor("#1557e8");
    doc.text("RandomGroup · Juntos, por acaso.", 12, 283);
    const footerRight = appQR ? 181 : 198;
    doc.text(`${page} / ${pages}`, footerRight, 283, { align: "right" });
    doc.setTextColor("#526078");
    doc.text(
      new Date(createdAt).toLocaleString("pt-PT", {
        timeZone: "Africa/Maputo",
      }),
      12,
      288,
    );
    doc.text("Created & Designed by Aquilivio Maria", footerRight, 288, {
      align: "right",
    });
    if (appQR) {
      doc.addImage(appQR, "PNG", 184, 280, 14, 14, "app-qr", "FAST");
      doc.setFontSize(6);
      doc.text("randomgroup.vercel.app", footerRight, 292, { align: "right" });
      doc.link(184, 280, 14, 14, { url: "https://randomgroup.vercel.app" });
    }
  }
  return doc;
}
export async function exportReport(data) {
  const [font, boldFont, appQR] = await Promise.all([
    reportFont(),
    loadFont((await import("./assets/report-font-bold.ttf?url")).default),
    brandedQRCode(),
  ]);
  buildReport({ ...data, font, boldFont, appQR }).save(
    `RandomGroup-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
