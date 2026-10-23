export const RESULT_COLORS = ["#1557e8", "#16804a", "#d93644", "#633dd1"];
export function rankAppearance(index) {
  return (
    [
      {
        color: "#9b6500",
        fill: "#fff5d7",
        metal: "#e6af29",
        label: "Primeiro lugar",
      },
      {
        color: "#52647c",
        fill: "#eff3f8",
        metal: "#aab8ca",
        label: "Segundo lugar",
      },
      {
        color: "#99552c",
        fill: "#fff0e6",
        metal: "#c88b60",
        label: "Terceiro lugar",
      },
    ][index] || {
      color: "#1557e8",
      fill: "#edf3ff",
      metal: "#1557e8",
      label: `${index + 1}º lugar`,
    }
  );
}
