import { validAppearance } from "./tournament-identity.js";

export function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const array = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(array);
  } while (array[0] >= limit);
  return array[0] % max;
}
export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const lines = (text) =>
  text
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
export const key = (text) =>
  text.trim().normalize("NFC").toLocaleLowerCase("pt");
export function uniqueNames(names, min = 2, max = 128) {
  if (names.length < min || names.length > max)
    throw new Error(`Indique entre ${min} e ${max} participantes.`);
  if (names.some((n) => !n.trim() || n.length > 100))
    throw new Error("Cada nome deve ter entre 1 e 100 caracteres.");
  if (new Set(names.map(key)).size !== names.length)
    throw new Error(
      "Existem nomes repetidos. Use um apelido ou número para os distinguir.",
    );
}
export function existingThemeGroups(entries) {
  if (!entries.length || entries.length > 500)
    throw new Error("Adicione entre 1 e 500 grupos.");
  const groups = entries.map((g, i) => ({
    name: g.name.trim() || `Grupo ${i + 1}`,
    members: lines(g.text).map((name) => ({ name, values: [] })),
  }));
  uniqueNames(
    groups.map((g) => g.name),
    1,
    500,
  );
  for (const group of groups) {
    if (!group.members.length)
      throw new Error(`Adicione os membros de ${group.name}.`);
  }
  uniqueNames(
    groups.flatMap((g) => g.members.map((p) => p.name)),
    1,
    500,
  );
  return groups;
}
export function assignThemes(groups, themes) {
  uniqueNames(themes, 1, 500);
  if (themes.length < groups.length)
    throw new Error("Adicione pelo menos um tema diferente para cada grupo.");
  const shuffled = shuffle(themes);
  return groups.map((group, i) => ({ ...group, theme: shuffled[i] }));
}
export function parsePeople(text, criteria) {
  const people = lines(text).map((line, i) => {
    const cells = line.split(";").map((x) => x.trim());
    if (cells.length !== criteria.length + 1 || cells.some((x) => !x))
      throw new Error(
        `Linha ${i + 1}: use Nome${criteria.map((c) => `; ${c.name}`).join("")}, sem campos vazios.`,
      );
    if (cells.some((x) => x.length > 100))
      throw new Error(
        `Linha ${i + 1}: cada campo pode ter até 100 caracteres.`,
      );
    return { name: cells[0], values: cells.slice(1) };
  });
  uniqueNames(
    people.map((p) => p.name),
    2,
    500,
  );
  return people;
}
/** Separate criteria are hard constraints; mixing is a randomized greedy balance. */
export function makeGroups(people, criteria, count) {
  if (!Number.isInteger(count) || count < 1 || count > people.length)
    throw new Error(
      "O número de grupos deve estar entre 1 e o total de participantes.",
    );
  const separate = criteria.flatMap((c, i) =>
    c.mode === "separate" ? [i] : [],
  );
  const mixed = criteria.flatMap((c, i) => (c.mode === "mix" ? [i] : []));
  const buckets = new Map();
  for (const person of shuffle(people)) {
    const signature = JSON.stringify(
      separate.map((i) => key(person.values[i])),
    );
    if (!buckets.has(signature)) buckets.set(signature, []);
    buckets.get(signature).push(person);
  }
  const sections = [...buckets.values()].map((members) => ({
    members,
    count: 1,
  }));
  if (count < sections.length)
    throw new Error(
      `São necessários pelo menos ${sections.length} grupos para manter essas categorias separadas.`,
    );
  for (let remaining = count - sections.length; remaining > 0; remaining--) {
    const section = sections
      .filter((s) => s.count < s.members.length)
      .sort(
        (a, b) => b.members.length / b.count - a.members.length / a.count,
      )[0];
    section.count++;
  }
  const output = [];
  for (const section of sections) {
    const groups = Array.from({ length: section.count }, (_, i) => ({
      members: [],
      capacity:
        Math.floor(section.members.length / section.count) +
        (i < section.members.length % section.count ? 1 : 0),
    }));
    const frequencies = new Map();
    for (const p of section.members)
      for (const i of mixed) {
        const k = JSON.stringify([i, key(p.values[i])]);
        frequencies.set(k, (frequencies.get(k) || 0) + 1);
      }
    const rarity = (p) =>
      mixed.reduce(
        (sum, i) =>
          sum + 1 / frequencies.get(JSON.stringify([i, key(p.values[i])])),
        0,
      );
    const queue = shuffle(section.members).sort(
      (a, b) => rarity(b) - rarity(a),
    );
    for (const p of queue) {
      const score = (g) =>
        mixed.reduce(
          (sum, i) =>
            sum +
            g.members.filter((m) => key(m.values[i]) === key(p.values[i]))
              .length,
          0,
        );
      const available = shuffle(
        groups.filter((g) => g.members.length < g.capacity),
      );
      available.sort(
        (a, b) => score(a) - score(b) || a.members.length - b.members.length,
      );
      available[0].members.push(p);
    }
    for (const g of groups)
      output.push({
        name: `Grupo ${output.length + 1}`,
        category: separate.map((i) => section.members[0].values[i]).join(" · "),
        members: g.members,
      });
  }
  return output;
}
export function roundName(count) {
  if (count <= 2) return "Final";
  if (count <= 4) return "Semifinais";
  if (count <= 8) return "Quartos de final";
  if (count <= 16) return "Oitavos de final";
  if (count <= 32) return "16 avos de final";
  return `Ronda de ${count}`;
}
export function createTournament(name, names, randomize = true, opening = "") {
  uniqueNames(names);
  if (!name.trim() || name.length > 100)
    throw new Error("Dê um nome ao torneio (até 100 caracteres).");
  const entrants = (randomize ? shuffle(names) : names).map((name, i) => ({
    id: `p${i + 1}`,
    name,
  }));
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return {
    app: "RandomGroup",
    version: 1,
    code: `RG-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`,
    name: name.trim(),
    opening: opening.trim().slice(0, 80),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entrants,
    choices: {},
  };
}
/** Rebuild the whole bracket. Choices carry their matchup signature, so changing a
 * winner invalidates only downstream matches whose participants have changed. */
export function bracket(tournament) {
  let current = tournament.entrants.map((p) => p.id);
  const rounds = [],
    choices = {};
  let index = 0;
  while (current.length > 1) {
    const matches = [],
      next = [];
    for (let i = 0; i < current.length; i += 2) {
      const players = [current[i], current[i + 1] ?? null];
      const id = `${index}:${i / 2}`;
      const signature = JSON.stringify(players);
      const saved = tournament.choices[id];
      const bye = i + 1 >= current.length;
      const winner = bye
        ? players[0]
        : saved?.signature === signature &&
            players.includes(saved.winner) &&
            saved.winner !== null
          ? saved.winner
          : null;
      if (!bye && winner)
        choices[id] = {
          winner,
          signature,
          ...(Array.isArray(saved.scores) &&
          saved.scores.length === 2 &&
          saved.scores.every((s) => Number.isInteger(s) && s >= 0 && s <= 999)
            ? { scores: saved.scores }
            : {}),
        };
      matches.push({
        id,
        players,
        winner,
        bye,
        signature,
        ...(winner && choices[id]?.scores
          ? { scores: choices[id].scores }
          : {}),
      });
      next.push(winner);
    }
    rounds.push({
      name:
        index === 0 && tournament.opening
          ? tournament.opening
          : roundName(current.length),
      matches,
    });
    current = next;
    index++;
  }
  return { rounds, champion: current[0], choices };
}
export function chooseWinner(tournament, matchId, winner) {
  const match = bracket(tournament)
    .rounds.flatMap((r) => r.matches)
    .find((m) => m.id === matchId);
  if (
    !match ||
    match.bye ||
    !match.players.every(Boolean) ||
    (winner !== null && !match.players.includes(winner))
  )
    throw new Error("Este confronto ainda não está disponível.");
  const choices = { ...tournament.choices };
  if (winner === null) delete choices[matchId];
  else choices[matchId] = { winner, signature: match.signature };
  const next = { ...tournament, choices, updatedAt: new Date().toISOString() };
  return { ...next, choices: bracket(next).choices };
}
export function validateTournament(data) {
  const fail = () => {
    throw new Error("Os dados do torneio guardado não são válidos.");
  };
  if (
    !data ||
    !["RandGroup", "RandomGroup"].includes(data.app) ||
    data.version !== 1 ||
    typeof data.name !== "string" ||
    !data.name.trim() ||
    data.name.length > 100 ||
    !/^RG-[A-F0-9]{12}$/.test(data.code) ||
    !Array.isArray(data.entrants)
  )
    fail();
  if (
    data.entrants.some(
      (p) =>
        !p ||
        typeof p.id !== "string" ||
        !/^p\d{1,3}$/.test(p.id) ||
        typeof p.name !== "string",
    ) ||
    new Set(data.entrants.map((p) => p.id)).size !== data.entrants.length
  )
    fail();
  uniqueNames(data.entrants.map((p) => p.name));
  if (
    !data.choices ||
    typeof data.choices !== "object" ||
    Array.isArray(data.choices) ||
    Object.keys(data.choices).length > 127
  )
    fail();
  for (const [id, choice] of Object.entries(data.choices)) {
    if (
      !/^\d{1,2}:\d{1,3}$/.test(id) ||
      !choice ||
      typeof choice.winner !== "string" ||
      typeof choice.signature !== "string" ||
      choice.signature.length > 100
    )
      fail();
  }
  const clean = {
    app: "RandomGroup",
    version: 1,
    code: data.code,
    name: data.name.trim(),
    game: data.game !== false,
    opening: typeof data.opening === "string" ? data.opening.slice(0, 80) : "",
    createdAt:
      typeof data.createdAt === "string" &&
      Number.isFinite(Date.parse(data.createdAt))
        ? data.createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entrants: data.entrants.map(({ id, name, appearance }) => ({
      id,
      name,
      ...(validAppearance(appearance)
        ? { appearance: { icon: appearance.icon, color: appearance.color } }
        : {}),
    })),
    choices: data.choices,
  };
  return { ...clean, choices: bracket(clean).choices };
}

/** Category pools are disjoint, with guaranteed minimum/exact per-group quotas. */
export function makeCategoryGroups(categories, count, mode = "mix") {
  if (!categories.length || categories.some((c) => !c.name.trim()))
    throw new Error("Dê um nome a cada categoria.");
  if (new Set(categories.map((c) => key(c.name))).size !== categories.length)
    throw new Error("Use nomes diferentes para as categorias.");
  const people = categories.flatMap((c) =>
    lines(c.text).map((name) => ({ name, values: [c.name] })),
  );
  uniqueNames(
    people.map((p) => p.name),
    2,
    500,
  );
  if (categories.some((c) => !lines(c.text).length))
    throw new Error("Adicione participantes a todas as categorias.");
  if (!Number.isInteger(count) || count < 1 || count > people.length)
    throw new Error(
      "O número de grupos deve estar entre 1 e o total de participantes.",
    );
  if (mode === "separate")
    return makeGroups(people, [{ name: "Categoria", mode: "separate" }], count);
  const groups = Array.from({ length: count }, (_, i) => ({
    name: `Grupo ${i + 1}`,
    members: [],
  }));
  const pools = categories.map((c) => {
    const members = shuffle(people.filter((p) => p.values[0] === c.name));
    const quota = c.quota === "" || c.quota == null ? 0 : Number(c.quota);
    if (!Number.isInteger(quota) || quota < 0)
      throw new Error(
        `A quota de ${c.name} deve ser um número inteiro positivo ou zero.`,
      );
    if (members.length < quota * count)
      throw new Error(
        `${c.name}: precisa de ${quota * count} pessoas para ${quota} por grupo; tem ${members.length}.`,
      );
    if (c.rule === "exact" && members.length !== quota * count)
      throw new Error(
        `${c.name}: a quota exata de ${quota} por grupo exige ${quota * count} pessoas; tem ${members.length}. Ajuste a quota ou escolha “Pelo menos”.`,
      );
    return { members, quota };
  });
  for (const pool of pools)
    for (const group of groups)
      group.members.push(...pool.members.splice(0, pool.quota));
  // Round-robin by category also balances each category's remainder.
  for (const pool of shuffle(pools)) {
    const assigned = new Map(groups.map((g) => [g, 0]));
    while (pool.members.length) {
      const candidates = shuffle(groups).sort(
        (a, b) =>
          assigned.get(a) - assigned.get(b) ||
          a.members.length - b.members.length,
      );
      const group = candidates[0];
      group.members.push(pool.members.pop());
      assigned.set(group, assigned.get(group) + 1);
    }
  }
  groups.forEach((g) => {
    g.members = shuffle(g.members);
  });
  return groups;
}

export function setMatchScore(tournament, matchId, scores) {
  const match = bracket(tournament)
    .rounds.flatMap((r) => r.matches)
    .find((m) => m.id === matchId);
  if (!match || match.bye || !match.players.every(Boolean))
    throw new Error("Este confronto ainda não está disponível.");
  if (
    !Array.isArray(scores) ||
    scores.length !== 2 ||
    scores.some((s) => !Number.isInteger(s) || s < 0 || s > 999)
  )
    throw new Error("Os resultados devem ser números inteiros entre 0 e 999.");
  if (scores[0] === scores[1])
    throw new Error(
      "O mata-mata precisa de um vencedor. Indique o resultado após o desempate.",
    );
  const next = chooseWinner(
    tournament,
    matchId,
    match.players[scores[0] > scores[1] ? 0 : 1],
  );
  next.choices[matchId].scores = scores;
  return next;
}
