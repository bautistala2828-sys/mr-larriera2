(() => {
  "use strict";
  if (window.__mrLarrieraLoaded) return;
  window.__mrLarrieraLoaded = true;

  /* =========================================================
     MR LARRIERA — PREMIUM CHAT WIDGET (Framer friendly)
     - Elegant UI (glass header, soft shadows, better spacing)
     - Softer brand voice (confident, never aggressive)
     - More coherent flow + less repetitive CTAs
     - Storage-safe + strict-mode safe
     ========================================================= */

  const CONFIG = {
    brandName: "Growth Larriera",
    botName: "Mr Larriera",

    // ✅ Brand Colors (placeholder — pasame los oficiales y lo adapto)
    theme: {
      accent: "#ff4fb0",
      accent2: "#ff86c8",
      bg: "#ffffff",
      panelBg: "#ffffff",
      surface: "#F7F8FB",
      text: "#111111",
      muted: "rgba(17,17,17,.62)",
      border: "rgba(17,17,17,.10)",
      shadow: "0 24px 80px rgba(0,0,0,.18)",
    },

    // Floating button position
    buttonPosition: { right: 18, bottom: 18 },

    // CTAs
    googleFormUrl: "PEGAR_TU_GOOGLE_FORM",
    whatsappUrl:
      "https://wa.me/54911XXXXXXXXX?text=Hola%20Mr%20Larriera%2C%20quiero%20asesoramiento",
    calendlyUrl: "https://calendly.com/tu-link",

    // Behavior
    showTeaserAfterMs: 2200,
    startPulseAfterMs: 1200,
    showOncePerSession: true,
    openOnTeaserClick: true,

    // Copy settings
    maxFreeTextChars: 500,
  };

  const KEY = {
    shown: "mrL_shown",
    open: "mrL_open",
    state: "mrL_state",
    answers: "mrL_answers",
    lastBot: "mrL_lastBot",
  };

  const doc = document;

  /* =========================
     Safe storage helpers
     ========================= */
  const safe = {
    get(storage, k) {
      try {
        return storage.getItem(k);
      } catch {
        return null;
      }
    },
    set(storage, k, v) {
      try {
        storage.setItem(k, v);
        return true;
      } catch {
        return false;
      }
    },
    remove(storage, k) {
      try {
        storage.removeItem(k);
        return true;
      } catch {
        return false;
      }
    },
    jsonParse(str, fallback) {
      try {
        return JSON.parse(str);
      } catch {
        return fallback;
      }
    },
  };

  /* =========================
     1) CSS (Injected)
     ========================= */
  const css = `
  :root{
    --mr-accent:${CONFIG.theme.accent};
    --mr-accent2:${CONFIG.theme.accent2};
    --mr-bg:${CONFIG.theme.bg};
    --mr-panel:${CONFIG.theme.panelBg};
    --mr-surface:${CONFIG.theme.surface};
    --mr-text:${CONFIG.theme.text};
    --mr-muted:${CONFIG.theme.muted};
    --mr-border:${CONFIG.theme.border};
    --mr-shadow:${CONFIG.theme.shadow};
    --mr-radius:22px;
  }

  /* Better font (Inter if available) */
  .mr-root, .mr-root *{
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Floating robot button */
  .mr-fab{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom}px;
    width:56px;height:56px;border-radius:999px;
    background:#111;
    box-shadow:0 18px 55px rgba(0,0,0,.22);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer; user-select:none;
    z-index:99999;
    transform:translateY(10px);
    opacity:0;
    pointer-events:none;
    transition:opacity .18s ease, transform .18s ease, box-shadow .18s ease;
  }
  .mr-fab.show{
    opacity:1;
    transform:translateY(0);
    pointer-events:auto;
  }
  .mr-fab:hover{ box-shadow:0 22px 70px rgba(0,0,0,.28); }
  .mr-fab.pulse::before{
    content:"";
    position:absolute; inset:-6px;
    border-radius:999px;
    box-shadow:0 0 0 0 rgba(255,79,176,.45);
    animation: mrPulse 1.6s infinite;
  }
  @keyframes mrPulse{
    0%{box-shadow:0 0 0 0 rgba(255,79,176,.45);opacity:1}
    70%{box-shadow:0 0 0 18px rgba(255,79,176,0);opacity:1}
    100%{box-shadow:0 0 0 0 rgba(255,79,176,0);opacity:0}
  }

  /* Robot head (SVG) */
  .mr-robot{ width:30px; height:30px; display:block; }
  .mr-eye{ transform-origin:center; animation: mrBlink 5.4s infinite; }
  .mr-eye.r{ animation-delay: .12s; }
  @keyframes mrBlink{
    0%, 92%, 100% { transform: scaleY(1); }
    93% { transform: scaleY(0.08); }
    95% { transform: scaleY(1); }
  }

  /* Teaser bubble (more elegant) */
  .mr-teaser{
    position:fixed;
    right:${CONFIG.buttonPosition.right + 72}px;
    bottom:${CONFIG.buttonPosition.bottom + 8}px;
    background: rgba(255,255,255,.78);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--mr-text);
    border: 1px solid rgba(17,17,17,.08);
    border-radius:999px;
    padding:10px 12px;
    box-shadow:0 14px 44px rgba(0,0,0,.14);
    font-size:13px;
    font-weight:650;
    display:flex; gap:10px; align-items:center;
    max-width:min(360px, calc(100vw - 130px));
    opacity:0; transform:translateY(10px);
    pointer-events:none;
    transition: opacity .2s ease, transform .2s ease;
    z-index:99998;
  }
  .mr-teaser.show{
    opacity:1; transform:translateY(0);
    pointer-events:auto;
  }
  .mr-teaser .dot{
    width:10px;height:10px;border-radius:999px;
    background:linear-gradient(135deg,var(--mr-accent),var(--mr-accent2));
    box-shadow:0 0 0 6px rgba(255,79,176,.12);
    flex:0 0 auto;
  }
  .mr-teaser .x{
    margin-left:auto;
    cursor:pointer;
    font-weight:900;
    padding:4px 8px;
    border-radius:10px;
    background: rgba(17,17,17,.06);
    color: rgba(17,17,17,.65);
  }
  .mr-teaser .x:hover{ background: rgba(17,17,17,.10); }

  /* Panel */
  .mr-panel{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom + 72}px;
    width:340px;
    max-width:calc(100vw - 36px);
    height:520px;
    max-height:calc(100vh - 120px);
    background: var(--mr-panel);
    border-radius:var(--mr-radius);
    overflow:hidden;
    box-shadow: var(--mr-shadow);
    display:none;
    z-index:99999;
  }
  .mr-panel.open{ display:flex; flex-direction:column; }

  /* Open animation */
  .mr-panel{
    transform: translateY(10px);
    opacity: 0;
    transition: transform .18s ease, opacity .18s ease;
  }
  .mr-panel.open{
    opacity: 1;
    transform: translateY(0);
  }

  /* Header (glass + accent line) */
  .mr-head{
    position:relative;
    padding:12px 12px;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(17,17,17,.08);
    display:flex; align-items:center; gap:10px;
    color: var(--mr-text);
  }
  .mr-head::before{
    content:"";
    position:absolute;
    left:0; top:0; right:0;
    height:3px;
    background: linear-gradient(135deg,var(--mr-accent),var(--mr-accent2));
    opacity:.95;
  }
  .mr-badge{
    width:34px;height:34px;border-radius:12px;
    background: rgba(17,17,17,.06);
    display:flex; align-items:center; justify-content:center;
    font-weight:900;
    letter-spacing:-.4px;
  }
  .mr-meta{ display:flex; flex-direction:column; gap:2px; }
  .mr-title{ font-weight:900; letter-spacing:-.3px; font-size:14px; line-height:1.1; }
  .mr-sub{ font-size:12px; font-weight:650; color: var(--mr-muted); }
  .mr-close{
    margin-left:auto;
    cursor:pointer;
    font-weight:900;
    padding:6px 10px;
    border-radius:12px;
    background: rgba(17,17,17,.06);
    border: 1px solid rgba(17,17,17,.06);
  }
  .mr-close:hover{ background: rgba(17,17,17,.10); }

  /* Body */
  .mr-body{
    padding:12px;
    overflow:auto;
    flex:1;
    background: #FBFCFE;
  }

  /* Messages */
  .mr-msg{
    max-width:84%;
    padding:9px 11px;
    border-radius:16px;
    margin:7px 0;
    background: rgba(17,17,17,.06);
    color: var(--mr-text);
    font-size:13.5px;
    font-weight:650;
    line-height:1.35;
    word-wrap:break-word;
  }
  .mr-msg.me{
    margin-left:auto;
    background:#111;
    color:#fff;
  }
  .mr-msg small{
    display:block;
    font-size:11.5px;
    font-weight:650;
    color: rgba(17,17,17,.60);
    margin-top:6px;
  }

  /* typing dots */
  .mr-typing{ display:inline-flex; gap:4px; align-items:center; }
  .mr-typing i{
    width:6px; height:6px; border-radius:99px;
    background: rgba(17,17,17,.35);
    animation: mrDot 1.05s infinite;
    display:inline-block;
  }
  .mr-typing i:nth-child(2){ animation-delay:.15s; }
  .mr-typing i:nth-child(3){ animation-delay:.3s; }
  @keyframes mrDot{
    0%,100%{ transform:translateY(0); opacity:.45; }
    50%{ transform:translateY(-3px); opacity:1; }
  }

  /* Quick chips */
  .mr-quick{
    display:flex; flex-wrap:wrap; gap:8px;
    padding:10px 12px;
    border-top:1px solid rgba(17,17,17,.08);
    background: rgba(255,255,255,.78);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .mr-quick button{
    border:1px solid rgba(17,17,17,.10);
    background: rgba(17,17,17,.04);
    color: var(--mr-text);
    padding:7px 10px;
    border-radius:999px;
    cursor:pointer;
    font-weight:850;
    font-size:12.5px;
    transition: background .15s ease, transform .15s ease, border-color .15s ease;
  }
  .mr-quick button:hover{
    background: rgba(17,17,17,.08);
    border-color: rgba(17,17,17,.14);
    transform: translateY(-1px);
  }

  /* Input row */
  .mr-input{
    display:flex; gap:10px;
    padding:10px 12px;
    border-top:1px solid rgba(17,17,17,.08);
    background: #fff;
  }
  .mr-input input{
    flex:1;
    border:1px solid rgba(17,17,17,.10);
    border-radius:14px;
    padding:10px 12px;
    outline:none;
    font-weight:650;
    font-size:13.5px;
  }
  .mr-input input:focus{
    border-color: rgba(255,79,176,.50);
    box-shadow: 0 0 0 4px rgba(255,79,176,.12);
  }
  .mr-input button{
    border:0;
    border-radius:14px;
    padding:10px 12px;
    font-weight:900;
    cursor:pointer;
    background:#111;
    color:#fff;
    transition: transform .15s ease, opacity .15s ease;
  }
  .mr-input button:hover{ transform: translateY(-1px); opacity:.92; }

  /* Links in bot messages */
  .mr-body a{
    color: var(--mr-text);
    font-weight:850;
    text-decoration: none;
    border-bottom: 1px solid rgba(17,17,17,.30);
  }
  .mr-body a:hover{ border-bottom-color: rgba(17,17,17,.55); }
  `;

  const style = doc.createElement("style");
  style.textContent = css;
  doc.head.appendChild(style);

  /* =========================
     2) HTML (Injected)
     ========================= */
  function robotSVG() {
    return `
    <svg class="mr-robot" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mrG" x1="10" y1="8" x2="58" y2="56">
          <stop offset="0" stop-color="${CONFIG.theme.accent}"/>
          <stop offset="1" stop-color="${CONFIG.theme.accent2}"/>
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="44" height="36" rx="10" fill="url(#mrG)"/>
      <rect x="16" y="20" width="32" height="24" rx="8" fill="rgba(17,17,17,.28)"/>
      <circle class="mr-eye l" cx="26" cy="32" r="5.8" fill="#111"/>
      <circle class="mr-eye r" cx="38" cy="32" r="5.8" fill="#111"/>
      <circle cx="24.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.85)"/>
      <circle cx="36.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.85)"/>
      <rect x="28" y="42" width="8" height="3.5" rx="2" fill="rgba(255,255,255,.55)"/>
      <path d="M18 14c2.5-6 6-9 14-9" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 14c-2.5-6-6-9-14-9" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  // Root wrapper (helps for CSS scoping if needed later)
  const root = doc.createElement("div");
  root.className = "mr-root";

  const fab = doc.createElement("div");
  fab.className = "mr-fab";
  fab.setAttribute("role", "button");
  fab.setAttribute("aria-label", `Abrir chat con ${CONFIG.botName}`);
  fab.innerHTML = robotSVG();

  const teaser = doc.createElement("div");
  teaser.className = "mr-teaser";
  teaser.innerHTML = `
    <span class="dot"></span>
    <span><strong>${CONFIG.botName}</strong>: ¿Te hago 3 preguntas y te digo por dónde empezar?</span>
    <span class="x" aria-label="Cerrar">✕</span>
  `;

  const panel = doc.createElement("div");
  panel.className = "mr-panel";
  panel.innerHTML = `
    <div class="mr-head">
      <div class="mr-badge">ML</div>
      <div class="mr-meta">
        <div class="mr-title">${CONFIG.botName}</div>
        <div class="mr-sub">Corto. Claro. Con criterio.</div>
      </div>
      <div class="mr-close" aria-label="Cerrar">✕</div>
    </div>

    <div class="mr-body" id="mr-body"></div>

    <div class="mr-quick" id="mr-quick">
      <button data-q="audit">Auditoría</button>
      <button data-q="ads">Más ventas</button>
      <button data-q="seo">SEO</button>
      <button data-q="contact">Contactar</button>
      <button data-q="reset">Reiniciar</button>
    </div>

    <div class="mr-input">
      <input id="mr-input" type="text" placeholder="Escribí acá…" maxlength="${CONFIG.maxFreeTextChars}" />
      <button id="mr-send" type="button">Enviar</button>
    </div>
  `;

  root.appendChild(fab);
  root.appendChild(teaser);
  root.appendChild(panel);
  doc.body.appendChild(root);

  /* =========================
     3) Logic (Conversation)
     ========================= */
  const body = panel.querySelector("#mr-body");
  const input = panel.querySelector("#mr-input");
  const sendBtn = panel.querySelector("#mr-send");
  const quick = panel.querySelector("#mr-quick");

  function addMsg(text, who = "bot", isHtml = false) {
    const el = doc.createElement("div");
    el.className = "mr-msg" + (who === "me" ? " me" : "");
    if (isHtml) el.innerHTML = text;
    else el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;

    if (who === "bot") safe.set(localStorage, KEY.lastBot, isHtml ? el.innerHTML : el.textContent);
    return el;
  }

  function typingOn() {
    return addMsg(`<span class="mr-typing"><i></i><i></i><i></i></span>`, "bot", true);
  }

  function ctaHtml() {
    return `
      <small>
        👉 <a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a>
        &nbsp;•&nbsp;
        <a href="${CONFIG.calendlyUrl}" target="_blank" rel="noopener">Agendar</a>
        &nbsp;•&nbsp;
        <a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>
      </small>
    `;
  }

  let setOpen = (open) => {
    if (open) {
      panel.classList.add("open");
      teaser.classList.remove("show");
      safe.set(sessionStorage, KEY.open, "1");
      fab.classList.remove("pulse");
      setTimeout(() => input.focus(), 0);
    } else {
      panel.classList.remove("open");
      safe.remove(sessionStorage, KEY.open);
    }
  };

  function maybeShowFab() {
    const y = window.scrollY || doc.documentElement.scrollTop || 0;
    if (y > 160) fab.classList.add("show");
    else fab.classList.remove("show");
  }

  window.addEventListener("scroll", maybeShowFab, { passive: true });
  window.addEventListener("load", maybeShowFab);

  // Qualification flow (coherent, shorter)
  const FLOW = [
    { key: "objective", q: "¿Qué querés lograr primero? (ventas / leads / posicionamiento)", hint: "1 frase" },
    { key: "industry", q: "¿Qué vendés y a quién? (rubro + cliente ideal)", hint: "ej: muebles premium a arquitectos" },
    { key: "budget", q: "¿Presupuesto mensual para publicidad? (aprox)", hint: "ej: ARS 500k o USD 1.000" },
    { key: "timeline", q: "¿Para cuándo lo necesitás?", hint: "ya / 30 días / 90 días" },
    { key: "site", q: "¿Tenés web? (URL opcional)", hint: "" },
  ];

  function loadState() {
    const rawState = safe.get(localStorage, KEY.state);
    const rawAnswers = safe.get(localStorage, KEY.answers);
    const state = safe.jsonParse(rawState || "null", null) || { step: 0, mode: "idle" };
    const answers = safe.jsonParse(rawAnswers || "{}", {}) || {};
    return { state, answers };
  }

  function saveState(state, answers) {
    safe.set(localStorage, KEY.state, JSON.stringify(state));
    safe.set(localStorage, KEY.answers, JSON.stringify(answers));
  }

  let { state, answers } = loadState();

  function resetFlow() {
    state = { step: 0, mode: "qualify" };
    answers = {};
    saveState(state, answers);
  }

  function finishFlow() {
    state = { step: FLOW.length, mode: "done" };
    saveState(state, answers);

    const summary = `
      <b>Perfecto.</b> Con esto ya puedo orientarte bien.<br/><br/>
      <b>Resumen</b><br/>
      • Objetivo: ${answers.objective || "-"}<br/>
      • Rubro/cliente: ${answers.industry || "-"}<br/>
      • Presupuesto: ${answers.budget || "-"}<br/>
      • Timing: ${answers.timeline || "-"}<br/>
      • Web: ${answers.site || "-"}<br/><br/>
      Si querés, lo siguiente es simple: elegí un canal de contacto y lo armamos bien.
      ${ctaHtml()}
    `;
    addMsg(summary, "bot", true);
  }

  function askCurrentStep() {
    const step = state.step || 0;
    const item = FLOW[step];
    if (!item) return finishFlow();
    const t = typingOn();
    setTimeout(() => {
      t.remove();
      addMsg(`${item.q}${item.hint ? `\n(${item.hint})` : ""}`, "bot");
    }, 420);
  }

  function startConversation() {
    addMsg(
      `Soy ${CONFIG.botName}. Si me das 3 datos, te digo por dónde empezar sin humo.`,
      "bot"
    );
    addMsg(
      `¿Querés que te haga ${FLOW.length} preguntas cortas?`,
      "bot"
    );
    addMsg(
      `También podés ir directo:${ctaHtml()}`,
      "bot",
      true
    );
  }

  if (!safe.get(localStorage, KEY.state)) startConversation();
  else addMsg(`Bienvenido de nuevo. ¿Retomamos donde quedamos?`, "bot");

  function interpretYesNo(text) {
    const t = text.trim().toLowerCase();
    const yes = ["si", "sí", "dale", "ok", "de una", "vamos", "obvio", "yes"];
    const no = ["no", "despues", "después", "luego", "más tarde", "nah"];
    if (yes.some((w) => t === w || t.includes(w))) return "yes";
    if (no.some((w) => t === w || t.includes(w))) return "no";
    return null;
  }

  function friendlyHelpAfterDone(userText) {
    // Avoid repeating the same CTA loop.
    const t = typingOn();
    setTimeout(() => {
      t.remove();
      addMsg(
        `Te leí. Para ayudarte bien, decime una cosa:\n1) ¿querés ventas ya o posicionamiento?\n2) ¿tu producto/servicio cuál es?`,
        "bot"
      );
      addMsg(`Si preferís, también podés avanzar por acá:${ctaHtml()}`, "bot", true);
      // optionally restart flow after prompting
      state = { step: 0, mode: "idle" };
      saveState(state, answers);
    }, 420);
  }

  function handleQuick(action) {
    const label =
      action === "audit" ? "Auditoría" :
      action === "ads" ? "Más ventas" :
      action === "seo" ? "SEO" :
      action === "contact" ? "Contactar" :
      "Reiniciar";

    addMsg(label, "me");

    if (action === "reset") {
      resetFlow();
      const t = typingOn();
      setTimeout(() => {
        t.remove();
        addMsg("Listo. Arrancamos de cero.", "bot");
        askCurrentStep();
      }, 380);
      return;
    }

    if (action === "contact") {
      const t = typingOn();
      setTimeout(() => {
        t.remove();
        addMsg(
          `Perfecto. Elegí una vía y lo resolvemos rápido:`,
          "bot"
        );
        addMsg(ctaHtml(), "bot", true);
      }, 420);
      return;
    }

    // Start flow with a gentle prefill for objective
    resetFlow();
    if (action === "ads") answers.objective = "ventas / performance";
    if (action === "seo") answers.objective = "posicionamiento / SEO";
    if (action === "audit") answers.objective = "auditoría + plan de acción";
    saveState(state, answers);

    if (answers.objective) state.step = 1;
    saveState(state, answers);

    askCurrentStep();
  }

  quick.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleQuick(btn.dataset.q));
  });

  function send() {
    const text = (input.value || "").trim();
    if (!text) return;
    if (text.length > CONFIG.maxFreeTextChars) return;

    addMsg(text, "me");
    input.value = "";

    // Idle mode: start flow or answer lightly
    if (state.mode === "idle") {
      const yn = interpretYesNo(text);
      if (yn === "yes") {
        resetFlow();
        askCurrentStep();
        return;
      }
      if (yn === "no") {
        const t = typingOn();
        setTimeout(() => {
          t.remove();
          addMsg("Perfecto. Si después querés, abrís el chat y lo hacemos.", "bot");
          addMsg(ctaHtml(), "bot", true);
        }, 420);
        return;
      }

      // Not yes/no -> propose flow with purpose
      const t = typingOn();
      setTimeout(() => {
        t.remove();
        addMsg(
          "Ok. Para no adivinar: ¿tu objetivo hoy es ventas, leads o posicionamiento?",
          "bot"
        );
      }, 420);
      return;
    }

    // Qualify mode: store answers and continue
    if (state.mode === "qualify") {
      const step = state.step || 0;
      const item = FLOW[step];
      if (item) {
        answers[item.key] = text;
        state.step = step + 1;
        saveState(state, answers);
        if (state.step >= FLOW.length) finishFlow();
        else askCurrentStep();
        return;
      }
    }

    // Done mode: do something useful instead of looping the same CTA
    if (state.mode === "done") {
      friendlyHelpAfterDone(text);
      return;
    }
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  // Open/close
  fab.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  panel.querySelector(".mr-close").addEventListener("click", () => setOpen(false));
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false);
  });

  // teaser
  teaser.querySelector(".x").addEventListener("click", (e) => {
    e.stopPropagation();
    teaser.classList.remove("show");
    safe.set(sessionStorage, KEY.shown, "1");
  });
  teaser.addEventListener("click", () => {
    if (CONFIG.openOnTeaserClick) setOpen(true);
  });

  /* =========================
     4) Teaser + Pulse policy
     ========================= */
  const alreadyShown = safe.get(sessionStorage, KEY.shown) === "1";
  const alreadyOpen = safe.get(sessionStorage, KEY.open) === "1";

  if (alreadyOpen) setOpen(true);

  if (!alreadyShown || !CONFIG.showOncePerSession) {
    setTimeout(() => fab.classList.add("pulse"), CONFIG.startPulseAfterMs);
    setTimeout(() => teaser.classList.add("show"), CONFIG.showTeaserAfterMs);
  }

  // Mark as shown when panel opens
  const originalSetOpen = setOpen;
  setOpen = (open) => {
    if (open) safe.set(sessionStorage, KEY.shown, "1");
    originalSetOpen(open);
  };

  // Show FAB based on scroll initially
  maybeShowFab();

  // If user mid-flow, continue
  if (!state || !state.mode) {
    state = { step: 0, mode: "idle" };
    saveState(state, answers || {});
  } else if (state.mode === "qualify" && (state.step || 0) < FLOW.length) {
    addMsg("Tenías preguntas pendientes. Si querés, las terminamos.", "bot");
    askCurrentStep();
  }
})();
