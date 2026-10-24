// The random tournament code seeds a stable visual identity across rounds,
// reloads, exports and protected copies. This does not affect match draws.
export function tournamentBadges(code, ids, iconCount = 12, colorCount = 7) {
  let seed = 2166136261;
  for (const char of code)
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  seed ||= 1;
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
  const shuffled = (count) => {
    const values = Array.from({ length: count }, (_, i) => i);
    for (let i = values.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  let icons = [],
    colors = [];
  return Object.fromEntries(
    ids.map((id, i) => {
      if (i % iconCount === 0) icons = shuffled(iconCount);
      if (i % colorCount === 0) colors = shuffled(colorCount);
      return [
        id,
        { icon: icons[i % iconCount], color: colors[i % colorCount] },
      ];
    }),
  );
}
