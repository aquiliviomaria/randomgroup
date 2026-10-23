// A small central wordmark with high error correction keeps the QR readable.
export const APP_URL = "https://randomgroup.vercel.app";
export async function brandedQRCode(value = APP_URL) {
  const { default: QRCode } = await import("qrcode");
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, value, {
    width: 1000,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: "#172239", light: "#ffffff" },
  });
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const badgeWidth = w * 0.31,
    badgeHeight = w * 0.08;
  const x = (w - badgeWidth) / 2,
    y = (w - badgeHeight) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, badgeWidth, badgeHeight);
  const radius = w * 0.009;
  const iconX = x + w * 0.022,
    iconY = w / 2 - radius;
  for (const [dx, dy, color] of [
    [0, 0, "#1557e8"],
    [radius * 2.4, 0, "#16804a"],
    [radius * 1.2, radius * 2.4, "#d93644"],
  ]) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(iconX + dx, iconY + dy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = `800 ${w * 0.031}px Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#172239";
  const textX = x + w * 0.064;
  ctx.fillText("RandomGroup", textX, w / 2 + 1);
  ctx.fillStyle = "#1557e8";
  ctx.fillText(".", textX + ctx.measureText("RandomGroup").width, w / 2 + 1);
  return canvas.toDataURL("image/png");
}
