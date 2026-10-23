import test from "node:test";
import assert from "node:assert/strict";
import {
  protectTournament,
  unlockTournament,
  accessPayload,
} from "../src/access.js";
import { createTournament, setMatchScore, bracket } from "../src/engine.js";
test("protected snapshots restore names, scores and winners and never contain the password", async () => {
  let t = createTournament(
    "Taça de testes",
    ["Ana", "Bruno", "Carla", "Daniel"],
    false,
  );
  t = setMatchScore(t, "0:0", [5, 2]);
  const password = "uma-senha-forte-2026";
  const payload = await protectTournament(t, password);
  assert.ok(!payload.includes(password));
  const restored = await unlockTournament(payload, password);
  assert.deepEqual(restored.entrants, t.entrants);
  assert.deepEqual(restored.choices, t.choices);
  assert.equal(bracket(restored).rounds[1].matches[0].players[0], "p1");
  assert.equal(
    accessPayload(`https://example.com/RandomGroup/#torneio=${payload}`),
    payload,
  );
  assert.equal(accessPayload(`RG1.${payload}`), payload);
  await assert.rejects(
    () => unlockTournament(payload, "outra-senha"),
    /Senha incorrecta/,
  );
  const tampered =
    payload.slice(0, 60) +
    (payload[60] === "A" ? "B" : "A") +
    payload.slice(61);
  await assert.rejects(
    () => unlockTournament(tampered, password),
    /Senha incorrecta/,
  );
  await assert.rejects(() => protectTournament(t, "curta"), /8 e 128/);
});
test("large snapshots round-trip all 128 participants and fresh accesses are randomized", async () => {
  const t = createTournament(
    "Taça",
    Array.from({ length: 128 }, (_, i) => `Equipa ${i + 1}`),
    false,
  );
  const a = await protectTournament(t, "senha-para-acesso");
  const b = await protectTournament(t, "senha-para-acesso");
  assert.notEqual(a, b);
  assert.equal(
    (await unlockTournament(a, "senha-para-acesso")).entrants.length,
    128,
  );
  await assert.rejects(
    () => unlockTournament("invalid", "password"),
    /não é válido/,
  );
});
