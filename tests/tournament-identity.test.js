import test from "node:test";
import assert from "node:assert/strict";
import { tournamentBadges } from "../src/tournament-identity.js";
import {
  createTournament,
  setMatchScore,
  validateTournament,
} from "../src/engine.js";

test("badges vary between tournaments and use each icon and color before repeating", () => {
  const ids = Array.from({ length: 128 }, (_, i) => `p${i + 1}`);
  const badges = tournamentBadges("RG-0123456789AB", ids);
  assert.notDeepEqual(badges, tournamentBadges("RG-ABCDEF012345", ids));
  for (let i = 0; i < ids.length; i += 12)
    assert.equal(
      new Set(ids.slice(i, i + 12).map((id) => badges[id].icon)).size,
      Math.min(12, ids.length - i),
    );
  for (let i = 0; i < ids.length; i += 7)
    assert.equal(
      new Set(ids.slice(i, i + 7).map((id) => badges[id].color)).size,
      Math.min(7, ids.length - i),
    );
});

test("participant badges survive advancement and restoring the saved tournament", () => {
  const tournament = createTournament(
    "Taça",
    ["Ana", "Paulo", "João", "Sara"],
    false,
  );
  const identities = (t) =>
    tournamentBadges(
      t.code,
      t.entrants.map((p) => p.id),
    );
  const badges = identities(tournament);
  const advanced = setMatchScore(tournament, "0:0", [5, 2]);
  const restored = validateTournament(JSON.parse(JSON.stringify(advanced)));
  assert.deepEqual(identities(advanced), badges);
  assert.deepEqual(identities(restored), badges);
});
