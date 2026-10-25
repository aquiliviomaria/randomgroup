export function validAppearance(value) {
  return (
    !!value &&
    Number.isInteger(value.icon) &&
    value.icon >= 0 &&
    value.icon < 12 &&
    Number.isInteger(value.color) &&
    value.color >= 0 &&
    value.color < 7
  );
}

export function setParticipantAppearance(tournament, id, appearance) {
  if (
    !validAppearance(appearance) ||
    !tournament.entrants.some((p) => p.id === id)
  )
    throw new Error("Escolha um ícone e uma cor válidos.");
  return {
    ...tournament,
    updatedAt: new Date().toISOString(),
    entrants: tournament.entrants.map((p) =>
      p.id === id
        ? {
            ...p,
            appearance: { icon: appearance.icon, color: appearance.color },
          }
        : p,
    ),
  };
}

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
