(() => {
  "use strict";

  // ✅ Hard cleanup to avoid double-injection (Framer navigation / cache)
  document
    .querySelectorAll(".mr-root, .mr-fab, .mr-teaser, .mr-panel")
    .forEach((n) => n.remove());

  // ✅ Versioned flag (prevents duplicates but allows updates)
  const VERSION = "mrL_v3";
  if (window.__mrLarrieraLoaded === VERSION) return;
  window.__mrLarrieraLoaded = VERSION;

  const CONFIG = {
    brandName: "Growth Larriera",
    botName: "Mr Larriera",

    // 🔥 Dark-premium skin (después lo ajusto con tus colores oficiales)
    theme: {
      accent: "#ff4fb0",
      accent2: "#ff86c8",
      panel: "rgba(16,16,18,.92)",
      panel2: "rgba(16,16,18,.78)",
      surface: "rgba(255,255,255,.06)",
      text: "rgba(255,255,255,.92)",
      muted: "rgba(255,255,255,.68)",
      border: "rgba(255,255,255,.10)",
      shadow: "0 28px 90px rgba(0,0,0,.42)",
    },

    buttonPosition: { right: 18, bottom: 18 },

    googleFormUrl: "PEGAR_TU_GOOGLE_FORM",
    whatsappUrl:
      "https://wa.me/54911XXXXXXXXX?text=Hola%20Mr%20Larriera%2C%20quiero%20asesoramiento",
    calendlyUrl: "https://calendly.com/tu-link",

    showTeaserAfterMs: 1700,
    startPulseAfterMs: 1200,
    showOncePerSession: true,
    openOnTeaserClick: true,
  };

  const KEY = {
    shown: "mrL_shown",
    open: "mrL_open",
    state: "mrL_state",
    answers: "mrL_answers",
  };

  const doc = document;

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
      } catch {}
    },
    remove(storage, k) {
      try {
        storage.removeItem(k);
      } catch {}
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
     CSS
     ========================= */
  const css = `
  :root{
    --mr-accent:${CONFIG.theme.accent};
    --mr-accent2:${CONFIG.theme.accent2};
    --mr-panel:${CONFIG.theme.panel};
    --mr-panel2:${CONFIG.theme.panel2};
    --mr-surface:${CONFIG.theme.surface};
    --mr-text:${CONFIG.theme.text};
    --mr-muted:${CONFIG.theme.muted};
    --mr-border:${CONFIG.theme.border};
    --mr-shadow:${CONFIG.theme.shadow};
    --mr-radius:22px;
  }

  .mr-root, .mr-root *{
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .mr-fab{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom}px;
    width:54px;height:54px;border-radius:999px;
    background: radial-gradient(120% 120% at 30% 10%, rgba(255,255,255,.10), rgba(255,255,255,.02)) , #0b0b0d;
    border: 1px solid rgba(255,255,255,.10);
    box-shadow: 0 18px 55px rgba(0,0,0,.40);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer; user-select:none;
    z-index:99999;
    transform:translateY(10px);
    opacity:0;
    pointer-events:none;
    transition:opacity .18s ease, transform .18s ease, box-shadow .18s ease;
  }
  .mr-fab.show{ opacity:1; transform:translateY(0); pointer-events:auto; }
  .mr-fab:hover{ box-shadow:0 24px 75px rgba(0,0,0,.55); }
  .mr-fab.pulse::before{
    content:"";
    position:absolute; inset:-6px;
    border-radius:999px;
    box-shadow:0 0 0 0 rgba(255,79,176,.28);
    animation: mrPulse 1.6s infinite;
  }
  @keyframes mrPulse{
    0%{box-shadow:0 0 0 0 rgba(255,79,176,.28);opacity:1}
    70%{box-shadow:0 0 0 18px rgba(255,79,176,0);opacity:1}
    100%{box-shadow:0 0 0 0 rgba(255,79,176,0);opacity:0}
  }

  .mr-robot{ width:28px; height:28px; display:block; }
  .mr-eye{ transform-origin:center; animation: mrBlink 6.2s infinite; }
  .mr-eye.r{ animation-delay: .12s; }
  @keyframes mrBlink{
    0%, 92%, 100% { transform: scaleY(1); }
    93% { transform: scaleY(0.08); }
    95% { transform: scaleY(1); }
  }

  .mr-teaser{
    position:fixed;
    right:${CONFIG.buttonPosition.right + 70}px;
    bottom:${CONFIG.buttonPosition.bottom + 7}px;
    background: rgba(16,16,18,.78);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--mr-text);
    border:1px solid rgba(255,255,255,.10);
    border-radius:999px;
    padding:10px 12px;
    box-shadow: 0 18px 60px rgba(0,0,0,.35);
    font-size:12.8px;
    font-weight:650;
    display:flex; gap:10px; align-items:center;
    max-width:min(360px, calc(100vw - 130px));
    opacity:0; transform:translateY(10px);
    pointer-events:none;
    transition: opacity .2s ease, transform .2s ease;
    z-index:99998;
  }
  .mr-teaser.show{ opacity:1; transform:translateY(0); pointer-events:auto; }
  .mr-teaser .dot{
    width:9px;height:9px;border-radius:999px;
    background: linear-gradient(135deg,var(--mr-accent),var(--mr-accent2));
    box-shadow:0 0 0 6px rgba(255,79,176,.10);
    flex:0 0 auto;
  }
  .mr-teaser .x{
    margin-left:auto;
    cursor:pointer;
    font-weight:900;
    padding:4px 8px;
    border-radius:10px;
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.70);
  }
  .mr-teaser .x:hover{ background: rgba(255,255,255,.10); }

  .mr-panel{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom + 70}px;
    width:348px;
    max-width:calc(100vw - 36px);
    height:520px;
    max-height:calc(100vh - 120px);
    background: var(--mr-panel);
    border-radius:var(--mr-radius);
    overflow:hidden;
    box-shadow: var(--mr-shadow);
    border: 1px solid rgba(255,255,255,.10);
    display:none;
    z-index:99999;
    transform: translateY(10px);
    opacity: 0;
    transition: transform .18s ease, opacity .18s ease;
  }
  .mr-panel.open{
    display:flex; flex-direction:column;
    opacity: 1;
    transform: translateY(0);
  }

  .mr-head{
    position:relative;
    padding:12px 12px;
    background: var(--mr-panel2);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,.08);
    display:flex; align-items:center; gap:10px;
    color: var(--mr-text);
  }
  .mr-head::before{
    content:"";
    position:absolute;
    left:0; top:0; right:0;
    height:2px;
    background: linear-gradient(135deg,var(--mr-accent),var(--mr-accent2));
    opacity:.9;
  }
  .mr-badge{
    width:34px;height:34px;border-radius:12px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.10);
    display:flex; align-items:center; justify-content:center;
    font-weight:900;
    letter-spacing:-.4px;
  }
  .mr-title{ font-weight:900; letter-spacing:-.3px; font-size:14px; line-height:1.1; }
  .mr-sub{ font-size:12px; font-weight:650; color: var(--mr-muted); }
  .mr-close{
    margin-left:auto;
    cursor:pointer;
    font-weight:900;
    padding:6px 10px;
    border-radius:12px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.10);
    color: var(--mr-text);
  }
  .mr-close:hover{ background: rgba(255,255,255,.10); }

  .mr-body{
    padding:12px;
    overflow:auto;
    flex:1;
    background: radial-gradient(120% 120% at 10% 0%, rgba(255,79,176,.07), transparent 55%),
                radial-gradient(120% 120% at 90% 10%, rgba(255,134,200,.06), transparent 55%),
                rgba(8,8,10,.60);
  }

  .mr-msg{
    max-width:84%;
    padding:9px 11px;
    border-radius:16px;
    margin:7px 0;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    color: var(--mr-text);
    font-size:13.5px;
    font-weight:650;
    line-height:1.35;
    word-wrap:break-word;
  }
  .mr-msg.me{
    margin-left:auto;
    background: rgba(255,255,255,.10);
    border-color: rgba(255,255,255,.12);
  }

  .mr-typing{ display:inline-flex; gap:4px; align-items:center; }
  .mr-typing i{
    width:6px; height:6px; border-radius:99px;
    background: rgba(255,255,255,.45);
    animation: mrDot 1.05s infinite;
    display:inline-block;
  }
  .mr-typing i:nth-child(2){ animation-delay:.15s; }
  .mr-typing i:nth-child(3){ animation-delay:.3s; }
  @keyframes mrDot{
    0%,100%{ transform:translateY(0); opacity:.45; }
    50%{ transform:translateY(-3px); opacity:1; }
  }

  .mr-quick{
    display:flex; flex-wrap:wrap; gap:8px;
    padding:10px 12px;
    border-top:1px solid rgba(255,255,255,.08);
    background: var(--mr-panel2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .mr-quick button{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color: var(--mr-text);
    padding:7px 10px;
    border-radius:999px;
    cursor:pointer;
    font-weight:850;
    font-size:12.5px;
    transition: background .15s ease, transform .15s ease, border-color .15s ease;
  }
  .mr-quick button:hover{
    background: rgba(255,255,255,.10);
    border-color: rgba(255,255,255,.18);
    transform: translateY(-1px);
  }

  .mr-input{
    display:flex; gap:10px;
    padding:10px 12px;
    border-top:1px solid rgba(255,255,255,.08);
    background: var(--mr-panel2);
  }
  .mr-input input{
    flex:1;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color: var(--mr-text);
    border-radius:14px;
    padding:10px 12px;
    outline:none;
    font-weight:650;
    font-size:13.5px;
  }
  .mr-input input::placeholder{ color: rgba(255,255,255,.45); }
  .mr-input input:focus{
    border-color: rgba(255,79,176,.55);
    box-shadow: 0 0 0 4px rgba(255,79,176,.12);
  }
  .mr-input button{
    border:1px solid rgba(255,255,255,.12);
    border-radius:14px;
    padding:10px 12px;
    font-weight:900;
    cursor:pointer;
    background: linear-gradient(135deg,var(--mr-accent),var(--mr-accent2));
    color:#111;
    transition: transform .15s ease, opacity .15s ease;
  }
  .mr-input button:hover{ transform: translateY(-1px); opacity:.92; }

  .mr-body a{
    color: rgba(255,255,255,.92);
    font-weight:850;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,.28);
  }
  .mr-body a:hover{ border-bottom-color: rgba(255,255,255,.55); }
  `;

  const style = doc.createElement("style");
  style.textContent = css;
  doc.head.appendChild(style);

  /* =========================
     HTML
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
      <rect x="16" y="20" width="32" height="24" rx="8" fill="rgba(0,0,0,.28)"/>
      <circle class="mr-eye l" cx="26" cy="32" r="5.8" fill="#111"/>
      <circle class="mr-eye r" cx="38" cy="32" r="5.8" fill="#111"/>
      <circle cx="24.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.85)"/>
      <circle cx="36.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.85)"/>
    </svg>`;
  }

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
    <span><strong>${CONFIG.botName}</strong>: ¿Te hago 3 preguntas y te digo el próximo paso?</span>
    <span class="x" aria-label="Cerrar">✕</span>
  `;

  const panel = doc.createElement("div");
  panel.className = "mr-panel";
  panel.innerHTML = `
    <div class="mr-head">
      <div class="mr-badge">ML</div>
      <div class="mr-meta">
        <div class="mr-title">${CONFIG.botName}</div>
        <div class="mr-sub">Directo. Elegante. Sin humo.</div>
      </div>
      <div class="mr-close" aria-label="Cerrar">✕</div>
    </div>

    <div class="mr-body" id="mr-body"></div>

    <div class="mr-quick" id="mr-quick">
      <button data-q="ads">Más ventas</button>
      <button data-q="audit">Auditoría</button>
      <button data-q="seo">SEO</button>
      <button data-q="contact">Contactar</button>
      <button data-q="reset">Reiniciar</button>
    </div>

    <div class="mr-input">
      <input id="mr-input" type="text" placeholder="Escribí acá…" />
      <button id="mr-send" type="button">Enviar</button>
    </div>
  `;

  root.appendChild(fab);
  root.appendChild(teaser);
  root.appendChild(panel);
  doc.body.appendChild(root);

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
    return el;
  }

  function typingOn() {
    return addMsg(`<span class="mr-typing"><i></i><i></i><i></i></span>`, "bot", true);
  }

  function ctaHtml() {
    return `
      <br/>
      <a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a>
      &nbsp;•&nbsp;
      <a href="${CONFIG.calendlyUrl}" target="_blank" rel="noopener">Agendar</a>
      &nbsp;•&nbsp;
      <a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>
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

  const FLOW = [
    { key: "objective", q: "¿Qué querés lograr primero? (ventas / leads / posicionamiento)" },
    { key: "industry", q: "¿Rubro/industria? (ej: servicios, ecommerce, real estate)" },
    { key: "budget", q: "¿Presupuesto mensual para ads? (aprox)" },
  ];

  function loadState() {
    const s = safe.jsonParse(safe.get(localStorage, KEY.state) || "null", null) || {
      step: 0,
      mode: "idle",
    };
    const a = safe.jsonParse(safe.get(localStorage, KEY.answers) || "{}", {}) || {};
    return { state: s, answers: a };
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

  function askStep() {
    const item = FLOW[state.step];
    if (!item) {
      state.mode = "done";
      saveState(state, answers);
      addMsg(
        `<b>Listo.</b> Con esto ya puedo orientarte.<br/><br/>
        • Objetivo: ${answers.objective || "-"}<br/>
        • Rubro: ${answers.industry || "-"}<br/>
        • Presupuesto: ${answers.budget || "-"}<br/><br/>
        ¿Querés avanzar por acá?${ctaHtml()}`,
        "bot",
        true
      );
      return;
    }
    const t = typingOn();
    setTimeout(() => {
      t.remove();
      addMsg(item.q, "bot");
    }, 380);
  }

  function startConversation() {
    addMsg("Soy Mr Larriera. 3 preguntas cortas y te digo el próximo paso.", "bot");
    addMsg("¿Arrancamos?", "bot");
  }

  if (!safe.get(localStorage, KEY.state)) startConversation();

  function handleQuick(action) {
    addMsg(
      action === "ads" ? "Más ventas" :
      action === "audit" ? "Auditoría" :
      action === "seo" ? "SEO" :
      action === "contact" ? "Contactar" :
      "Reiniciar",
      "me"
    );

    if (action === "reset") {
      safe.remove(localStorage, KEY.state);
      safe.remove(localStorage, KEY.answers);
      state = { step: 0, mode: "idle" };
      answers = {};
      addMsg("Ok. Reiniciado.", "bot");
      startConversation();
      return;
    }

    if (action === "contact") {
      const t = typingOn();
      setTimeout(() => {
        t.remove();
        addMsg(`Perfecto. Elegí una vía:${ctaHtml()}`, "bot", true);
      }, 380);
      return;
    }

    // ads/audit/seo -> start flow
    resetFlow();
    if (action === "ads") answers.objective = "ventas";
    if (action === "seo") answers.objective = "posicionamiento";
    if (action === "audit") answers.objective = "auditoría";

    state.step = 1; // next question
    saveState(state, answers);
    askStep();
  }

  quick.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleQuick(btn.dataset.q));
  });

  function send() {
    const text = (input.value || "").trim();
    if (!text) return;
    addMsg(text, "me");
    input.value = "";

    if (state.mode === "idle") {
      resetFlow();
      // first answer goes to objective if user wrote something
      answers.objective = text;
      state.step = 1;
      saveState(state, answers);
      askStep();
      return;
    }

    if (state.mode === "qualify") {
      const item = FLOW[state.step];
      if (item) {
        answers[item.key] = text;
        state.step += 1;
        saveState(state, answers);
        askStep();
        return;
      }
    }

    // done
    const t = typingOn();
    setTimeout(() => {
      t.remove();
      addMsg(`Perfecto. Si querés avanzar:${ctaHtml()}`, "bot", true);
    }, 380);
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  fab.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  panel.querySelector(".mr-close").addEventListener("click", () => setOpen(false));
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false);
  });

  teaser.querySelector(".x").addEventListener("click", (e) => {
    e.stopPropagation();
    teaser.classList.remove("show");
    safe.set(sessionStorage, KEY.shown, "1");
  });
  teaser.addEventListener("click", () => {
    if (CONFIG.openOnTeaserClick) setOpen(true);
  });

  const alreadyShown = safe.get(sessionStorage, KEY.shown) === "1";
  const alreadyOpen = safe.get(sessionStorage, KEY.open) === "1";
  if (alreadyOpen) setOpen(true);

  if (!alreadyShown || !CONFIG.showOncePerSession) {
    setTimeout(() => fab.classList.add("pulse"), CONFIG.startPulseAfterMs);
    setTimeout(() => teaser.classList.add("show"), CONFIG.showTeaserAfterMs);
  }

  const originalSetOpen = setOpen;
  setOpen = (open) => {
    if (open) safe.set(sessionStorage, KEY.shown, "1");
    originalSetOpen(open);
  };

  maybeShowFab();
})();
