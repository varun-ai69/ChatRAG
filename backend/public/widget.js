(function () {
  const scriptTag = document.currentScript;
  const apiKey = scriptTag.getAttribute("data-api-key");
  const API_BASE ="https://chatrag-jz3p.onrender.com/api/chat";

  let sessionId = null;
  let botConfig = {
    name: "Assistant",
    company: "",
    welcomeMessage: "",
    avatar: null,
    primaryColor:    "#6C63FF",
    userBubbleColor: "#6C63FF",
    userTextColor:   "#ffffff",
    botBubbleColor:  "#f0efff",
    botTextColor:    "#1a1a2e",
    headerBg:        "#6C63FF",
    headerText:      "#ffffff",
  };

  // ── Google Font ─────────────────────────────────────────────────────────────
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
  document.head.appendChild(fontLink);

  // ── SVG Icons ───────────────────────────────────────────────────────────────
  const DEFAULT_AVATAR = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.2)"/>
    <rect x="12" y="10" width="16" height="12" rx="4" fill="white"/>
    <circle cx="16" cy="15" r="2" fill="rgba(0,0,0,0.25)"/>
    <circle cx="24" cy="15" r="2" fill="rgba(0,0,0,0.25)"/>
    <rect x="18" y="20" width="4" height="2" rx="1" fill="rgba(0,0,0,0.2)"/>
    <rect x="9" y="14" width="3" height="5" rx="1.5" fill="white"/>
    <rect x="28" y="14" width="3" height="5" rx="1.5" fill="white"/>
    <rect x="15" y="22" width="10" height="10" rx="3" fill="white"/>
    <rect x="13" y="27" width="4" height="7" rx="2" fill="white"/>
    <rect x="23" y="27" width="4" height="7" rx="2" fill="white"/>
  </svg>`;

  const SEND_ICON  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CLOSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const CHAT_ICON  = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.2)"/></svg>`;
  const USER_ICON  = `<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="8" r="4" fill="white"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;

  // ── Base styles — ALL colors use CSS variables, ZERO hardcoded hex ──────────
  const style = document.createElement("style");
  style.innerHTML = `
    #cw-launcher {
      position: fixed; bottom: 24px; right: 24px;
      width: 62px; height: 62px;
      background: var(--cw-primary);
      border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 99999; color: white;
      box-shadow: 0 8px 24px var(--cw-primary-shadow);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    }
    #cw-launcher:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 32px var(--cw-primary-shadow);
    }
    #cw-launcher::before {
      content: ''; position: absolute; inset: -5px;
      border-radius: 50%; border: 2px solid var(--cw-primary); opacity: 0;
      animation: cw-pulse 2.5s ease-out infinite;
    }
    @keyframes cw-pulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.7); opacity: 0; }
    }

    #cw-window {
      position: fixed; bottom: 100px; right: 24px;
      width: 368px; height: 540px;
      background: #fff; border-radius: 20px;
      box-shadow: 0 20px 60px var(--cw-primary-shadow), 0 8px 24px rgba(0,0,0,0.1);
      display: flex; flex-direction: column; overflow: hidden;
      z-index: 99998; font-family: 'DM Sans', sans-serif;
      transform: scale(0.85) translateY(20px); opacity: 0; pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
      transform-origin: bottom right;
    }
    #cw-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    /* ── Header ── */
    #cw-header {
      background: var(--cw-header-bg);
      color: var(--cw-header-text);
      padding: 14px 16px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0; position: relative; z-index: 2;
    }
    #cw-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      border: 2px solid rgba(255,255,255,0.4);
    }
    #cw-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    #cw-header-info { flex: 1; }
    #cw-bot-name {
      font-size: 15px; font-weight: 700; letter-spacing: -0.2px;
      color: var(--cw-header-text);
    }
    #cw-status {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; margin-top: 2px;
      color: var(--cw-header-text); opacity: 0.85;
    }
    #cw-status-dot {
      width: 7px; height: 7px; background: #4ade80; border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
      animation: cw-blink 2s ease-in-out infinite;
    }
    @keyframes cw-blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    #cw-close {
      cursor: pointer; display: flex; align-items: center;
      padding: 6px; border-radius: 8px;
      color: var(--cw-header-text); opacity: 0.8; transition: all 0.2s;
    }
    #cw-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }

    /* ── Intro overlay ── */
    #cw-intro {
      position: absolute; inset: 0;
      background: var(--cw-header-bg);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; z-index: 5; padding: 32px 28px;
      text-align: center; color: var(--cw-header-text);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    #cw-intro.hidden { opacity: 0; transform: translateY(-16px); pointer-events: none; }
    #cw-intro-avatar {
      width: 76px; height: 76px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 22px; border: 3px solid rgba(255,255,255,0.5);
      overflow: hidden;
      animation: cw-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
    }
    @keyframes cw-pop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
    #cw-intro-title {
      font-size: 24px; font-weight: 700; margin-bottom: 10px;
      color: var(--cw-header-text);
      overflow: hidden; white-space: nowrap;
      border-right: 2px solid var(--cw-header-text);
      width: 0; max-width: 100%;
      animation: cw-type 0.9s steps(20) 0.6s forwards, cw-cursor 0.6s step-end 0.6s 4;
    }
    @keyframes cw-type   { to { width: 100%; } }
    @keyframes cw-cursor { 50% { border-color: transparent; } }
    #cw-intro-sub {
      font-size: 14px; opacity: 0; line-height: 1.6; font-weight: 500;
      max-width: 250px; color: var(--cw-header-text);
      animation: cw-fadein 0.5s ease 1.9s forwards;
    }
    #cw-intro-btn {
      margin-top: 26px; background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.5); color: var(--cw-header-text);
      padding: 11px 28px; border-radius: 100px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      font-family: 'DM Sans', sans-serif; opacity: 0;
      animation: cw-fadein 0.5s ease 2.3s forwards;
      transition: background 0.2s, transform 0.2s; backdrop-filter: blur(10px);
    }
    #cw-intro-btn:hover { background: rgba(255,255,255,0.28); transform: scale(1.04); }
    @keyframes cw-fadein { to { opacity: 1; } }

    /* ── Messages ── */
    #cw-messages {
      flex: 1; padding: 16px 14px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
      background: #fafafa; scroll-behavior: smooth;
    }
    #cw-messages::-webkit-scrollbar { width: 4px; }
    #cw-messages::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

    .cw-row {
      display: flex; align-items: flex-end; gap: 8px;
      animation: cw-msg-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes cw-msg-in { from { transform:translateY(10px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .cw-row.user { flex-direction: row-reverse; }

    .cw-row-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      background: var(--cw-primary);
      border: 1.5px solid var(--cw-primary-faint);
    }
    .cw-row-avatar img { width:100%; height:100%; object-fit:cover; }

    /* Bot bubble — uses CSS vars, no hardcoded colors */
    .cw-bubble { max-width: 74%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.55; word-break: break-word; }
    .cw-row.bot  .cw-bubble { background: var(--cw-bot-bubble-bg);  color: var(--cw-bot-bubble-text);  border-bottom-left-radius:  4px; }
    .cw-row.user .cw-bubble { background: var(--cw-user-bubble-bg); color: var(--cw-user-bubble-text); border-bottom-right-radius: 4px; }

    /* ── Typing indicator ── */
    #cw-typing-row { display: none; align-items: flex-end; gap: 8px; animation: cw-msg-in 0.3s ease; }
    .cw-typing-bubble {
      background: var(--cw-bot-bubble-bg);
      padding: 12px 16px; border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: flex; gap: 5px; align-items: center;
    }
    .cw-dot {
      width: 7px; height: 7px;
      background: var(--cw-primary);
      border-radius: 50%; opacity: 0.4;
      animation: cw-bounce 1.2s ease-in-out infinite;
    }
    .cw-dot:nth-child(2) { animation-delay: 0.2s; }
    .cw-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cw-bounce { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-7px); opacity:1; } }

    /* ── Input ── */
    #cw-input-area {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; border-top: 1px solid #f0f0f0;
      background: #fff; flex-shrink: 0;
    }
    #cw-input {
      flex: 1; border: 1.5px solid #ebebeb; border-radius: 100px;
      padding: 10px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif;
      outline: none; background: #fafafa; color: #1a1a2e;
      transition: border-color 0.2s, background 0.2s;
    }
    #cw-input:focus { border-color: var(--cw-primary); background: #fff; }
    #cw-input::placeholder { color: #bbb; }
    #cw-input:disabled { opacity: 0.5; }
    #cw-send {
      width: 42px; height: 42px; border-radius: 50%;
      background: var(--cw-primary);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--cw-header-text);
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    #cw-send:hover:not(:disabled) { transform: scale(1.12); }
    #cw-send:disabled { background: #ccc; cursor: not-allowed; transform: none; }

    #cw-footer {
      text-align: center; font-size: 11px; color: #ccc;
      padding: 6px; background: #fff;
      font-family: 'DM Sans', sans-serif; flex-shrink: 0;
    }

    @media (max-width: 420px) {
      #cw-window { width: calc(100vw - 20px); right: 10px; bottom: 84px; height: 480px; }
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ───────────────────────────────────────────────────────────────
  const launcher = document.createElement("div");
  launcher.id = "cw-launcher";
  launcher.innerHTML = CHAT_ICON;

  const win = document.createElement("div");
  win.id = "cw-window";
  win.innerHTML = `
    <div id="cw-intro">
      <div id="cw-intro-avatar">${DEFAULT_AVATAR}</div>
      <div id="cw-intro-title">Hey there! 👋</div>
      <div id="cw-intro-sub">Loading...</div>
      <button id="cw-intro-btn">Start Chatting →</button>
    </div>
    <div id="cw-header">
      <div id="cw-avatar">${DEFAULT_AVATAR}</div>
      <div id="cw-header-info">
        <div id="cw-bot-name">Assistant</div>
        <div id="cw-status"><div id="cw-status-dot"></div><span>Online</span></div>
      </div>
      <div id="cw-close">${CLOSE_ICON}</div>
    </div>
    <div id="cw-messages">
      <div id="cw-typing-row">
        <div class="cw-row-avatar" id="cw-typing-avatar">${DEFAULT_AVATAR}</div>
        <div class="cw-typing-bubble">
          <div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>
        </div>
      </div>
    </div>
    <div id="cw-input-area">
      <input id="cw-input" placeholder="Type a message..." autocomplete="off" />
      <button id="cw-send">${SEND_ICON}</button>
    </div>
    <div id="cw-footer">Powered by ChatRAG</div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  const messagesDiv    = win.querySelector("#cw-messages");
  const input          = win.querySelector("#cw-input");
  const sendBtn        = win.querySelector("#cw-send");
  const typingRow      = win.querySelector("#cw-typing-row");
  const botNameEl      = win.querySelector("#cw-bot-name");
  const avatarEl       = win.querySelector("#cw-avatar");
  const typingAvatarEl = win.querySelector("#cw-typing-avatar");
  const introEl        = win.querySelector("#cw-intro");
  const introAvatarEl  = win.querySelector("#cw-intro-avatar");
  const introSubEl     = win.querySelector("#cw-intro-sub");
  const introTitleEl   = win.querySelector("#cw-intro-title");
  const introBtn       = win.querySelector("#cw-intro-btn");
  const closeBtn       = win.querySelector("#cw-close");

  // ── applyConfig — single source of truth for ALL theming ───────────────────
  // Everything goes through CSS variables on #cw-window.
  // The base stylesheet reads only these variables — no other color sources exist.
  function applyConfig(cfg) {
    // Helper: hex → rgba string for shadows
    function hexAlpha(hex, a) {
      try {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
      } catch { return `rgba(108,99,255,${a})`; }
    }

    // Set every CSS variable on the widget root
    const root = win;
    root.style.setProperty("--cw-primary",           cfg.primaryColor    || "#6C63FF");
    root.style.setProperty("--cw-primary-shadow",    hexAlpha(cfg.primaryColor || "#6C63FF", 0.35));
    root.style.setProperty("--cw-primary-faint",     hexAlpha(cfg.primaryColor || "#6C63FF", 0.2));
    root.style.setProperty("--cw-header-bg",         cfg.headerBg        || cfg.primaryColor || "#6C63FF");
    root.style.setProperty("--cw-header-text",       cfg.headerText      || "#ffffff");
    root.style.setProperty("--cw-bot-bubble-bg",     cfg.botBubbleColor  || "#f0efff");
    root.style.setProperty("--cw-bot-bubble-text",   cfg.botTextColor    || "#1a1a2e");
    root.style.setProperty("--cw-user-bubble-bg",    cfg.userBubbleColor || cfg.primaryColor || "#6C63FF");
    root.style.setProperty("--cw-user-bubble-text",  cfg.userTextColor   || "#ffffff");

    // Launcher sits outside #cw-window so set vars on it separately
    launcher.style.setProperty("--cw-primary",        cfg.primaryColor    || "#6C63FF");
    launcher.style.setProperty("--cw-primary-shadow", hexAlpha(cfg.primaryColor || "#6C63FF", 0.45));
    // Also set background directly since launcher uses var(--cw-primary)
    // but some browsers don't inherit from a sibling element
    launcher.style.background   = cfg.primaryColor || "#6C63FF";
    launcher.style.boxShadow    = `0 8px 24px ${hexAlpha(cfg.primaryColor || "#6C63FF", 0.45)}`;

    // ── Content updates ─────────────────────────────────────────────────────
    botNameEl.textContent = cfg.name || "Assistant";

    const avatarHTML = cfg.avatar
      ? `<img src="${cfg.avatar}" alt="bot" />`
      : DEFAULT_AVATAR;

    avatarEl.innerHTML       = avatarHTML;
    typingAvatarEl.innerHTML = avatarHTML;
    introAvatarEl.innerHTML  = cfg.avatar
      ? `<img src="${cfg.avatar}" alt="bot" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : DEFAULT_AVATAR;

    introSubEl.textContent = `I'm ${cfg.name || "Assistant"}${cfg.company ? ` from ${cfg.company}` : ""}. How can I assist you today?`;

    // Re-trigger typewriter on intro title
    introTitleEl.style.animation = "none";
    void introTitleEl.offsetHeight; // force reflow
    introTitleEl.style.animation  = "";

    // Update send button text color to match header text (best contrast on primaryColor)
    sendBtn.style.color = cfg.headerText || "#ffffff";

    // Patch existing bot bubbles already in the DOM (e.g. welcome message)
    win.querySelectorAll(".cw-row.bot .cw-bubble").forEach(el => {
      el.style.background = cfg.botBubbleColor  || "#f0efff";
      el.style.color      = cfg.botTextColor    || "#1a1a2e";
    });
    win.querySelectorAll(".cw-row.user .cw-bubble").forEach(el => {
      el.style.background = cfg.userBubbleColor || cfg.primaryColor || "#6C63FF";
      el.style.color      = cfg.userTextColor   || "#ffffff";
    });
    win.querySelectorAll(".cw-row-avatar").forEach(el => {
      el.style.background   = cfg.primaryColor || "#6C63FF";
      el.style.borderColor  = hexAlpha(cfg.primaryColor || "#6C63FF", 0.2);
    });
  }

  // ── Open / Close ────────────────────────────────────────────────────────────
  let isOpen = false;
  let introDismissed = false;

  function dismissIntro() {
    if (introDismissed) return;
    introDismissed = true;
    introEl.classList.add("hidden");
    setTimeout(() => { introEl.style.display = "none"; }, 500);
  }

  launcher.onclick = () => {
    isOpen = !isOpen;
    win.classList.toggle("open", isOpen);
    launcher.innerHTML = isOpen ? CLOSE_ICON : CHAT_ICON;
  };
  closeBtn.onclick = () => {
    isOpen = false;
    win.classList.remove("open");
    launcher.innerHTML = CHAT_ICON;
  };
  introBtn.onclick = dismissIntro;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function escapeHtml(t) {
    return String(t)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\n/g,"<br>");
  }

  function addMessage(text, role) {
    const isBot = role !== "user";
    const row   = document.createElement("div");
    row.className = `cw-row ${isBot ? "bot" : "user"}`;

    const avatarHTML = isBot
      ? (botConfig.avatar ? `<img src="${botConfig.avatar}" alt="bot" />` : DEFAULT_AVATAR)
      : USER_ICON;

    // Inline styles on new bubbles so they pick up the current config
    // even if applyConfig hasn't been re-called since this message was added
    const bubbleStyle = isBot
      ? `background:${botConfig.botBubbleColor||"#f0efff"};color:${botConfig.botTextColor||"#1a1a2e"}`
      : `background:${botConfig.userBubbleColor||botConfig.primaryColor||"#6C63FF"};color:${botConfig.userTextColor||"#ffffff"}`;

    const avatarStyle = `background:${botConfig.primaryColor||"#6C63FF"};border-color:rgba(0,0,0,0.1)`;

    row.innerHTML = `
      <div class="cw-row-avatar" style="${avatarStyle}">${avatarHTML}</div>
      <div class="cw-bubble" style="${bubbleStyle}">${escapeHtml(text)}</div>
    `;
    messagesDiv.insertBefore(row, typingRow);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function setLoading(on) {
    sendBtn.disabled    = on;
    input.disabled      = on;
    typingRow.style.display = on ? "flex" : "none";
    if (on) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // ── Init session ────────────────────────────────────────────────────────────
  async function initSession() {
    try {
      const res = await fetch(`${API_BASE}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ pageUrl: window.location.href }),
      });
      if (!res.ok) throw new Error("Session init failed");
      const data = await res.json();
      sessionId = data.sessionId;

      const b = data.bot || {};
      if (b.name)           botConfig.name           = b.name;
      if (b.company)        botConfig.company         = b.company;
      if (b.welcomeMessage) botConfig.welcomeMessage  = b.welcomeMessage;
      if (b.avatar)         botConfig.avatar          = b.avatar;
      if (b.primaryColor) {
        botConfig.primaryColor    = b.primaryColor;
        // Only override bubble/header if not explicitly set
        if (!b.userBubbleColor) botConfig.userBubbleColor = b.primaryColor;
        if (!b.headerBg)        botConfig.headerBg        = b.primaryColor;
      }
      if (b.userBubbleColor) botConfig.userBubbleColor = b.userBubbleColor;
      if (b.userTextColor)   botConfig.userTextColor   = b.userTextColor;
      if (b.botBubbleColor)  botConfig.botBubbleColor  = b.botBubbleColor;
      if (b.botTextColor)    botConfig.botTextColor    = b.botTextColor;
      if (b.headerBg)        botConfig.headerBg        = b.headerBg;
      if (b.headerText)      botConfig.headerText      = b.headerText;

      applyConfig(botConfig);

      if (botConfig.welcomeMessage) {
        setTimeout(() => addMessage(botConfig.welcomeMessage, "assistant"), 2800);
      }
    } catch (err) {
      console.error("[ChatWidget]", err);
      introSubEl.textContent = "Could not connect. Please try again.";
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || !sessionId) return;
    dismissIntro();
    addMessage(text, "user");
    input.value = "";
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ sessionId, query: text }),
      });
      if (res.status === 404) {
        await initSession();
        setLoading(false);
        addMessage("Session refreshed. Please send your message again.", "assistant");
        return;
      }
      if (!res.ok) throw new Error("Message failed");
      const data = await res.json();
      addMessage(data.answer, "assistant");
    } catch (err) {
      console.error("[ChatWidget]", err);
      addMessage("Something went wrong. Please try again.", "assistant");
    } finally {
      setLoading(false);
      input.focus();
    }
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

  // ── Boot ────────────────────────────────────────────────────────────────────
  applyConfig(botConfig); // apply defaults immediately so widget isn't flash-unstyled
  initSession();
})();