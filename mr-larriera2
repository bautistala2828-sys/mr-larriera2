(() => {
  "use strict";

  if (window.__mrLarrieraLoaded) return;
  window.__mrLarrieraLoaded = true;

  /* =========================================================
     MR LARRIERA — CHAT WIDGET (brand mascot)
     FIXES:
     - Removed undeclared var assignment (typingn) => strict-mode crash
     - Removed no-op placeholder calls
     - Safer localStorage/sessionStorage access (try/catch)
     - Keep same UI/flow
     ========================================================= */

  const CONFIG = {
    brandName: "Growth Larriera",
    botName: "Mr Larriera",
    accent: "#ff4fb0",
    buttonPosition: { right: 18, bottom: 18 },

    // CTAs
    googleFormUrl: "PEGAR_TU_GOOGLE_FORM",
    whatsappUrl:
      "https://wa.me/54911XXXXXXXXX?text=Hola%20Mr%20Larriera%2C%20quiero%20asesoramiento",
    calendlyUrl: "https://calendly.com/tu-link",

    // Behavior
    showTeaserAfterMs: 2600,
    startPulseAfterMs: 1400,
    showOncePerSession: true,
    openOnTeaserClick: true,

    // Tone: "soberbio sutil"
    swagger: 6,
  };

  const KEY = {
    shown: "mrL_shown",
    open: "mrL_open",
    state: "mrL_state",
    answers: "mrL_answers",
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
  };

  /* =========================
     1) CSS (Injected)
     ========================= */
  const css = `
  :root{--mr-accent:${CONFIG.accent};}

  .mr-fab{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom}px;
    width:60px;height:60px;border-radius:999px;
    background:#111;
    box-shadow:0 18px 55px rgba(0,0,0,.26);
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
  .mr-fab:hover{ box-shadow:0 22px 70px rgba(0,0,0,.30); }
  .mr-fab.pulse::before{
    content:"";
    position:absolute; inset:-6px;
    border-radius:999px;
    box-shadow:0 0 0 0 rgba(255,79,176,.55);
    animation: mrPulse 1.6s infinite;
  }
  @keyframes mrPulse{
    0%{box-shadow:0 0 0 0 rgba(255,79,176,.55);opacity:1}
    70%{box-shadow:0 0 0 18px rgba(255,79,176,0);opacity:1}
    100%{box-shadow:0 0 0 0 rgba(255,79,176,0);opacity:0}
  }

  .mr-robot{ width:34px; height:34px; display:block; }
  .mr-eye{
    transform-origin:center;
    animation: mrBlink 4.8s infinite;
  }
  .mr-eye.r{ animation-delay: .12s; }
  @keyframes mrBlink{
    0%, 92%, 100% { transform: scaleY(1); }
    93% { transform: scaleY(0.08); }
    95% { transform: scaleY(1); }
  }

  .mr-teaser{
    position:fixed;
    right:${CONFIG.buttonPosition.right + 74}px;
    bottom:${CONFIG.buttonPosition.bottom + 10}px;
    background:#fff;
    color:#111;
    border-radius:999px;
    padding:10px 12px;
    box-shadow:0 14px 44px rgba(0,0,0,.18);
    font:800 13px/1.15 system-ui,-apple-system,Segoe UI,Roboto,Arial;
    display:flex; gap:10px; align-items:center;
    max-width:min(340px, calc(100vw - 130px));
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
    background:var(--mr-accent);
    box-shadow:0 0 0 6px rgba(255,79,176,.16);
    flex:0 0 auto;
  }
  .mr-teaser .x{
    margin-left:auto;
    cursor:pointer;
    font-weight:900;
    padding:4px 8px;
    border-radius:10px;
    background:#f3f4f6;
    color:#6b7280;
  }

  .mr-panel{
    position:fixed;
    right:${CONFIG.buttonPosition.right}px;
    bottom:${CONFIG.buttonPosition.bottom + 78}px;
    width:380px;
    max-width:calc(100vw - 36px);
    height:560px;
    max-height:calc(100vh - 130px);
    background:#fff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 18px 70px rgba(0,0,0,.24);
    display:none;
    z-index:99999;
    font:650 14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Arial;
  }
  .mr-panel.open{ display:flex; flex-direction:column; }

  .mr-head{
    padding:14px 14px;
    background:linear-gradient(135deg, rgba(255,79,176,.95), rgba(255,134,200,.92));
    color:#111;
    display:flex; align-items:center; gap:10px;
  }
  .mr-badge{
    width:36px;height:36px;border-radius:12px;
    background:rgba(255,255,255,.65);
    display:flex; align-items:center; justify-content:center;
    font-weight:950;
    letter-spacing:-.5px;
  }
  .mr-meta{ display:flex; flex-direction:column; gap:2px; }
  .mr-title{ font-weight:950; }
  .mr-sub{ font-size:12px; font-weight:850; color:rgba(17,17,17,.78); }
  .mr-close{
    margin-left:auto;
    cursor:pointer;
    font-weight:950;
    padding:6px 10px;
    border-radius:10px;
    background:rgba(255,255,255,.6);
  }

  .mr-body{
    padding:14px;
    overflow:auto;
    flex:1;
    background:#fff;
  }
  .mr-msg{
    max-width:80%;
    padding:10px 12px;
    border-radius:14px;
    margin:8px 0;
    background:#f3f4f6;
    color:#111;
    box-shadow:0 10px 25px rgba(0,0,0,.06);
    word-wrap:break-word;
  }
  .mr-msg.me{
    margin-left:auto;
    background:#111;
    color:#fff;
  }

  .mr-typing{ display:inline-flex; gap:4px; align-items:center; }
  .mr-typing i{
    width:6px; height:6px; border-radius:99px;
    background:#9ca3af;
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
    padding:12px 14px;
    border-top:1px solid #eef2f7;
    background:#fff;
  }
  .mr-quick button{
    border:1px solid #e5e7eb;
    background:#fff;
    color:#111;
    padding:8px 10px;
    border-radius:999px;
    cursor:pointer;
    font-weight:900;
  }
  .mr-quick button:hover{ background:#f9fafb; }

  .mr-input{
    display:flex; gap:10px;
    padding:12px 14px;
    border-top:1px solid #eef2f7;
    background:#fff;
  }
  .mr-input input{
    flex:1;
    border:1px solid #e5e7eb;
    border-radius:12px;
    padding:10px 12px;
    outline:none;
    font-weight:700;
  }
  .mr-input button{
    border:0;
    border-radius:12px;
    padding:10px 12px;
    font-weight:950;
    cursor:pointer;
    background:#111;
    color:#fff;
  }

  .mr-body a{ color:#111; font-weight:950; text-decoration:underline; }
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
          <stop offset="0" stop-color="#ff4fb0"/>
          <stop offset="1" stop-color="#ff86c8"/>
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="44" height="36" rx="10" fill="url(#mrG)"/>
      <rect x="16" y="20" width="32" height="24" rx="8" fill="rgba(17,17,17,.28)"/>
      <circle class="mr-eye l" cx="26" cy="32" r="5.8" fill="#111"/>
      <circle class="mr-eye r" cx="38" cy="32" r="5.8" fill="#111"/>
      <circle cx="24.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.8)"/>
      <circle cx="36.5" cy="30.5" r="1.6" fill="rgba(255,255,255,.8)"/>
      <rect x="28" y="42" width="8" height="3.5" rx="2" fill="rgba(255,255,255,.55)"/>
      <path d="M18 14c2.5-6 6-9 14-9" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 14c-2.5-6-6-9-14-9" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  const fab = doc.createElement("div");
  fab.className = "mr-fab";
  fab.setAttribute("role", "button");
  fab.setAttribute("aria-label", `Abrir chat con ${CONFIG.botName}`);
  fab.innerHTML = robotSVG();

  const teaser = doc.createElement("div");
  teaser.className = "mr-teaser";
  teaser.innerHTML = `
    <span class="dot"></span>
    <span><strong>${CONFIG.botName}</strong>: ¿Te ayudo a crecer o preferís improvisar?</span>
    <span class="x" aria-label="Cerrar">✕</span>
  `;

  const panel = doc.createElement("div");
  panel.className = "mr-panel";
  panel.innerHTML = `
    <div class="mr-head">
      <div class="mr-badge">ML</div>
      <div class="mr-meta">
        <div class="mr-title">${CONFIG.botName}</div>
        <div class="mr-sub">Corto. Útil. Con carácter.</div>
      </div>
      <div class="mr-close" aria-label="Cerrar">✕</div>
    </div>

    <div class="mr-body" id="mr-body"></div>

    <div class="mr-quick" id="mr-quick">
      <button data-q="audit">Quiero auditoría</button>
      <button data-q="ads">Quiero vender más</button>
      <button data-q="seo">Quiero SEO</button>
      <button data-q="contact">Contactar</button>
    </div>

    <div class="mr-input">
      <input id="mr-input" type="text" placeholder="Escribí acá…" />
      <button id="mr-send" type="button">Enviar</button>
    </div>
  `;

  doc.body.appendChild(fab);
  doc.body.appendChild(teaser);
  doc.body.appendChild(panel);

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
    return el;
  }

  function typingOn() {
    return addMsg(
      `<span class="mr-typing"><i></i><i></i><i></i></span>`,
      "bot",
      true
    );
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

  const swaggerLines = [
    "Vamos al grano.",
    "Dame datos y te digo la verdad.",
    "Si me respondés bien, te ahorro semanas.",
    "Prometo no hacerte perder tiempo (ni el mío).",
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const FLOW = [
    {
      key: "objective",
      q: "¿Cuál es tu objetivo principal hoy? (ventas, leads, awareness, SEO…)",
      hint: "Ej: “ventas por ecommerce”",
    },
    { key: "industry", q: "¿Rubro/industria?", hint: "Ej: “servicios”, “ecommerce moda”" },
    { key: "country", q: "¿En qué país/ciudad vendés?", hint: "Ej: “Argentina / CABA”" },
    {
      key: "budget",
      q: "Presupuesto mensual aproximado para marketing (ads + gestión).",
      hint: "Ej: “USD 1.000/mes” o “ARS 500k”",
    },
    { key: "timeline", q: "Timing: ¿cuándo querés resultados? (ya / 30 días / 90 días)", hint: "" },
    { key: "channels", q: "¿Qué canal te interesa más ahora? (Google Ads / Meta / SEO / Mixto)", hint: "" },
    { key: "site", q: "¿Ya tenés web? Pasame URL si querés (opcional).", hint: "" },
  ];

  function loadState() {
    try {
      const rawState = safe.get(localStorage, KEY.state);
      const rawAnswers = safe.get(localStorage, KEY.answers);
      const state = JSON.parse(rawState || "null");
      const answers = JSON.parse(rawAnswers || "{}");
      return { state: state || { step: 0, mode: "idle" }, answers: answers || {} };
    } catch {
      return { state: { step: 0, mode: "idle" }, answers: {} };
    }
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
<b>Listo.</b> Con esto ya puedo opinar con fundamentos.<br/><br/>
<b>Resumen</b><br/>
• Objetivo: ${answers.objective || "-"}<br/>
• Rubro: ${answers.industry || "-"}<br/>
• Mercado: ${answers.country || "-"}<br/>
• Presupuesto: ${answers.budget || "-"}<br/>
• Timing: ${answers.timeline || "-"}<br/>
• Canales: ${answers.channels || "-"}<br/>
• Web: ${answers.site || "-"}<br/><br/>
Ahora elegí cómo seguimos:
<br/>
<a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a> •
<a href="${CONFIG.calendlyUrl}" target="_blank" rel="noopener">Agendar</a> •
<a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>
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
      const line = `${item.q}${item.hint ? `\n\n(${item.hint})` : ""}`;
      addMsg(line, "bot");
    }, 520);
  }

  function startConversation() {
    const opening = `Soy ${CONFIG.botName}. ${pick(swaggerLines)}\n\n¿Querés que te haga 7 preguntas cortas para asesorarte en serio?`;
    addMsg(opening, "bot");
    addMsg(
      `Tip: si preferís ir directo, también sirve.\n• <a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a> • <a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>`,
      "bot",
      true
    );
  }

  if (!safe.get(localStorage, KEY.state)) startConversation();
  else addMsg(`Volviste. Bien. ¿Retomamos?`, "bot");

  function interpretYesNo(text) {
    const t = text.trim().toLowerCase();
    const yes = ["si", "sí", "dale", "ok", "de una", "vamos", "obvio", "yes"];
    const no = ["no", "despues", "después", "luego", "más tarde", "nah"];
    if (yes.some((w) => t === w || t.includes(w))) return "yes";
    if (no.some((w) => t === w || t.includes(w))) return "no";
    return null;
  }

  function handleQuick(action) {
    addMsg(
      action === "audit"
        ? "Quiero auditoría"
        : action === "ads"
        ? "Quiero vender más"
        : action === "seo"
        ? "Quiero SEO"
        : "Contactar",
      "me"
    );

    if (action === "contact") {
      const t2 = typingOn();
      setTimeout(() => {
        t2.remove();
        addMsg(
          `Bien. Elegí tu vía (y no me hagas adivinar):\n• Formulario\n• Agendar\n• WhatsApp`,
          "bot"
        );
        addMsg(
          `👉 <a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a> • <a href="${CONFIG.calendlyUrl}" target="_blank" rel="noopener">Agendar</a> • <a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>`,
          "bot",
          true
        );
      }, 520);
      return;
    }

    resetFlow();
    if (action === "ads") answers.objective = "ventas / performance";
    if (action === "seo") answers.objective = "SEO / posicionamiento orgánico";
    if (action === "audit") answers.objective = "auditoría + plan de acción";
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

    addMsg(text, "me");
    input.value = "";

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
          addMsg(
            "Perfecto. Yo no persigo a nadie. Si después querés, apretás el robot y seguimos.",
            "bot"
          );
        }, 520);
        return;
      }

      const t = typingOn();
      setTimeout(() => {
        t.remove();
        addMsg(
          "Te entiendo. Si me das 3 datos (rubro, país, presupuesto), te respondo con un plan realista.",
          "bot"
        );
        addMsg("¿Hacemos las 7 preguntas y lo dejamos prolijo?", "bot");
      }, 520);
      return;
    }

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

    const t = typingOn();
    setTimeout(() => {
      t.remove();
      addMsg("Ya tengo tu contexto. Si querés avanzar: formulario, agendar o WhatsApp. Elegí uno.", "bot");
      addMsg(
        `👉 <a href="${CONFIG.googleFormUrl}" target="_blank" rel="noopener">Formulario</a> • <a href="${CONFIG.calendlyUrl}" target="_blank" rel="noopener">Agendar</a> • <a href="${CONFIG.whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>`,
        "bot",
        true
      );
    }, 520);
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

  // If mid-flow, continue
  if (!state || !state.mode) {
    state = { step: 0, mode: "idle" };
    saveState(state, answers || {});
  } else if (state.mode === "qualify" && (state.step || 0) < FLOW.length) {
    addMsg("Tenés un flow a medio hacer. Si querés, lo terminamos rápido.", "bot");
    askCurrentStep();
  }
})();
