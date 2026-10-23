import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Shuffle,
  Users,
  SlidersHorizontal,
  Trophy,
  ListOrdered,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Download,
  Upload,
  Check,
  RotateCcw,
  Github,
  Linkedin,
  Sparkles,
  UserRound,
  CheckCircle2,
  Info,
  QrCode,
  Image as ImageIcon,
  LockKeyhole,
  FastForward,
  ShieldCheck,
  Shield,
  Flame,
  Zap,
  Orbit,
  Cat,
  Gamepad2,
  Swords,
  Rocket,
  Leaf,
  Crown,
  Fish,
  Gem,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import {
  shuffle,
  lines,
  uniqueNames,
  makeGroups,
  makeCategoryGroups,
  createTournament,
  bracket,
  chooseWinner,
  setMatchScore,
  validateTournament,
  existingThemeGroups,
  assignThemes,
} from "./engine.js";
import { readDocument } from "./imports.js";
import "./styles.css";
import whatsappIcon from "./assets/whatsapp.png";
import { PWAControls } from "./pwa.jsx";
import { ShareDialog } from "./ShareDialog.jsx";
import { RankBadge } from "./RankBadge.jsx";
import { rankAppearance, RESULT_COLORS } from "./result-identity.js";
import { AppQRCode } from "./AppQRCode.jsx";

const MODES = [
  {
    id: "groups",
    title: "Grupos",
    icon: Users,
    color: "blue",
    description: "Crie equipas equilibradas.",
    detail: "Equipas equilibradas, ao acaso.",
  },
  {
    id: "order",
    title: "Ordem",
    icon: ListOrdered,
    color: "green",
    description: "Sorteie quem vai primeiro.",
    detail: "Uma posição para cada pessoa.",
  },
  {
    id: "themes",
    title: "Temas",
    icon: BookOpen,
    color: "red",
    description: "Um tema para cada grupo.",
    detail: "Grupos e temas num só sorteio.",
  },
  {
    id: "criteria",
    title: "Com critérios",
    icon: SlidersHorizontal,
    color: "purple",
    description: "Misture pessoas com as suas regras.",
    detail: "Cursos, género e o que precisar.",
  },
  {
    id: "tournament",
    title: "Mata-mata",
    icon: Trophy,
    color: "orange",
    description: "Dos confrontos ao campeão.",
    detail: "Confrontos, resultados e campeão.",
  },
];
const SAMPLE =
  "Ana\nBruno\nCarla\nDaniel\nElisa\nFábio\nGraça\nHugo\nInês\nJoão\nLúcia\nMário";
const STORAGE = "randomgroup.tournament.v2";
const makeCategory = (name = "") => ({
  id: crypto.randomUUID(),
  name,
  text: "",
  quota: "",
  rule: "min",
});
function Button({ children, secondary = false, className = "", ...props }) {
  return (
    <button
      className={`button ${secondary ? "secondary" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Logo({ onClick }) {
  return (
    <button
      className="brand"
      onClick={onClick}
      aria-label="RandomGroup — início"
    >
      <span className="logo-symbol">
        <i />
        <i />
        <i />
      </span>
      <span>
        RandomGroup<span className="blue-text">.</span>
      </span>
    </button>
  );
}
function App() {
  const [mode, setMode] = useState(null);
  const [about, setAbout] = useState(false);
  const [restoreKey, setRestoreKey] = useState(0);
  const [access, setAccess] = useState(() => {
    const match = window.location.hash.match(/^#torneio=([A-Za-z0-9_-]+)$/);
    return match ? { payload: match[1], restore: true } : null;
  });
  useEffect(() => {
    const listener = () => {
      const match = window.location.hash.match(/^#torneio=([A-Za-z0-9_-]+)$/);
      if (match) setAccess({ payload: match[1], restore: true });
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const [notice, setNotice] = useState(null);
  const [tournament, updateTournament] = useState(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE) ||
        localStorage.getItem("randgroup.tournament.v1");
      return raw ? validateTournament(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  });
  const notify = (message) => setNotice(message);
  const setTournament = (next) => {
    updateTournament(next);
    try {
      if (next) localStorage.setItem(STORAGE, JSON.stringify(next));
      else localStorage.removeItem(STORAGE);
    } catch {
      notify(
        "O navegador não permitiu guardar. Pode continuar e descarregar o PDF antes de sair.",
      );
    }
  };
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  const goHome = () => {
    setMode(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app">
      <header className="topbar">
        <Logo onClick={goHome} />
        <span className="tagline">Juntos, por acaso.</span>
        <PWAControls />
        <button className="about-button" onClick={() => setAbout(true)}>
          <Info size={17} /> Sobre
        </button>
      </header>
      <main>
        {!mode ? (
          <Home onStart={setMode} />
        ) : (
          <Journey
            key={`${mode}-${restoreKey}`}
            mode={MODES.find((m) => m.id === mode)}
            onHome={goHome}
            notify={notify}
            tournament={tournament}
            setTournament={setTournament}
            onShare={() => setAccess({ restore: false })}
            onRestore={() => setAccess({ restore: true })}
            resumeOnOpen={restoreKey > 0}
          />
        )}
      </main>
      <footer className="footer">
        <span>
          Um pouco de sorte. <strong>Muitas possibilidades.</strong>
        </span>
        <div className="socials">
          <a
            href="https://wa.me/258874544510"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp de Aquilivio"
          >
            <img src={whatsappIcon} alt="" width="20" height="20" />
          </a>
          <a
            href="https://github.com/Aquilivio"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub de Aquilivio"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/aquilivio-maria-cumbe-b2a890289/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn de Aquilivio"
          >
            <Linkedin size={20} />
          </a>
        </div>
        <small>
          © {new Date().getFullYear()} RandomGroup · Aquilivio Maria Cumbe
        </small>
      </footer>
      {notice && (
        <div className="toast" role="alert">
          <Info size={19} />
          <span>{notice}</span>
          <button aria-label="Fechar aviso" onClick={() => setNotice(null)}>
            <X size={17} />
          </button>
        </div>
      )}
      {access && (
        <ShareDialog
          key={access.payload || String(access.restore)}
          tournament={tournament}
          {...access}
          notify={notify}
          onClose={() => {
            setAccess(null);
            if (window.location.hash.startsWith("#torneio="))
              history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
          }}
          onLoad={(incoming) => {
            setTournament(incoming);
            setRestoreKey((v) => v + 1);
            setMode("tournament");
          }}
        />
      )}
      {about && (
        <About
          onClose={() => setAbout(false)}
          onStart={() => {
            setAbout(false);
            goHome();
          }}
        />
      )}
    </div>
  );
}
function Home({ onStart }) {
  return (
    <div className="home page-enter">
      <section className="choose-section" aria-label="Escolha o sorteio">
        <div className="home-heading">
          <h1>
            O que vamos <em>sortear hoje?</em>
            <span className="curious-eyes" aria-hidden="true">
              <svg viewBox="0 0 64 44" fill="none">
                <g
                  className="eye-shapes"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <ellipse cx="19" cy="25" rx="12" ry="15" fill="white" />
                  <ellipse cx="46" cy="25" rx="12" ry="15" fill="white" />
                </g>
                <g className="curious-pupils" fill="currentColor">
                  <ellipse cx="22" cy="26" rx="4.5" ry="7" />
                  <ellipse cx="49" cy="26" rx="4.5" ry="7" />
                </g>
                <path
                  d="M8 7 23 3M38 3l15 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
        </div>
        <div className="mode-grid">
          {MODES.map((m, i) => (
            <article
              className={`mode-card ${m.color}`}
              key={m.id}
              style={{ "--delay": `${i * 90}ms` }}
            >
              <div className="card-top">
                <span className="card-index">0{i + 1}</span>
                {["criteria", "tournament"].includes(m.id) ? (
                  <span className="new-badge">Novo</span>
                ) : (
                  <span className="card-dot" />
                )}
              </div>
              <div className={`mode-art art-${m.id}`} aria-hidden="true">
                <m.icon size={64} strokeWidth={2} />
                <span className="art-orbit orbit-one" />
                <span className="art-orbit orbit-two" />
                <i className="art-mark">{["+", "1", "a", "=", "★"][i]}</i>
              </div>
              <h2>{m.title}</h2>
              <p>{m.description}</p>
              <Button onClick={() => onStart(m.id)}>
                Começar sorteio <ArrowRight size={20} />
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
function NameInput({
  value,
  onChange,
  label = "Participantes",
  placeholder = "Ana\nBruno\nCarla\n…",
  notify,
}) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const text = await readDocument(file);
      onChange(value ? `${value.trim()}\n${text}` : text);
      notify("Texto importado. Reveja a lista e mantenha um nome por linha.");
    } catch (error) {
      notify(error.message || "Não foi possível ler o documento.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="names-input">
      <Field
        label={label}
        hint={
          label === "Temas"
            ? "Um tema por linha. Pode colar uma lista ou importar um documento."
            : "Um nome por linha. Pode colar uma lista ou importar um documento."
        }
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder={placeholder}
          maxLength={60000}
        />
      </Field>
      <div className="input-meta">
        <span>
          {lines(value).length} {label === "Temas" ? "temas" : "participantes"}
        </span>
        <button
          type="button"
          className="text-button"
          disabled={busy}
          onClick={() =>
            onChange(
              label === "Temas"
                ? "Sustentabilidade\nTecnologia\nEmpreendedorismo\nCultura\nSaúde"
                : SAMPLE,
            )
          }
        >
          Usar exemplo <Sparkles size={13} />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.md,.txt"
        onChange={importFile}
        hidden
        disabled={busy}
      />
      <button
        className={`upload-zone ${busy ? "loading" : ""}`}
        type="button"
        disabled={busy}
        onClick={() => fileRef.current.click()}
      >
        <Upload size={20} />
        <span>
          <strong>
            {busy ? "A ler o documento…" : "Trazer de um ficheiro"}
          </strong>
          <small>PDF, Word (.docx), Markdown ou TXT · até 10 MB</small>
        </span>
        <Plus size={18} />
      </button>
    </div>
  );
}
function Journey({
  mode,
  onHome,
  notify,
  tournament,
  setTournament,
  onShare,
  onRestore,
  resumeOnOpen,
}) {
  const [step, setStep] = useState(0);
  const [names, setNames] = useState("");
  const [count, setCount] = useState("");
  const [themes, setThemes] = useState("");
  const [themeMode, setThemeMode] = useState("create");
  const [savedGroups, setSavedGroups] = useState([
    makeCategory(),
    makeCategory(),
  ]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState(true);
  const [criterion, setCriterion] = useState("");
  const [categories, setCategories] = useState([
    makeCategory(),
    makeCategory(),
  ]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [rule, setRule] = useState("mix");
  const [result, setResult] = useState(null);
  const [activeTournament, setActiveTournament] = useState(
    mode.id === "tournament" && !!tournament && resumeOnOpen,
  );
  const [reveal, setReveal] = useState(0);
  const [speed, setSpeed] = useState(650);
  const [exporting, setExporting] = useState("");
  const resultsRef = useRef(null);
  const heading = useRef(null);
  const isCriteria = mode.id === "criteria";
  const usesExistingGroups = mode.id === "themes" && themeMode === "existing";
  const groupCount = usesExistingGroups ? savedGroups.length : Number(count);
  const steps = isCriteria
    ? ["Critério", "Participantes", "Regras", "Rever"]
    : mode.id === "order"
      ? ["Participantes", "Rever"]
      : ["Participantes", "Preferências", "Rever"];
  const showing = !!result || activeTournament;
  const allNames = isCriteria
    ? categories.flatMap((c) => lines(c.text))
    : usesExistingGroups
      ? savedGroups.flatMap((g) => lines(g.text))
      : lines(names);
  const updateCategory = (id, patch) =>
    setCategories((cs) =>
      cs.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  const assignments = result
    ? Array.from(
        { length: Math.max(...result.map((g) => g.members.length)) },
        (_, j) =>
          result.flatMap((g, i) =>
            g.members[j]
              ? [{ group: i, member: j, name: g.members[j].name }]
              : [],
          ),
      ).flat()
    : [];
  const total = result
    ? assignments.length
    : activeTournament
      ? tournament?.entrants.length || 0
      : 0;
  const finished = reveal >= total;
  useEffect(() => {
    if (!showing || reveal >= total) return;
    const timer = setTimeout(() => setReveal((v) => v + 1), speed);
    return () => clearTimeout(timer);
  }, [showing, reveal, total, speed]);
  useEffect(() => {
    heading.current?.focus();
  }, [step, showing, categoryIndex]);
  useEffect(() => {
    if (activeTournament && tournament) setReveal(tournament.entrants.length);
  }, []);
  const errorGuard = (action) => {
    try {
      action();
    } catch (error) {
      notify(error.message);
    }
  };
  const validatePreferences = () => {
    if (mode.id === "groups" || mode.id === "themes") {
      if (usesExistingGroups) existingThemeGroups(savedGroups);
      if (
        !Number.isInteger(groupCount) ||
        groupCount < 1 ||
        groupCount > allNames.length
      )
        throw new Error("Escolha entre 1 grupo e o total de participantes.");
      if (mode.id === "themes") {
        uniqueNames(lines(themes), 1, 500);
        if (lines(themes).length < groupCount)
          throw new Error(
            "Adicione pelo menos um tema diferente para cada grupo.",
          );
      }
    }
    if (mode.id === "tournament" && !title.trim())
      throw new Error("Dê um nome à competição.");
  };
  const next = () =>
    errorGuard(() => {
      if (isCriteria) {
        if (step === 0) {
          if (!criterion.trim())
            throw new Error("Qual é o critério? Por exemplo: Curso ou Género.");
          uniqueNames(
            categories.map((c) => c.name),
            1,
            12,
          );
        }
        if (step === 1) {
          uniqueNames(lines(categories[categoryIndex].text), 1, 500);
          if (categoryIndex < categories.length - 1) {
            setCategoryIndex((i) => i + 1);
            return;
          }
          uniqueNames(allNames, 2, 500);
        }
        if (step === 2) makeCategoryGroups(categories, Number(count), rule);
      } else {
        if (step === 0) {
          if (usesExistingGroups) existingThemeGroups(savedGroups);
          else uniqueNames(allNames, 2, mode.id === "tournament" ? 128 : 500);
        } else validatePreferences();
      }
      setStep((s) => s + 1);
    });
  const back = () => {
    if (isCriteria && step === 1 && categoryIndex > 0)
      setCategoryIndex((i) => i - 1);
    else if (step === 0) onHome();
    else setStep((s) => s - 1);
  };
  const draw = () =>
    errorGuard(() => {
      uniqueNames(
        allNames,
        usesExistingGroups ? 1 : 2,
        mode.id === "tournament" ? 128 : 500,
      );
      if (!isCriteria) validatePreferences();
      if (mode.id === "tournament") {
        const t = { ...createTournament(title, allNames), game };
        setTournament(t);
        setReveal(0);
        setActiveTournament(true);
        return;
      }
      let groups;
      if (isCriteria)
        groups = makeCategoryGroups(categories, Number(count), rule);
      else if (mode.id === "order")
        groups = shuffle(allNames).map((name, i) => ({
          name: `${i + 1}º lugar`,
          members: [{ name, values: [] }],
        }));
      else if (usesExistingGroups) {
        groups = assignThemes(existingThemeGroups(savedGroups), lines(themes));
      } else {
        groups = makeGroups(
          allNames.map((name) => ({ name, values: [] })),
          [],
          Number(count),
        );
        if (mode.id === "themes") {
          groups = assignThemes(groups, lines(themes));
        }
      }
      setReveal(0);
      setResult(groups);
    });
  const downloadResults = async (format) => {
    setExporting(format);
    try {
      const data = {
        title: `Sorteio · ${mode.title}`,
        type: mode.id,
        groups: result,
        subtitle: `${allNames.length} participantes · ${result.length} ${mode.id === "order" ? "posições" : "grupos"}${isCriteria ? ` · ${criterion}: ${rule === "separate" ? "categorias separadas" : "categorias misturadas"}` : ""}${mode.id === "themes" ? ` · ${lines(themes).length} temas disponíveis` : ""}`,
      };
      if (format === "png") {
        const { exportResultsPNG } = await import("./results-export.js");
        const pages = await exportResultsPNG(resultsRef.current, data);
        if (pages > 1)
          notify(
            `${pages} imagens PNG guardadas num ZIP para manter todos os resultados legíveis.`,
          );
      } else {
        const report = await import("./report.js");
        await report.exportReport(data);
      }
    } catch (e) {
      notify(
        e.message ||
          "Não foi possível exportar os resultados. Tente novamente.",
      );
    } finally {
      setExporting("");
    }
  };
  return (
    <div
      className={`journey ${mode.color} ${showing ? "wide" : ""} page-enter`}
    >
      <button className="back-link" onClick={onHome}>
        <ArrowLeft size={16} /> Todos os sorteios
      </button>
      <div className="journey-heading">
        <span className="mode-pill">
          <mode.icon size={16} /> {mode.title}
        </span>
        <h1 tabIndex={-1} ref={heading}>
          {showing
            ? activeTournament
              ? tournament.name
              : finished
                ? "Olha o que o acaso juntou."
                : "A sorte está a juntar as peças…"
            : isCriteria
              ? [
                  "Primeiro, as suas regras.",
                  `Quem faz parte de ${categories[categoryIndex]?.name || "cada categoria"}?`,
                  "Como vamos formar os grupos?",
                  "Tudo pronto para combinar?",
                ][step]
              : step === 0
                ? usesExistingGroups
                  ? "Quais são os grupos?"
                  : "Quem vai participar?"
                : step === steps.length - 1
                  ? "Tudo pronto para o sorteio?"
                  : mode.id === "tournament"
                    ? "Prepare o próximo encontro."
                    : "Dê o seu toque ao sorteio."}
        </h1>
        <p>
          {showing
            ? activeTournament
              ? "Dois lados. Uma final. O próximo campeão está por aqui."
              : finished
                ? "Novos grupos, novas histórias. Agora é com vocês."
                : "Um nome de cada vez. Uma nova possibilidade a cada encontro."
            : step === 0 && !isCriteria
              ? "Comece com os nomes. Nós tratamos do resto."
              : "Uma etapa de cada vez. Simples assim."}
        </p>
      </div>
      {mode.id === "tournament" && (
        <div className="tournament-access">
          {tournament && !activeTournament && (
            <button
              className="resume"
              onClick={() => setActiveTournament(true)}
            >
              <Trophy size={22} />
              <span>
                Continuar <strong>{tournament.name}</strong>
              </span>
              <ArrowRight size={20} />
            </button>
          )}
          <button className="restore-access" onClick={onRestore}>
            <LockKeyhole size={17} /> Abrir torneio com link e senha
          </button>
        </div>
      )}
      {!showing ? (
        <>
          <ol className="stepper" aria-label="Etapas do sorteio">
            {steps.map((s, i) => (
              <li
                key={s}
                className={step === i ? "current" : step > i ? "complete" : ""}
                aria-current={step === i ? "step" : undefined}
              >
                <span>{step > i ? <Check size={13} /> : `0${i + 1}`}</span>
                <small>{s}</small>
              </li>
            ))}
          </ol>
          <form
            className="form-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (step === steps.length - 1) draw();
              else next();
            }}
          >
            <div className="stage-content" key={`${step}-${categoryIndex}`}>
              {isCriteria ? (
                <>
                  {step === 0 && (
                    <>
                      <Field
                        label="O que quer ter em conta?"
                        hint="Pode ser curso, género, nível, turno ou outra característica."
                      >
                        <input
                          value={criterion}
                          maxLength={80}
                          onChange={(e) => setCriterion(e.target.value)}
                          placeholder="Ex.: Curso"
                        />
                      </Field>
                      <div className="preset-row">
                        <button
                          type="button"
                          onClick={() => {
                            setCriterion("Curso");
                            setCategories([
                              makeCategory("TEO"),
                              makeCategory("EIT"),
                              makeCategory("Agro"),
                            ]);
                            setCategoryIndex(0);
                          }}
                        >
                          Cursos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCriterion("Género");
                            setCategories([
                              makeCategory("Mulheres"),
                              makeCategory("Homens"),
                            ]);
                            setCategoryIndex(0);
                          }}
                        >
                          Mulheres e homens
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCriterion("Categoria");
                            setCategories([makeCategory("")]);
                            setCategoryIndex(0);
                          }}
                        >
                          Personalizar
                        </button>
                      </div>
                      <div className="field">
                        <span>Quais são as categorias?</span>
                        <small>
                          Na próxima etapa, adicione os nomes de cada categoria.
                        </small>
                      </div>
                      <div className="category-fields">
                        {categories.map((c, i) => (
                          <div className="category-name" key={c.id}>
                            <span>0{i + 1}</span>
                            <input
                              aria-label={`Nome da categoria ${i + 1}`}
                              value={c.name}
                              maxLength={80}
                              placeholder={`Ex.: ${["TEO", "EIT", "Agro"][i % 3]}`}
                              onChange={(e) =>
                                updateCategory(c.id, { name: e.target.value })
                              }
                            />
                            <button
                              type="button"
                              disabled={categories.length === 1}
                              aria-label={`Remover categoria ${i + 1}`}
                              onClick={() =>
                                setCategories((cs) =>
                                  cs.filter((x) => x.id !== c.id),
                                )
                              }
                            >
                              <X size={17} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        disabled={categories.length >= 12}
                        onClick={() =>
                          setCategories((cs) => [...cs, makeCategory()])
                        }
                      >
                        <Plus size={16} /> Adicionar categoria
                      </button>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="category-progress">
                        Categoria {categoryIndex + 1} de {categories.length}
                        <span>
                          {criterion} / {categories[categoryIndex].name}
                        </span>
                      </div>
                      <NameInput
                        label={`Participantes · ${categories[categoryIndex].name}`}
                        value={categories[categoryIndex].text}
                        onChange={(text) =>
                          updateCategory(categories[categoryIndex].id, { text })
                        }
                        notify={notify}
                      />
                      <div className="hint-note">
                        <Info size={17} /> Cada pessoa deve aparecer numa única
                        categoria.
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Field label="Quantos grupos quer criar?">
                        <input
                          type="number"
                          min="1"
                          max={allNames.length}
                          placeholder="Ex.: 5"
                          value={count}
                          onChange={(e) => setCount(e.target.value)}
                        />
                      </Field>
                      <Field
                        label={`Como distribuir ${criterion.toLowerCase()}?`}
                      >
                        <select
                          value={rule}
                          onChange={(e) => setRule(e.target.value)}
                        >
                          <option value="mix">
                            Misturar categorias nos grupos
                          </option>
                          <option value="separate">
                            Um grupo só com pessoas da mesma categoria
                          </option>
                        </select>
                      </Field>
                      {rule === "mix" ? (
                        <>
                          <div className="field">
                            <span>
                              Quantas pessoas de cada categoria por grupo?
                            </span>
                            <small>
                              Deixe em branco para equilibrar automaticamente.
                              “Pelo menos” distribui também as pessoas
                              restantes.
                            </small>
                          </div>
                          <div className="quotas">
                            {categories.map((c) => (
                              <div className="quota-row" key={c.id}>
                                <div>
                                  <strong>{c.name}</strong>
                                  <small>
                                    {lines(c.text).length} pessoas disponíveis
                                  </small>
                                </div>
                                <select
                                  aria-label={`Regra para ${c.name}`}
                                  value={c.rule}
                                  onChange={(e) =>
                                    updateCategory(c.id, {
                                      rule: e.target.value,
                                    })
                                  }
                                >
                                  <option value="min">Pelo menos</option>
                                  <option value="exact">Exatamente</option>
                                </select>
                                <input
                                  type="number"
                                  aria-label={`Pessoas de ${c.name} por grupo`}
                                  placeholder="Auto"
                                  min="0"
                                  max="500"
                                  value={c.quota}
                                  onChange={(e) =>
                                    updateCategory(c.id, {
                                      quota: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                          <div className="hint-note">
                            <CheckCircle2 size={18} /> Exemplo: 5 grupos com 1
                            TEO, 1 Agro e 3 EIT precisam de 5 TEO, 5 Agro e 15
                            EIT.
                          </div>
                        </>
                      ) : (
                        <div className="hint-note">
                          <Users size={18} /> As categorias ficam separadas. O
                          total de grupos é distribuído pelas categorias sem
                          deixar ninguém de fora.
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {step === 0 && mode.id === "themes" && (
                    <div
                      className="choice-grid theme-mode-choice"
                      aria-label="Forma de sortear temas"
                    >
                      <button
                        type="button"
                        className={themeMode === "create" ? "selected" : ""}
                        aria-pressed={themeMode === "create"}
                        onClick={() => setThemeMode("create")}
                      >
                        <Shuffle />
                        <strong>Formar grupos e sortear temas</strong>
                        <small>Adicione os participantes numa só lista.</small>
                      </button>
                      <button
                        type="button"
                        className={themeMode === "existing" ? "selected" : ""}
                        aria-pressed={themeMode === "existing"}
                        onClick={() => setThemeMode("existing")}
                      >
                        <Users />
                        <strong>Os grupos já existem</strong>
                        <small>
                          Mantenha os membros juntos e sorteie os temas.
                        </small>
                      </button>
                    </div>
                  )}
                  {step === 0 && usesExistingGroups && (
                    <div className="existing-groups-editor">
                      <div
                        className="group-tabs"
                        aria-label="Grupos existentes"
                      >
                        {savedGroups.map((g, i) => (
                          <button
                            key={g.id}
                            type="button"
                            className={groupIndex === i ? "selected" : ""}
                            aria-pressed={groupIndex === i}
                            onClick={() => setGroupIndex(i)}
                          >
                            {g.name.trim() || `Grupo ${i + 1}`}
                          </button>
                        ))}
                      </div>
                      <Field label="Nome do grupo">
                        <input
                          value={savedGroups[groupIndex].name}
                          maxLength={100}
                          placeholder={`Grupo ${groupIndex + 1}`}
                          onChange={(e) =>
                            setSavedGroups((gs) =>
                              gs.map((g, i) =>
                                i === groupIndex
                                  ? { ...g, name: e.target.value }
                                  : g,
                              ),
                            )
                          }
                        />
                      </Field>
                      <NameInput
                        label="Membros do grupo"
                        value={savedGroups[groupIndex].text}
                        onChange={(text) =>
                          setSavedGroups((gs) =>
                            gs.map((g, i) =>
                              i === groupIndex ? { ...g, text } : g,
                            ),
                          )
                        }
                        placeholder={"Ana\nPaulo\nJoão"}
                        notify={notify}
                      />
                      <div className="group-editor-actions">
                        <button
                          type="button"
                          className="text-button"
                          disabled={savedGroups.length >= 500}
                          onClick={() => {
                            setSavedGroups((gs) => [...gs, makeCategory()]);
                            setGroupIndex(savedGroups.length);
                          }}
                        >
                          <Plus size={17} /> Adicionar grupo
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          disabled={savedGroups.length === 1}
                          onClick={() => {
                            setSavedGroups((gs) =>
                              gs.filter((_, i) => i !== groupIndex),
                            );
                            setGroupIndex((i) => Math.max(0, i - 1));
                          }}
                        >
                          <X size={17} /> Remover este grupo
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 0 && !usesExistingGroups && (
                    <NameInput
                      value={names}
                      onChange={setNames}
                      notify={notify}
                    />
                  )}
                  {step === 1 && mode.id !== "order" && (
                    <>
                      {mode.id === "tournament" ? (
                        <>
                          <Field label="Nome da competição">
                            <input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              maxLength={100}
                              placeholder="Ex.: Taça da turma"
                            />
                          </Field>
                          <div className="field">
                            <span>Como vamos decidir o vencedor?</span>
                          </div>
                          <div className="choice-grid">
                            <button
                              type="button"
                              className={game ? "selected" : ""}
                              onClick={() => setGame(true)}
                            >
                              <Trophy />
                              <strong>Com resultados</strong>
                              <small>Introduza o placar de cada jogo.</small>
                            </button>
                            <button
                              type="button"
                              className={!game ? "selected" : ""}
                              onClick={() => setGame(false)}
                            >
                              <UserRound />
                              <strong>Escolher vencedor</strong>
                              <small>Clique em quem avança.</small>
                            </button>
                          </div>
                          <div className="hint-note">
                            <Info size={17} /> Sem adversário? A pessoa ou
                            equipa passa automaticamente à fase seguinte.
                          </div>
                        </>
                      ) : (
                        <>
                          {!usesExistingGroups && (
                            <Field
                              label="Número de grupos"
                              hint="Os participantes serão distribuídos com tamanhos equilibrados."
                            >
                              <div className="number-input">
                                <input
                                  type="number"
                                  min="1"
                                  max={allNames.length}
                                  placeholder="Ex.: 5"
                                  value={count}
                                  onChange={(e) => setCount(e.target.value)}
                                />
                                <span>grupos</span>
                              </div>
                            </Field>
                          )}
                          {usesExistingGroups && (
                            <p className="hint-note">
                              <Users size={18} /> {savedGroups.length} grupos já
                              formados. Os membros ficam juntos.
                            </p>
                          )}
                          {mode.id === "themes" && (
                            <NameInput
                              label="Temas"
                              placeholder={
                                "Sustentabilidade\nTecnologia\nEmpreendedorismo\n…"
                              }
                              value={themes}
                              onChange={setThemes}
                              notify={notify}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              {step === steps.length - 1 && (
                <div className="review">
                  <span className="review-icon">
                    <Sparkles size={28} />
                  </span>
                  <h2>Um último olhar antes do acaso.</h2>
                  <div className="review-stats">
                    <div>
                      <strong>{allNames.length}</strong>
                      <span>participantes</span>
                    </div>
                    <div>
                      <strong>
                        {mode.id === "order"
                          ? allNames.length
                          : mode.id === "tournament"
                            ? "1"
                            : groupCount}
                      </strong>
                      <span>
                        {mode.id === "order"
                          ? "posições"
                          : mode.id === "tournament"
                            ? "campeão"
                            : "grupos"}
                      </span>
                    </div>
                  </div>
                  {isCriteria ? (
                    <div className="review-categories">
                      {categories.map((c) => (
                        <div key={c.id}>
                          <strong>{c.name}</strong>
                          <span>
                            {lines(c.text).length} pessoas
                            {rule === "mix" && c.quota !== ""
                              ? ` · ${c.rule === "exact" ? "exatamente" : "pelo menos"} ${c.quota} por grupo`
                              : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : usesExistingGroups ? (
                    <div className="review-categories">
                      {savedGroups.map((g, i) => (
                        <div key={g.id}>
                          <strong>{g.name.trim() || `Grupo ${i + 1}`}</strong>
                          <span>{lines(g.text).join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="name-chips">
                      {allNames.slice(0, 16).map((n) => (
                        <span key={n}>{n}</span>
                      ))}
                      {allNames.length > 16 && (
                        <span>+{allNames.length - 16}</span>
                      )}
                    </div>
                  )}
                  {mode.id === "themes" && (
                    <p>
                      {lines(themes).length} temas disponíveis · {groupCount}{" "}
                      serão atribuídos.
                    </p>
                  )}
                  {mode.id === "tournament" && (
                    <p>
                      {title} ·{" "}
                      {game ? "Resultados por jogo" : "Escolha de vencedor"}
                    </p>
                  )}
                  <p className="review-note">
                    <ShieldCheck size={16} /> Sorteio local com aleatoriedade do
                    navegador.
                  </p>
                </div>
              )}
            </div>
            <div className="form-actions">
              <Button type="button" secondary onClick={back}>
                <ArrowLeft size={16} /> Voltar
              </Button>
              <Button type="submit">
                {step === steps.length - 1 ? (
                  <>
                    <Shuffle size={17} /> Fazer o sorteio
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          {!finished && (
            <div className="draw-progress">
              <div className="draw-live" aria-live="polite">
                <span className="spinner" />
                <span>
                  {result
                    ? reveal
                      ? `${assignments[reveal - 1]?.name} encontrou o seu lugar`
                      : "A misturar os nomes…"
                    : "A sortear os confrontos…"}
                </span>
                <small>
                  {reveal}/{total}
                </small>
              </div>
              <div className="progress-track">
                <span
                  style={{ width: `${(100 * reveal) / Math.max(total, 1)}%` }}
                />
              </div>
              <div className="reveal-controls">
                <button
                  onClick={() => setSpeed((s) => (s === 650 ? 150 : 650))}
                >
                  {speed === 650 ? "Acelerar" : "Velocidade normal"}
                </button>
                <button onClick={() => setReveal(total)}>
                  <FastForward size={14} /> Mostrar tudo
                </button>
              </div>
            </div>
          )}
          {activeTournament ? (
            <Tournament
              tournament={tournament}
              setTournament={setTournament}
              notify={notify}
              reveal={reveal}
              finished={finished}
              onShare={onShare}
            />
          ) : (
            <div
              ref={resultsRef}
              className={`results-grid ${mode.id === "order" ? "order-results" : ""}`}
            >
              {result.map((g, i) => (
                <article
                  className="result-card"
                  key={i}
                  style={{
                    "--accent":
                      mode.id === "order"
                        ? rankAppearance(i).color
                        : RESULT_COLORS[i % RESULT_COLORS.length],
                  }}
                >
                  <header>
                    {mode.id === "order" ? (
                      <RankBadge index={i} />
                    ) : (
                      <span className="result-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <h2>{g.name}</h2>
                    {mode.id !== "order" && <Users size={18} />}
                  </header>
                  {g.theme && (
                    <div className="theme-label">
                      <BookOpen size={15} /> {g.theme}
                    </div>
                  )}
                  <div className="members">
                    {g.members.map((p, j) => {
                      const index = assignments.findIndex(
                        (a) => a.group === i && a.member === j,
                      );
                      return reveal > index ? (
                        <div className="member reveal-pop" key={p.name}>
                          <span className="member-avatar">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{p.name}</strong>
                            {p.values.length > 0 && (
                              <small>{p.values.join(" · ")}</small>
                            )}
                          </div>
                          <Check size={14} />
                        </div>
                      ) : (
                        <div className="member-placeholder" key={p.name}>
                          <span />
                          <i />
                        </div>
                      );
                    })}
                  </div>
                  <small className="result-count">
                    {g.members.length}{" "}
                    {g.members.length === 1 ? "pessoa" : "pessoas"}
                  </small>
                </article>
              ))}
            </div>
          )}
          {finished && (
            <div className="result-actions page-enter">
              {!activeTournament && (
                <>
                  <Button
                    onClick={() => downloadResults("pdf")}
                    disabled={!!exporting}
                  >
                    <Download size={17} />
                    {exporting === "pdf"
                      ? "A preparar PDF…"
                      : "Descarregar PDF"}
                  </Button>
                  <Button
                    secondary
                    onClick={() => downloadResults("png")}
                    disabled={!!exporting}
                  >
                    <ImageIcon size={17} />
                    {exporting === "png"
                      ? "A preparar PNG…"
                      : "Descarregar PNG"}
                  </Button>
                </>
              )}
              {activeTournament ? (
                <Button
                  secondary
                  onClick={() => {
                    setActiveTournament(false);
                    setStep(0);
                  }}
                >
                  <Plus size={16} /> Novo torneio
                </Button>
              ) : (
                <>
                  <Button secondary onClick={draw} disabled={!!exporting}>
                    <RotateCcw size={16} /> Sortear novamente
                  </Button>
                  <button
                    className="text-button"
                    disabled={!!exporting}
                    onClick={() => {
                      setResult(null);
                      setStep(0);
                    }}
                  >
                    Editar participantes
                  </button>
                </>
              )}
            </div>
          )}
          {activeTournament && (
            <p className="saved-note">
              <ShieldCheck size={14} /> O torneio fica guardado automaticamente
              neste navegador.
            </p>
          )}
        </>
      )}
    </div>
  );
}
function Tournament({
  tournament,
  setTournament,
  notify,
  reveal,
  finished,
  onShare,
}) {
  const state = bracket(tournament);
  const mapRef = useRef(null);
  const sectionRef = useRef(null);
  const [exportingMap, setExportingMap] = useState("");
  const downloadMap = async (format) => {
    setExportingMap(format);
    try {
      const { exportTournamentMap } = await import("./map-export.js");
      await exportTournamentMap(sectionRef.current, tournament, format);
    } catch (error) {
      notify(error.message || "Não foi possível exportar o mapa.");
    } finally {
      setExportingMap("");
    }
  };
  const players = Object.fromEntries(
    tournament.entrants.map((p) => [p.id, p.name]),
  );
  const [history, setHistory] = useState([]);
  const [revision, setRevision] = useState(0);
  const game = tournament.game !== false;
  const update = (fn) => {
    try {
      const next = fn();
      setHistory((h) => [...h.slice(-29), tournament]);
      setTournament(next);
    } catch (e) {
      notify(e.message);
    }
  };
  const renderMatch = (match, index, round) => (
    <Match
      key={match.id + match.signature + revision}
      match={match}
      players={players}
      game={game}
      visible={round > 0 || reveal > index * 2}
      locked={!finished}
      onWinner={(id) => update(() => chooseWinner(tournament, match.id, id))}
      onScore={(scores) =>
        update(() => setMatchScore(tournament, match.id, scores))
      }
    />
  );
  const sides = state.rounds.slice(0, -1);
  return (
    <>
      <section className="tournament-section" ref={sectionRef}>
        <div className="tournament-tools">
          <span>
            <span className="tiny-dot" />
            {state.champion
              ? "Temos campeão!"
              : game
                ? "Indique o resultado para avançar o vencedor."
                : "Clique em quem avança para a próxima fase."}
          </span>
          <button
            className="text-button"
            disabled={!history.length}
            onClick={() => {
              setTournament(history[history.length - 1]);
              setHistory((h) => h.slice(0, -1));
              setRevision((v) => v + 1);
            }}
          >
            <RotateCcw size={15} /> Desfazer
          </button>
        </div>
        <div
          className="bracket-scroll"
          tabIndex={0}
          aria-label="Quadro do torneio. Deslize para ver os dois lados."
        >
          <div className="bracket-map" ref={mapRef}>
            <MapConnections
              mapRef={mapRef}
              tournament={tournament}
              reveal={reveal}
            />
            <div className="bracket-side left-side">
              {sides.map((r, ri) => (
                <section className="round" key={ri}>
                  <h3>{r.name}</h3>
                  <div className="round-matches">
                    {r.matches
                      .slice(0, Math.ceil(r.matches.length / 2))
                      .map((m, i) => renderMatch(m, i, ri))}
                  </div>
                </section>
              ))}
            </div>
            <div className="bracket-final">
              <span className={`final-trophy ${state.champion ? "won" : ""}`}>
                <Trophy size={36} />
              </span>
              <span className="eyebrow">A GRANDE FINAL</span>
              {state.rounds
                .at(-1)
                .matches.map((m) => renderMatch(m, 0, state.rounds.length - 1))}
              {state.champion && (
                <div className="champion reveal-pop" role="status">
                  <PlayerBadge id={state.champion} />
                  <small>CAMPEÃO</small>
                  <strong>{players[state.champion]}</strong>
                  <span>Um caminho. Uma conquista.</span>
                </div>
              )}
            </div>
            <div className="bracket-side right-side">
              {[...sides].reverse().map((r, reverseIndex) => {
                const ri = sides.length - 1 - reverseIndex;
                const offset = Math.ceil(r.matches.length / 2);
                return (
                  <section className="round" key={ri}>
                    <h3>{r.name}</h3>
                    <div className="round-matches">
                      {r.matches
                        .slice(offset)
                        .map((m, i) => renderMatch(m, i + offset, ri))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
        <p className="bracket-hint">
          Os dois lados encontram-se na final. Em ecrãs pequenos, deslize o
          quadro na horizontal.
        </p>
      </section>
      {finished && (
        <div className="map-actions">
          <Button disabled={!!exportingMap} onClick={() => downloadMap("png")}>
            <ImageIcon size={18} />
            {exportingMap === "png"
              ? "A gerar imagem…"
              : "Descarregar mapa PNG"}
          </Button>
          <Button
            secondary
            disabled={!!exportingMap}
            onClick={() => downloadMap("pdf")}
          >
            <Download size={18} />
            {exportingMap === "pdf" ? "A gerar PDF…" : "Mapa em PDF horizontal"}
          </Button>
          <Button secondary onClick={onShare}>
            <QrCode size={18} /> Acesso com senha / QR
          </Button>
        </div>
      )}
    </>
  );
}
const TEAM_ICONS = [
  Shield,
  Flame,
  Zap,
  Orbit,
  Cat,
  Gamepad2,
  Swords,
  Rocket,
  Leaf,
  Crown,
  Fish,
  Gem,
];
const TEAM_COLORS = [
  "#1557e8",
  "#ab3abd",
  "#cb4b0c",
  "#008575",
  "#6740d6",
  "#c72e65",
  "#206d9b",
];
function PlayerBadge({ id, winner = false, eliminated = false }) {
  const n = id ? Number(id.replace(/\D/g, "")) - 1 : 0;
  const Icon = id ? TEAM_ICONS[n % TEAM_ICONS.length] : CircleHelp;
  return (
    <span
      className={`player-icon ${winner ? "badge-winner" : ""} ${eliminated ? "badge-eliminated" : ""}`}
      style={{
        "--team-color": id ? TEAM_COLORS[n % TEAM_COLORS.length] : "#8793a8",
      }}
    >
      <Icon size={26} strokeWidth={2.1} />
      {winner && (
        <span className="player-outcome">
          <Check size={17} strokeWidth={3.5} />
        </span>
      )}
      {eliminated && (
        <span className="player-outcome">
          <X size={22} strokeWidth={3.5} />
        </span>
      )}
    </span>
  );
}
function MapConnections({ mapRef, tournament, reveal }) {
  const [layout, setLayout] = useState({ width: 0, height: 0, paths: [] });
  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let frame;
    const measure = () => {
      const box = map.getBoundingClientRect();
      const nodes = new Map(
        [...map.querySelectorAll("[data-match-id]")].map((el) => [
          el.dataset.matchId,
          el.getBoundingClientRect(),
        ]),
      );
      const state = bracket(tournament);
      const paths = state.rounds.slice(0, -1).flatMap((r, ri) =>
        r.matches.flatMap((m, mi) => {
          const source = nodes.get(m.id),
            target = nodes.get(`${ri + 1}:${Math.floor(mi / 2)}`);
          if (!source || !target) return [];
          const direction = source.x < target.x ? 1 : -1;
          const x1 = (direction === 1 ? source.right : source.left) - box.left;
          const x2 = (direction === 1 ? target.left : target.right) - box.left;
          const y1 = source.top + source.height / 2 - box.top;
          const y2 = target.top + target.height / 2 - box.top;
          const middle = x1 + (x2 - x1) / 2;
          return [
            {
              id: m.id,
              d: `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2 - direction * 5} ${y2}`,
              active: !!m.winner,
            },
          ];
        }),
      );
      setLayout({ width: box.width, height: box.height, paths });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(map);
    map
      .querySelectorAll("[data-match-id]")
      .forEach((el) => observer.observe(el));
    schedule();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [tournament, reveal]);
  return (
    <svg
      className="map-connections"
      viewBox={`0 0 ${layout.width || 1} ${layout.height || 1}`}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="route-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 5 3 L 0 6"
            fill="none"
            stroke="#a1b1ca"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="route-arrow-active"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M 0 0 L 5 3 L 0 6"
            fill="none"
            stroke="#16804a"
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      {layout.paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          className={p.active ? "route active" : "route"}
          markerEnd={`url(#route-arrow${p.active ? "-active" : ""})`}
        />
      ))}
    </svg>
  );
}
function Match({ match, players, game, visible, locked, onWinner, onScore }) {
  const [scores, setScores] = useState(match.scores || ["", ""]);
  const available = !match.bye && match.players.every(Boolean) && !locked;
  return (
    <article
      data-match-id={match.id}
      className={`match ${match.winner ? "decided" : ""} ${visible ? "reveal-pop" : "unrevealed"}`}
    >
      <div className="match-status">
        <span>JOGO {Number(match.id.split(":")[1]) + 1}</span>
        <span>
          {match.bye
            ? "PASSAGEM DIRETA"
            : match.winner
              ? "CONCLUÍDO"
              : match.players.every(Boolean)
                ? "A JOGAR"
                : "AGUARDA VENCEDORES"}
        </span>
      </div>
      {match.players.map((id, i) => {
        const winner = !!id && match.winner === id;
        const eliminated = !!id && !!match.winner && match.winner !== id;
        return (
          <div
            className={`competitor ${winner ? "winner" : ""} ${eliminated ? "eliminated" : ""}`}
            key={i}
          >
            <button
              disabled={!available || game}
              aria-label={`Escolher ${players[id] || "participante por definir"} como vencedor`}
              aria-pressed={winner}
              onClick={() => onWinner(winner ? null : id)}
            >
              <PlayerBadge id={id} winner={winner} eliminated={eliminated} />
              <span className="player-name">
                <strong>
                  {id
                    ? players[id]
                    : match.bye
                      ? "Sem adversário"
                      : "A definir"}
                </strong>
                {winner && (
                  <small>
                    <Check size={12} /> Avança
                  </small>
                )}
                {eliminated && (
                  <small>
                    <X size={12} /> Eliminado
                  </small>
                )}
              </span>
            </button>
            {game && (
              <input
                aria-label={`Resultado de ${players[id] || `participante ${i + 1}`} no jogo ${match.id}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="999"
                disabled={!available}
                value={scores[i]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value !== "" &&
                    (!Number.isInteger(Number(value)) ||
                      Number(value) < 0 ||
                      Number(value) > 999)
                  )
                    return;
                  const next = [...scores];
                  next[i] = value;
                  setScores(next);
                  if (
                    next.every((s) => s !== "") &&
                    Number(next[0]) !== Number(next[1])
                  )
                    onScore(next.map(Number));
                  else if (match.winner) onWinner(null);
                }}
              />
            )}
          </div>
        );
      })}
      {game &&
        available &&
        scores.every((s) => s !== "") &&
        Number(scores[0]) === Number(scores[1]) && (
          <small className="tie-note">
            Empate: indique o resultado após o desempate.
          </small>
        )}
    </article>
  );
}
const ABOUT_CARDS = [
  {
    nav: "a origem",
    icon: Heart,
    color: "blue",
    label: "A HISTÓRIA POR TRÁS DO PROJETO",
    title: "Por que criei o RandomGroup?",
    paragraphs: [
      "Sou o representante da minha turma e, muitas vezes, fico responsável por formar grupos para trabalhos e actividades. Ao fazer isso manualmente, alguns colegas queriam ficar com determinados amigos; outros achavam que eu estava a favorecer alguém. Uma tarefa simples acabava em discussões.",
      "Foi para resolver essa situação que criei o RandTeam: deixar o acaso formar as equipas, de forma transparente, sem escolhas pessoais. Assim, todos têm a mesma oportunidade de participar e conhecer outros colegas.",
      "O RandomGroup é a evolução dessa ideia. Agora também permite sortear a ordem, distribuir temas, respeitar critérios e acompanhar torneios. A intenção continua a mesma: menos conflitos, mais tempo para fazer coisas juntos.",
    ],
    example:
      "Uma turma, várias personalidades e um trabalho para fazer. Em vez de escolher os amigos, cada pessoa descobre o seu grupo durante o sorteio.",
  },
  {
    nav: "Grupos",
    icon: Users,
    color: "blue",
    label: "01 · GRUPOS",
    title: "Novas equipas, as mesmas oportunidades.",
    paragraphs: [
      "Para trabalhos de turma, actividades, dinâmicas e encontros. O sorteio mistura os participantes e forma equipas equilibradas, sem preferências.",
    ],
    steps: [
      "Escreva ou importe os nomes, um por linha. Use apelidos para distinguir pessoas com nomes iguais.",
      "Escolha quantos grupos quer criar e reveja a lista antes de continuar.",
      "Acompanhe os nomes a entrar nos grupos, um de cada vez. Todos participam uma vez; os tamanhos diferem no máximo em uma pessoa.",
      "Descarregue o PDF com os grupos e os membros para guardar ou partilhar.",
    ],
    example:
      "23 participantes em 5 grupos: três grupos de 5 e dois de 4. Entre 2 e 500 participantes.",
  },
  {
    nav: "Ordem",
    icon: ListOrdered,
    color: "green",
    label: "02 · ORDEM",
    title: "Quem apresenta primeiro?",
    paragraphs: [
      "Quando é preciso decidir a sequência de apresentações, jogos ou tarefas, o RandomGroup atribui uma posição diferente a cada participante.",
    ],
    steps: [
      "Adicione as pessoas ou equipas. Pode colar texto ou importar PDF, Word, Markdown e TXT.",
      "Confirme a lista e faça o sorteio. Não precisa de definir grupos.",
      "Veja a sequência ser revelada, do primeiro ao último. Nenhum nome se repete ou fica de fora.",
      "Guarde a ordem completa num PDF com a assinatura do criador.",
    ],
    example:
      "Uma apresentação com 12 estudantes recebe 12 posições únicas. O primeiro e o último lugar são definidos pelo mesmo sorteio.",
  },
  {
    nav: "Temas",
    icon: BookOpen,
    color: "red",
    label: "03 · TEMAS",
    title: "Uma equipa. Um tema. Uma nova ideia.",
    paragraphs: [
      "Organize trabalhos, feiras de ciências e projectos. Pode formar grupos e distribuir temas no mesmo sorteio, ou usar grupos já formados e sortear apenas os temas. Cada grupo recebe um tema diferente.",
    ],
    steps: [
      "Escolha entre formar novos grupos ou manter os grupos existentes. Para grupos existentes, registe o nome e os membros de cada um; essas pessoas ficam juntas.",
      "Adicione os temas, um por linha. Precisa de pelo menos um tema por grupo.",
      "Ao formar novos grupos, introduza os participantes e escolha o número de grupos. O sorteio equilibra as equipas. Em ambas as opções, atribui temas ao acaso; os temas que sobrarem não são usados.",
      "Acompanhe a formação dos grupos e descarregue o PDF com temas e membros.",
    ],
    example:
      "20 estudantes, 4 grupos e 4 temas: Energia Solar, Reciclagem, Água e Agricultura. Cada equipa fica com 5 pessoas e um tema único.",
  },
  {
    nav: "Com critérios",
    icon: SlidersHorizontal,
    color: "purple",
    label: "04 · COM CRITÉRIOS · NOVO",
    title: "O acaso respeita as suas regras.",
    paragraphs: [
      "Nem todos os grupos precisam de ser totalmente livres. Defina um critério — curso, género, turno ou nível — e introduza os participantes de cada categoria em etapas separadas.",
    ],
    steps: [
      "Dê nome ao critério e às categorias. Depois, preencha os nomes de uma categoria de cada vez.",
      "Escolha o total de grupos e se quer misturar as categorias ou manter cada grupo numa só categoria.",
      "Ao misturar, defina “Pelo menos” ou “Exatamente” quantas pessoas de cada categoria devem entrar em cada grupo. Em automático, a distribuição equilibra as categorias.",
      "O sorteio verifica as quantidades antes de começar. Se uma regra for impossível, explica quantas pessoas faltam.",
    ],
    example:
      "5 TEO + 5 Agro + 15 EIT, em 5 grupos: exactamente 1 TEO, 1 Agro e 3 EIT em cada um. Para misturar mulheres e homens, pode pedir pelo menos uma mulher por grupo.",
  },
  {
    nav: "Mata-mata",
    icon: Trophy,
    color: "orange",
    label: "05 · MATA-MATA · NOVO",
    title: "Cada vitória abre um novo caminho.",
    paragraphs: [
      "De 2 a 128 pessoas ou equipas num mapa de jogos. Os dois lados avançam até se encontrarem na final. Cada participante tem uma cor e um símbolo que o acompanham entre fases.",
    ],
    steps: [
      "Adicione os participantes, dê nome à competição e escolha entre placar ou selecção manual de vencedor.",
      "Preencha o resultado de cada jogo. Um 5–2 faz o participante com 5 avançar automaticamente; empates pedem desempate.",
      "Quem avança fica verde com um visto. Quem perde fica assinalado com um X. Sem adversário, a passagem é directa.",
      "Pode corrigir resultados e desfazer alterações. Exporte o mapa completo em PNG ou PDF horizontal. O acesso com senha e QR code permite abrir uma cópia noutro dispositivo; depois de editar, gere outro acesso para levar os resultados novos.",
    ],
    example:
      "8 equipas → quartos de final → semifinais → final. Em ecrãs pequenos, deslize o mapa para explorar os dois lados.",
  },
  {
    nav: "PDF e instalação",
    icon: Download,
    color: "green",
    label: "GUARDAR, PARTILHAR E LEVAR CONSIGO",
    title: "Do navegador para o seu dia a dia.",
    paragraphs: [
      "Importe listas em PDF, DOCX, Markdown ou TXT com até 10 MB. Reveja o texto extraído antes do sorteio; PDFs digitalizados sem texto precisam de transcrição.",
      "Guarde grupos, ordem, temas e critérios em PDF ou PNG. O PDF usa duas colunas compactas; o PNG mantém os cards dos resultados. Listas grandes geram várias imagens num ZIP. O mata-mata é exportado como mapa completo em PNG ou PDF horizontal. Todos incluem data, QR code do app e a assinatura “Created & Designed by Aquilivio Maria”.",
      "Instale o RandomGroup no telemóvel pelo botão Instalar quando estiver disponível. No iPhone, use Partilhar → Adicionar ao ecrã principal. Depois do primeiro carregamento completo, os recursos da aplicação ficam disponíveis offline.",
      "Os nomes são processados no dispositivo. O torneio fica guardado neste navegador; limpar os dados do site elimina essa cópia. Os restantes resultados devem ser guardados em PDF antes de sair.",
    ],
  },
];
function About({ onClose, onStart }) {
  const close = useRef(null);
  const [open, setOpen] = useState(0);
  useLayoutEffect(() => {
    if (open !== null)
      document
        .getElementById(`faq-question-${open}`)
        ?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [open]);
  useEffect(() => {
    const previous = document.activeElement;
    close.current?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const controls = [
          ...close.current
            .closest("[role=dialog]")
            .querySelectorAll("button,a[href]"),
        ].filter((el) => !el.disabled && el.offsetParent !== null);
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const questions = [
    "Por que criei o RandomGroup?",
    "Como funciona o sorteio de grupos?",
    "Como sortear a ordem?",
    "Como distribuir os temas?",
    "Como funcionam os critérios?",
    "Como funciona o mata-mata?",
    "Como guardar resultados e instalar a aplicação?",
  ];
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="about-modal faq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <button
          className="close-modal"
          ref={close}
          aria-label="Fechar Sobre"
          onClick={onClose}
        >
          <X />
        </button>
        <header className="faq-header">
          <h2 id="about-title">Sobre o RandomGroup</h2>
          <p>Juntos, por acaso.</p>
        </header>
        <div className="faq-list">
          {ABOUT_CARDS.map((card, i) => (
            <section
              className={`faq-item ${open === i ? "expanded" : ""}`}
              key={card.nav}
            >
              <h3>
                <button
                  aria-expanded={open === i}
                  aria-controls={`faq-content-${i}`}
                  id={`faq-question-${i}`}
                  onClick={() =>
                    setOpen((current) => (current === i ? null : i))
                  }
                >
                  {questions[i]}
                  <ChevronRight size={20} />
                </button>
              </h3>
              {open === i && (
                <div
                  id={`faq-content-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className="faq-content"
                >
                  {card.paragraphs.map((text, j) => (
                    <p key={j}>{text}</p>
                  ))}
                  {card.steps && (
                    <ol>
                      {card.steps.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {card.example && (
                    <p className="faq-example">
                      <strong>Exemplo: </strong>
                      {card.example}
                    </p>
                  )}
                </div>
              )}
            </section>
          ))}
          <section className={`faq-item ${open === 7 ? "expanded" : ""}`}>
            <h3>
              <button
                aria-expanded={open === 7}
                aria-controls="faq-content-7"
                id="faq-question-7"
                onClick={() => setOpen((current) => (current === 7 ? null : 7))}
              >
                Como abrir e partilhar a aplicação?
                <ChevronRight size={20} />
              </button>
            </h3>
            {open === 7 && (
              <div
                id="faq-content-7"
                role="region"
                aria-labelledby="faq-question-7"
                className="faq-content app-qr-content"
              >
                <AppQRCode />
              </div>
            )}
          </section>
        </div>
        <footer className="faq-footer">
          <span>Aquilivio Maria Cumbe · Criador do projecto</span>
          <Button onClick={onStart}>
            Começar sorteio <ArrowRight size={17} />
          </Button>
        </footer>
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
