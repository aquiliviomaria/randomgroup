import test from "node:test";
import assert from "node:assert/strict";
import {
  makeCategoryGroups,
  createTournament,
  bracket,
  chooseWinner,
  setMatchScore,
  validateTournament,
} from "../src/engine.js";
import { cleanImportedText } from "../src/imports.js";
const pool = (name, n, quota = "", rule = "min") => ({
  name,
  text: Array.from({ length: n }, (_, i) => `${name} ${i + 1}`).join("\n"),
  quota,
  rule,
});
test("five groups guarantee 1 TEO, 1 Agro and 3 EIT without losing anyone", () => {
  for (let run = 0; run < 20; run++) {
    const groups = makeCategoryGroups(
      [
        pool("TEO", 5, 1, "exact"),
        pool("Agro", 5, 1, "exact"),
        pool("EIT", 15, 3, "exact"),
      ],
      5,
    );
    assert.equal(groups.length, 5);
    assert.equal(
      new Set(groups.flatMap((g) => g.members.map((p) => p.name))).size,
      25,
    );
    for (const group of groups) {
      assert.equal(group.members.length, 5);
      for (const [name, n] of [
        ["TEO", 1],
        ["Agro", 1],
        ["EIT", 3],
      ])
        assert.equal(
          group.members.filter((p) => p.values[0] === name).length,
          n,
        );
    }
  }
});
test("at least one woman per group distributes everyone and balances sizes", () => {
  const groups = makeCategoryGroups(
    [pool("Mulheres", 7, 1), pool("Homens", 16)],
    5,
  );
  assert.equal(groups.flatMap((g) => g.members).length, 23);
  for (const group of groups)
    assert.ok(group.members.some((p) => p.values[0] === "Mulheres"));
  assert.ok(
    Math.max(...groups.map((g) => g.members.length)) -
      Math.min(...groups.map((g) => g.members.length)) <=
      1,
  );
});
test("separated groups contain a single course and respect requested count", () => {
  const groups = makeCategoryGroups(
    [pool("TEO", 5), pool("Agro", 5), pool("EIT", 15)],
    5,
    "separate",
  );
  assert.equal(groups.length, 5);
  for (const group of groups)
    assert.equal(new Set(group.members.map((p) => p.values[0])).size, 1);
});
test("impossible quotas, exact surplus, duplicate names and invalid counts fail clearly", () => {
  assert.throws(
    () => makeCategoryGroups([pool("TEO", 4, 1), pool("EIT", 15)], 5),
    /precisa de 5/,
  );
  assert.throws(
    () => makeCategoryGroups([pool("TEO", 6, 1, "exact"), pool("EIT", 15)], 5),
    /quota exata/,
  );
  assert.throws(
    () =>
      makeCategoryGroups(
        [
          { name: "A", text: "Ana" },
          { name: "B", text: "ana" },
        ],
        2,
      ),
    /repetidos/,
  );
  assert.throws(() => makeCategoryGroups([pool("A", 5)], 2.5), /número/);
  assert.throws(() => makeCategoryGroups([pool("A", 5, -1)], 2), /quota/);
});
test("a 5–2 score advances the winner, persists scores and clears downstream results on correction", () => {
  let t = {
    ...createTournament("Taça", ["A", "B", "C", "D"], false),
    game: true,
  };
  t = setMatchScore(t, "0:0", [5, 2]);
  t = setMatchScore(t, "0:1", [3, 1]);
  t = setMatchScore(t, "1:0", [1, 0]);
  assert.equal(bracket(t).champion, "p1");
  assert.deepEqual(bracket(t).rounds[0].matches[0].scores, [5, 2]);
  const copy = validateTournament(JSON.parse(JSON.stringify(t)));
  assert.deepEqual(copy.choices["0:0"].scores, [5, 2]);
  assert.equal(copy.game, true);
  t = setMatchScore(t, "0:0", [2, 5]);
  assert.equal(bracket(t).champion, null);
  assert.deepEqual(bracket(t).rounds[1].matches[0].players, ["p2", "p3"]);
  assert.equal(t.choices["1:0"], undefined);
  assert.deepEqual(t.choices["0:1"].scores, [3, 1]);
  assert.throws(() => setMatchScore(t, "0:0", [2, 2]), /desempate/);
  assert.throws(() => setMatchScore(t, "0:0", [-1, 2]), /inteiros/);
  t = chooseWinner(t, "0:0", null);
  assert.equal(t.choices["0:0"], undefined);
});
test("legacy tournaments remain readable and manual winner preference persists", () => {
  const t = {
    ...createTournament("Taça", ["A", "B"], false),
    app: "RandGroup",
    game: false,
  };
  const copy = validateTournament(t);
  assert.equal(copy.app, "RandomGroup");
  assert.equal(copy.game, false);
});
test("import cleanup preserves names and strips common list markers", () => {
  assert.equal(
    cleanImportedText("1. Ana\r\n2) Bruno\n- Carla\n* Daniel\n• Elisa\n"),
    "Ana\nBruno\nCarla\nDaniel\nElisa",
  );
});
