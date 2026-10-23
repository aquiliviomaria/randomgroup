import test from "node:test";
import assert from "node:assert/strict";
import {
  shuffle,
  parsePeople,
  makeGroups,
  createTournament,
  bracket,
  chooseWinner,
  validateTournament,
  existingThemeGroups,
  assignThemes,
} from "../src/engine.js";
const names = (n) => Array.from({ length: n }, (_, i) => `Equipa ${i + 1}`);
test("theme draw preserves existing groups and members, with distinct themes", () => {
  const entries = [
    { name: "Amigos", text: "Ana\nPaulo\nJoão" },
    { name: "", text: "Miguel\nSara" },
  ];
  const before = structuredClone(entries);
  const groups = existingThemeGroups(entries);
  const output = assignThemes(groups, ["Tecnologia", "Saúde", "Cultura"]);
  assert.deepEqual(entries, before);
  assert.equal(output[1].name, "Grupo 2");
  assert.deepEqual(
    output.map((g) => g.members),
    groups.map((g) => g.members),
  );
  assert.equal(new Set(output.map((g) => g.theme)).size, 2);
  assert.ok(
    output.every((g) => ["Tecnologia", "Saúde", "Cultura"].includes(g.theme)),
  );
});
test("theme draw rejects empty groups, duplicate members, duplicate names and insufficient themes", () => {
  assert.throws(
    () => existingThemeGroups([{ name: "A", text: "" }]),
    /membros/,
  );
  assert.throws(
    () =>
      existingThemeGroups([
        { name: "A", text: "Ana" },
        { name: "B", text: "ana" },
      ]),
    /repetidos/,
  );
  assert.throws(
    () =>
      existingThemeGroups([
        { name: "A", text: "Ana" },
        { name: "a", text: "Paulo" },
      ]),
    /repetidos/,
  );
  const groups = existingThemeGroups([
    { name: "A", text: "Ana" },
    { name: "B", text: "Paulo" },
  ]);
  assert.throws(() => assignThemes(groups, ["Saúde"]), /pelo menos/);
  assert.throws(() => assignThemes(groups, ["Saúde", "saúde"]), /repetidos/);
});
test("shuffle preserves every entry without mutating input", () => {
  const source = names(500);
  const copy = [...source];
  assert.deepEqual(shuffle(source).sort(), [...source].sort());
  assert.deepEqual(source, copy);
});
test("balanced groups contain each person exactly once for varied sizes", () => {
  for (const size of [2, 3, 5, 8, 11, 32, 100, 500])
    for (const count of [...new Set([1, 2, Math.ceil(size / 3), size])]) {
      const people = names(size).map((name) => ({ name, values: [] }));
      const gs = makeGroups(people, [], count);
      assert.equal(gs.length, count);
      assert.equal(
        new Set(gs.flatMap((g) => g.members.map((p) => p.name))).size,
        size,
      );
      assert.ok(
        Math.max(...gs.map((g) => g.members.length)) -
          Math.min(...gs.map((g) => g.members.length)) <=
          1,
      );
    }
});
test("separation composes across several criteria while mixing remains available", () => {
  const criteria = [
    { name: "Curso", mode: "separate" },
    { name: "Turno", mode: "separate" },
    { name: "Género", mode: "mix" },
  ];
  const people = Array.from({ length: 48 }, (_, i) => ({
    name: `P${i}`,
    values: [
      `Curso ${i % 2}`,
      `Turno ${Math.floor(i / 2) % 2}`,
      `G${Math.floor(i / 4) % 2}`,
    ],
  }));
  const gs = makeGroups(people, criteria, 8);
  assert.equal(gs.length, 8);
  for (const g of gs) {
    assert.equal(
      new Set(g.members.map((p) => p.values.slice(0, 2).join("|"))).size,
      1,
    );
    assert.ok(g.members.length > 0);
  }
  assert.throws(() => makeGroups(people, criteria, 3), /pelo menos 4/);
});
test("mixing a single equally represented criterion distributes categories evenly", () => {
  const people = Array.from({ length: 24 }, (_, i) => ({
    name: `P${i}`,
    values: [`${i % 3}`],
  }));
  for (let k = 0; k < 20; k++)
    for (const g of makeGroups(people, [{ name: "Curso", mode: "mix" }], 4))
      for (let c = 0; c < 3; c++)
        assert.equal(
          g.members.filter((p) => p.values[0] === String(c)).length,
          2,
        );
});
test("validates participant columns, duplicate names and impossible counts", () => {
  assert.throws(
    () => parsePeople("Ana; A\n ana; B", [{ name: "Curso" }]),
    /repetidos/,
  );
  assert.throws(
    () => parsePeople("Ana\nBruno; B", [{ name: "Curso" }]),
    /Linha 1/,
  );
  assert.throws(
    () => parsePeople("Ana; \nBruno; B", [{ name: "Curso" }]),
    /vazios/,
  );
  assert.throws(() => makeGroups([{ name: "A", values: [] }], [], 2), /número/);
});
test("every tournament size from 2 to 128 finishes with n-1 played matches", () => {
  for (let n = 2; n <= 128; n++) {
    let t = createTournament("Taça", names(n), false);
    let played = 0;
    while (!bracket(t).champion) {
      const playable = bracket(t)
        .rounds.flatMap((r) => r.matches)
        .find((m) => !m.bye && !m.winner && m.players.every(Boolean));
      assert.ok(playable, `no playable match for ${n}`);
      t = chooseWinner(t, playable.id, playable.players[0]);
      played++;
      assert.ok(played <= n - 1);
    }
    assert.equal(played, n - 1);
    assert.equal(bracket(t).champion, "p1");
    assert.deepEqual(
      validateTournament(JSON.parse(JSON.stringify(t))).choices,
      t.choices,
    );
  }
});
test("3 semifinalists yield one bye and a playable final", () => {
  let t = createTournament("Semifinais", names(3), false);
  const semi = bracket(t).rounds[0];
  assert.equal(semi.name, "Semifinais");
  assert.equal(semi.matches[1].winner, "p3");
  t = chooseWinner(t, "0:0", "p2");
  assert.deepEqual(bracket(t).rounds[1].matches[0].players, ["p2", "p3"]);
  t = chooseWinner(t, "1:0", "p3");
  assert.equal(bracket(t).champion, "p3");
});
test("changing an earlier winner clears dependent results but preserves independent ones", () => {
  let t = createTournament("Taça", names(8), false);
  for (const [id, p] of [
    ["0:0", "p1"],
    ["0:1", "p3"],
    ["0:2", "p5"],
    ["0:3", "p7"],
    ["1:0", "p1"],
    ["1:1", "p5"],
    ["2:0", "p1"],
  ])
    t = chooseWinner(t, id, p);
  t = chooseWinner(t, "0:0", "p2");
  const state = bracket(t);
  assert.equal(state.champion, null);
  assert.equal(state.rounds[1].matches[0].winner, null);
  assert.equal(state.rounds[1].matches[1].winner, "p5");
  assert.equal(t.choices["2:0"], undefined);
  t = chooseWinner(t, "0:0", null);
  assert.equal(bracket(t).rounds[0].matches[0].winner, null);
  assert.throws(() => chooseWinner(t, "2:0", "p1"), /disponível/);
  assert.throws(() => chooseWinner(t, "0:1", "p8"), /disponível/);
});
test("import validates schema, identities and choices, pruning forged downstream results", () => {
  const t = createTournament("Taça", names(3), false);
  for (const patch of [
    { version: 2 },
    { code: "unsafe" },
    {
      entrants: [
        { id: "p1", name: "A" },
        { id: "p1", name: "B" },
      ],
    },
    {
      entrants: [
        { id: "p1", name: "A" },
        { id: "p2", name: "a" },
      ],
    },
    { choices: null },
    { choices: { "0:0": { winner: null, signature: "x" } } },
  ])
    assert.throws(() => validateTournament({ ...t, ...patch }));
  const imported = validateTournament({
    ...t,
    choices: { "1:0": { winner: "p3", signature: '["p2","p3"]' } },
  });
  assert.deepEqual(imported.choices, {});
  assert.equal(validateTournament({ ...t, secret: "extra" }).secret, undefined);
});
