/**
 * Fitness Buddy — Frontend Application
 * Handles chat UI, API calls, markdown rendering
 */

(function () {
  'use strict';

  // ── DOM References ─────────────────────────────────────────────
  const chatWindow   = document.getElementById('chatWindow');
  const userInput    = document.getElementById('userInput');
  const sendBtn      = document.getElementById('sendBtn');
  const clearBtn     = document.getElementById('clearBtn');
  const typingInd    = document.getElementById('typingIndicator');
  const welcomeCard  = document.getElementById('welcomeCard');
  const menuBtn      = document.getElementById('menuBtn');
  const sidebar      = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  const statMessages = document.getElementById('statMessages');

  // ── State ──────────────────────────────────────────────────────
  const history = [];        // [{role, content}]
  let messageCount = 0;
  let isLoading = false;

  // ── Sidebar Toggle ─────────────────────────────────────────────
  menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuBtn) {
      sidebar.classList.remove('open');
    }
  });

  // ── Auto-resize textarea ───────────────────────────────────────
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
  });

  // ── Send on Enter (Shift+Enter = newline) ──────────────────────
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener('click', handleSend);

  // ── Quick buttons & chips ──────────────────────────────────────
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-msg]');
    if (btn) {
      const msg = btn.getAttribute('data-msg');
      userInput.value = msg;
      userInput.style.height = 'auto';
      sidebar.classList.remove('open');
      handleSend();
    }
  });

  // ── Clear conversation ─────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear the conversation?')) return;
    history.length = 0;
    chatWindow.innerHTML = '';
    chatWindow.appendChild(welcomeCard);
    welcomeCard.style.display = '';
    messageCount = 0;
    statMessages.textContent = '0';
  });

  // ── Core: handle send ──────────────────────────────────────────
  async function handleSend() {
    const text = userInput.value.trim();
    if (!text || isLoading) return;

    // Hide welcome card on first message
    if (welcomeCard.parentNode) {
      welcomeCard.style.display = 'none';
    }

    userInput.value = '';
    userInput.style.height = 'auto';

    // Render user message
    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    messageCount++;
    statMessages.textContent = messageCount;

    // Show typing indicator
    setLoading(true);

    try {
      const reply = await fetchReply(text);
      appendMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
      messageCount++;
      statMessages.textContent = messageCount;
    } catch (err) {
      showToast('Network error. Please try again.');
    } finally {
      setLoading(false);
      userInput.focus();
    }
  }

  // ── API call ───────────────────────────────────────────────────
  async function fetchReply(message) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history.slice(-8) })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Server error');
    }

    const data = await res.json();
    return data.reply || 'Sorry, I had trouble understanding that. Please try again!';
  }

  // ── Render message ─────────────────────────────────────────────
  function appendMessage(role, content) {
    const isBot = role === 'bot';

    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = isBot ? '🤖' : 'U';

    const body = document.createElement('div');
    body.className = 'msg-body';

    const name = document.createElement('div');
    name.className = 'msg-name';
    name.textContent = isBot ? 'Fitness Buddy' : 'You';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = isBot ? renderMarkdown(content) : escapeHtml(content);

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = formatTime(new Date());

    body.appendChild(name);
    body.appendChild(bubble);
    body.appendChild(time);
    wrapper.appendChild(avatar);
    wrapper.appendChild(body);
    chatWindow.appendChild(wrapper);

    scrollToBottom();
  }

  // ── Lightweight markdown renderer ─────────────────────────────
  function renderMarkdown(text) {
    let html = escapeHtml(text);

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

    // Bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Bullet list lines
    html = html.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Numbered list
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Block quotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid var(--accent);padding-left:12px;color:var(--text-muted);margin:6px 0">$1</blockquote>');

    // Double newlines to paragraphs
    const parts = html.split(/\n\n+/);
    html = parts.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<ul>') || p.startsWith('<ol>') || p.startsWith('<h') || p.startsWith('<blockquote')) return p;
      // Convert remaining single newlines
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Helpers ────────────────────────────────────────────────────
  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    typingInd.classList.toggle('hidden', !state);
    if (state) scrollToBottom();
  }

  function scrollToBottom() {
    const main = document.querySelector('.chat-main');
    setTimeout(() => { main.scrollTop = main.scrollHeight; }, 50);
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function showToast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

})();
