/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — AI CHATBOT
   Powered by Together AI (meta-llama/Llama-3.3-70B-Instruct-Turbo)

   Systeem prompt aanpassen: chatbot-prompt.md
   API key instellen: TOGETHER_API_KEY hieronder
═══════════════════════════════════════════════════════ */

const CHATBOT_CONFIG = {
  // ▼ Vervang met jouw Together AI key
  apiKey: 'TOGETHER_API_KEY_HIER',

  model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  maxTokens: 512,
  temperature: 0.7,

  // Prompt wordt geladen uit chatbot-prompt.md
  promptFile: '/chatbot-prompt.md',

  // Fallback prompt als het bestand niet laadbaar is
  fallbackPrompt: `Je bent de AI-assistent van Rocket Agency, een bureau gespecialiseerd in AI oplossingen, automatiseringen, social media en digitale marketing. Locatie: Otterlo. Contact: info@rocket-agency.nl / 06 298 129 28. Spreek altijd Nederlands, wees vriendelijk en direct.`
};

/* ── CHATBOT STATE ───────────────────────────────────── */
let chatHistory = [];
let systemPrompt = '';
let chatOpen = false;
let promptLoaded = false;

/* ── PROMPT LADEN ────────────────────────────────────── */
async function loadSystemPrompt() {
  try {
    const res = await fetch(CHATBOT_CONFIG.promptFile + '?v=' + Date.now());
    if (!res.ok) throw new Error('Prompt bestand niet gevonden');
    const md = await res.text();
    systemPrompt = md.trim();
    promptLoaded = true;
  } catch (e) {
    console.warn('[Chatbot] Prompt bestand niet geladen, fallback gebruikt:', e.message);
    systemPrompt = CHATBOT_CONFIG.fallbackPrompt;
    promptLoaded = true;
  }
}

/* ── HTML BOUWEN ─────────────────────────────────────── */
function buildChatbot() {
  const html = `
    <!-- CHATBOT TOGGLE BUTTON -->
    <button id="chat-toggle" aria-label="Chat openen" onclick="toggleChat()">
      <span id="chat-icon-open">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="12" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
        </svg>
      </span>
      <span id="chat-icon-close" style="display:none">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <span id="chat-notification"></span>
    </button>

    <!-- CHATBOT VENSTER -->
    <div id="chat-window" role="dialog" aria-label="Rocket Agency chat">
      <div id="chat-header">
        <div id="chat-header-info">
          <div id="chat-avatar">
            <img src="/img/favicon.png" alt="Rocket" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
            <span style="display:none">R</span>
          </div>
          <div>
            <div id="chat-name">Rocket AI</div>
            <div id="chat-status">
              <span class="status-dot"></span> Online
            </div>
          </div>
        </div>
        <button id="chat-close" onclick="toggleChat()" aria-label="Sluiten">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="chat-messages" aria-live="polite"></div>

      <div id="chat-suggestions" style="display:none">
        <button class="suggestion" onclick="sendSuggestion(this)">Wat doen jullie precies?</button>
        <button class="suggestion" onclick="sendSuggestion(this)">Wat kost een project?</button>
        <button class="suggestion" onclick="sendSuggestion(this)">Hoe werkt een AI chatbot?</button>
      </div>

      <div id="chat-input-wrap">
        <textarea
          id="chat-input"
          placeholder="Stel een vraag..."
          rows="1"
          aria-label="Bericht"
          onkeydown="handleKey(event)"
          oninput="autoResize(this)"
        ></textarea>
        <button id="chat-send" onclick="sendMessage()" aria-label="Versturen">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15.5 9L2.5 2.5L5.5 9L2.5 15.5L15.5 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div id="chat-footer-note">Rocket Agency AI · Aangedreven door Together AI</div>
    </div>
  `;

  const container = document.createElement('div');
  container.id = 'chatbot-root';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Welkomstbericht na korte delay
  setTimeout(showWelcome, 800);
}

/* ── WELCOME BERICHT ─────────────────────────────────── */
function showWelcome() {
  appendMessage('bot', 'Hallo! Ik ben de AI-assistent van Rocket Agency. Hoe kan ik je helpen?');
  document.getElementById('chat-suggestions').style.display = 'flex';

  // Notificatie op toggle knop tonen als chat gesloten is
  if (!chatOpen) {
    const notif = document.getElementById('chat-notification');
    if (notif) { notif.textContent = '1'; notif.style.display = 'flex'; }
  }
}

/* ── TOGGLE OPEN/DICHT ───────────────────────────────── */
function toggleChat() {
  chatOpen = !chatOpen;
  const win   = document.getElementById('chat-window');
  const open  = document.getElementById('chat-icon-open');
  const close = document.getElementById('chat-icon-close');
  const notif = document.getElementById('chat-notification');

  win.classList.toggle('open', chatOpen);
  open.style.display  = chatOpen ? 'none'  : 'flex';
  close.style.display = chatOpen ? 'flex'  : 'none';

  if (chatOpen) {
    if (notif) notif.style.display = 'none';
    setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
    scrollToBottom();
  }
}

/* ── BERICHT STUREN ──────────────────────────────────── */
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  // Suggesties verbergen
  document.getElementById('chat-suggestions').style.display = 'none';

  input.value = '';
  autoResize(input);

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  const typingId = showTyping();
  const btn = document.getElementById('chat-send');
  if (btn) btn.disabled = true;

  try {
    if (!promptLoaded) await loadSystemPrompt();

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATBOT_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CHATBOT_CONFIG.model,
        max_tokens: CHATBOT_CONFIG.maxTokens,
        temperature: CHATBOT_CONFIG.temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-10) // max 10 berichten context
        ]
      })
    });

    removeTyping(typingId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API fout ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, ik kon geen antwoord genereren.';

    chatHistory.push({ role: 'assistant', content: reply });
    appendMessage('bot', reply);

  } catch (err) {
    removeTyping(typingId);
    console.error('[Chatbot]', err);
    appendMessage('bot', 'Er ging iets mis. Probeer het opnieuw of neem direct contact op via info@rocket-agency.nl of 06 298 129 28.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function sendSuggestion(btn) {
  document.getElementById('chat-input').value = btn.textContent;
  sendMessage();
}

/* ── DOM HELPERS ─────────────────────────────────────── */
function appendMessage(role, text) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;

  const wrap = document.createElement('div');
  wrap.className = `chat-msg chat-msg-${role}`;

  if (role === 'bot') {
    const av = document.createElement('div');
    av.className = 'chat-msg-avatar';
    av.innerHTML = `<img src="/img/favicon.png" alt="R" onerror="this.outerHTML='<span>R</span>'"/>`;
    wrap.appendChild(av);
  }

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  // Simpele markdown: **bold**, newlines → <br>
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  wrap.appendChild(bubble);
  msgs.appendChild(wrap);
  scrollToBottom();
}

function showTyping() {
  const msgs = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg-bot';
  wrap.id = id;
  wrap.innerHTML = `
    <div class="chat-msg-avatar"><img src="/img/favicon.png" alt="R" onerror="this.outerHTML='<span>R</span>'"/></div>
    <div class="chat-bubble chat-typing">
      <span></span><span></span><span></span>
    </div>`;
  msgs.appendChild(wrap);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function scrollToBottom() {
  const msgs = document.getElementById('chat-messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* ── CSS ─────────────────────────────────────────────── */
function injectChatStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── ROOT ── */
    #chatbot-root { position: fixed; bottom: 28px; right: 28px; z-index: 9990; font-family: var(--font-body, 'DM Sans', sans-serif); }

    /* ── TOGGLE BUTTON ── */
    #chat-toggle {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #c9a84c, #e8c96a);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #080808;
      box-shadow: 0 4px 24px rgba(201,168,76,.35);
      transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s;
      position: relative; z-index: 2; margin-left: auto;
    }
    #chat-toggle:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(201,168,76,.45); }
    #chat-toggle > span { display: flex; align-items: center; justify-content: center; }

    /* Notificatie dot */
    #chat-notification {
      display: none;
      position: absolute; top: -2px; right: -2px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #e53935; color: white;
      font-size: 11px; font-weight: 700;
      align-items: center; justify-content: center;
      border: 2px solid #080808;
    }

    /* ── CHAT WINDOW ── */
    #chat-window {
      position: absolute; bottom: 72px; right: 0;
      width: 380px;
      background: #0f0f0f;
      border: 1px solid rgba(201,168,76,.2);
      border-radius: 4px;
      display: flex; flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,.6);
      opacity: 0; transform: translateY(16px) scale(.97);
      pointer-events: none;
      transition: opacity .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1);
      max-height: 560px;
    }
    #chat-window.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }

    /* ── HEADER ── */
    #chat-header {
      background: #080808;
      border-bottom: 1px solid rgba(201,168,76,.15);
      padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    #chat-header-info { display: flex; align-items: center; gap: 12px; }
    #chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #c9a84c, rgba(201,168,76,.3));
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0;
    }
    #chat-avatar img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
    #chat-avatar span { color: #080808; font-weight: 800; font-size: .9rem; }
    #chat-name { font-family: var(--font-ui, 'Syne', sans-serif); font-weight: 700; font-size: .9rem; letter-spacing: .05em; color: #f2ede6; }
    #chat-status { font-size: .75rem; color: #7a7065; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4caf50; display: inline-block; animation: pulse-dot 2s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.5} }
    #chat-close { background: none; border: none; color: #7a7065; cursor: pointer; padding: 4px; transition: color .2s; display: flex; }
    #chat-close:hover { color: #f2ede6; }

    /* ── MESSAGES ── */
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 20px 16px;
      display: flex; flex-direction: column; gap: 14px;
      scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.2) transparent;
    }
    #chat-messages::-webkit-scrollbar { width: 4px; }
    #chat-messages::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 2px; }

    .chat-msg { display: flex; gap: 10px; align-items: flex-end; animation: msgIn .3s cubic-bezier(.16,1,.3,1); }
    @keyframes msgIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .chat-msg-user { flex-direction: row-reverse; }

    .chat-msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,#c9a84c,rgba(201,168,76,.3)); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
    .chat-msg-avatar img { width:100%; height:100%; object-fit:contain; padding:4px; }
    .chat-msg-avatar span { color:#080808; font-weight:800; font-size:.7rem; }

    .chat-bubble {
      max-width: 80%; padding: 12px 16px; border-radius: 4px;
      font-size: .92rem; line-height: 1.6; color: #f2ede6;
    }
    .chat-msg-bot .chat-bubble { background: #181818; border: 1px solid rgba(201,168,76,.12); border-bottom-left-radius: 2px; }
    .chat-msg-user .chat-bubble { background: linear-gradient(135deg,#c9a84c,#e8c96a); color: #080808; font-weight: 500; border-bottom-right-radius: 2px; }

    /* Typing indicator */
    .chat-typing { display: flex; gap: 5px; align-items: center; padding: 14px 16px; }
    .chat-typing span { width: 7px; height: 7px; background: #7a7065; border-radius: 50%; animation: typingBounce 1.2s ease-in-out infinite; }
    .chat-typing span:nth-child(2) { animation-delay: .2s; }
    .chat-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    /* ── SUGGESTIONS ── */
    #chat-suggestions {
      padding: 0 16px 12px;
      display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
    }
    .suggestion {
      font-family: var(--font-ui, 'Syne', sans-serif);
      font-size: .68rem; letter-spacing: .08em;
      color: #c9a84c; background: rgba(201,168,76,.06);
      border: 1px solid rgba(201,168,76,.2);
      padding: 7px 13px; border-radius: 20px; cursor: pointer;
      transition: background .2s, border-color .2s;
      white-space: nowrap;
    }
    .suggestion:hover { background: rgba(201,168,76,.12); border-color: rgba(201,168,76,.4); }

    /* ── INPUT ── */
    #chat-input-wrap {
      padding: 12px 16px; border-top: 1px solid rgba(201,168,76,.1);
      display: flex; gap: 10px; align-items: flex-end; flex-shrink: 0;
      background: #080808;
    }
    #chat-input {
      flex: 1; background: #181818; border: 1px solid rgba(201,168,76,.15);
      color: #f2ede6; font-family: var(--font-body,'DM Sans',sans-serif);
      font-size: .9rem; font-weight: 300; padding: 10px 14px;
      border-radius: 3px; outline: none; resize: none;
      line-height: 1.5; max-height: 120px;
      transition: border-color .2s;
    }
    #chat-input:focus { border-color: rgba(201,168,76,.4); }
    #chat-input::placeholder { color: #7a7065; opacity:.7; }
    #chat-send {
      width: 40px; height: 40px; border-radius: 3px; flex-shrink: 0;
      background: linear-gradient(135deg,#c9a84c,#e8c96a);
      border: none; cursor: pointer; color: #080808;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .2s, transform .2s;
    }
    #chat-send:hover { opacity:.9; transform: scale(1.05); }
    #chat-send:disabled { opacity:.4; transform: none; cursor: not-allowed; }

    /* ── FOOTER NOTE ── */
    #chat-footer-note {
      font-size: .65rem; color: #7a7065; text-align: center;
      padding: 6px 16px 10px; background: #080808;
      letter-spacing: .06em; flex-shrink: 0;
    }

    /* ── MOBILE ── */
    @media (max-width: 500px) {
      #chatbot-root { bottom: 16px; right: 16px; left: 16px; }
      #chat-window { width: 100%; right: 0; left: 0; bottom: 72px; }
    }
  `;
  document.head.appendChild(style);
}

/* ── INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectChatStyles();
  buildChatbot();
  loadSystemPrompt(); // pre-load prompt op achtergrond
});
