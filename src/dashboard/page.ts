export function renderDashboardHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Aether Gateway</title>
    <style>
      :root {
        --bg: #071019;
        --bg-2: #0b1622;
        --panel: rgba(10, 19, 30, 0.88);
        --panel-strong: rgba(8, 15, 24, 0.96);
        --panel-soft: rgba(17, 28, 42, 0.88);
        --line: rgba(137, 185, 226, 0.18);
        --line-strong: rgba(137, 185, 226, 0.28);
        --text: #edf6ff;
        --muted: #8fa4bb;
        --accent: #75e7ca;
        --accent-2: #8cb8ff;
        --accent-3: #ffd07f;
        --danger: #ff8e84;
        --success: #88f0a8;
        --shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
        --radius-xl: 28px;
        --radius-lg: 22px;
        --radius-md: 16px;
        --radius-sm: 12px;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        min-height: 100%;
      }

      body {
        color: var(--text);
        font-family: "Iosevka Aile", "IBM Plex Sans", "Avenir Next", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(117, 231, 202, 0.12), transparent 24%),
          radial-gradient(circle at top right, rgba(140, 184, 255, 0.14), transparent 22%),
          radial-gradient(circle at bottom center, rgba(255, 208, 127, 0.08), transparent 25%),
          linear-gradient(180deg, #102031 0%, var(--bg) 45%, #050b12 100%);
      }

      button, input, textarea, select {
        font: inherit;
      }

      button {
        cursor: pointer;
        border: 0;
      }

      .app {
        min-height: 100vh;
        padding: 18px;
      }

      .frame {
        min-height: calc(100vh - 36px);
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr) 360px;
        gap: 16px;
      }

      .panel {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow);
        backdrop-filter: blur(20px);
        overflow: hidden;
      }

      .left-rail,
      .center-column,
      .right-rail {
        min-height: 0;
      }

      .left-rail,
      .right-rail {
        display: flex;
        flex-direction: column;
      }

      .center-column {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
      }

      .section {
        padding: 18px;
        border-bottom: 1px solid var(--line);
      }

      .section:last-child {
        border-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 11px;
        color: var(--accent);
      }

      h1, h2, h3, p {
        margin: 0;
      }

      h1 {
        font-size: clamp(28px, 3vw, 42px);
        line-height: 0.95;
        margin-top: 8px;
      }

      h2 {
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent-2);
      }

      .subtle {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }

      .hero {
        padding: 24px;
        background:
          linear-gradient(145deg, rgba(13, 25, 38, 0.98), rgba(7, 13, 20, 0.94)),
          var(--panel-strong);
      }

      .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: end;
      }

      .pill-row,
      .button-row,
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .pill,
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 11px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.02);
        color: var(--muted);
        font-size: 12px;
      }

      .chip.active {
        border-color: rgba(117, 231, 202, 0.35);
        color: var(--accent);
        background: rgba(117, 231, 202, 0.08);
      }

      .ghost-button,
      .action-button,
      .routine-button,
      .mini-button,
      .icon-button {
        border-radius: 999px;
        transition: 160ms ease;
      }

      .ghost-button,
      .routine-button,
      .mini-button,
      .icon-button {
        background: rgba(255, 255, 255, 0.03);
        color: var(--text);
        border: 1px solid var(--line);
      }

      .action-button {
        background: linear-gradient(135deg, rgba(117, 231, 202, 0.92), rgba(140, 184, 255, 0.92));
        color: #061018;
        font-weight: 700;
        padding: 11px 16px;
      }

      .ghost-button {
        padding: 11px 16px;
      }

      .routine-button,
      .mini-button,
      .icon-button {
        padding: 8px 12px;
        font-size: 12px;
      }

      .icon-button {
        padding: 8px 10px;
      }

      .ghost-button:hover,
      .action-button:hover,
      .routine-button:hover,
      .mini-button:hover,
      .icon-button:hover {
        transform: translateY(-1px);
        border-color: var(--line-strong);
      }

      .thread-list,
      .stack {
        display: grid;
        gap: 10px;
      }

      .thread-scroller,
      .rail-scroll,
      .messages {
        overflow: auto;
      }

      .thread-scroller {
        padding: 0 18px 18px;
        min-height: 0;
      }

      .thread-card {
        width: 100%;
        text-align: left;
        padding: 14px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.025);
      }

      .thread-card.active {
        border-color: rgba(117, 231, 202, 0.36);
        background: linear-gradient(180deg, rgba(117, 231, 202, 0.08), rgba(140, 184, 255, 0.04));
      }

      .thread-card-header,
      .meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .thread-title {
        font-size: 14px;
        font-weight: 700;
      }

      .tiny {
        font-size: 11px;
        color: var(--muted);
      }

      .preview {
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .channel-list,
      .routine-list {
        display: grid;
        gap: 8px;
      }

      .status-row,
      .routine-item,
      .card,
      .message,
      .chart-item,
      .brief-card {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel-soft);
      }

      .status-row,
      .routine-item,
      .card,
      .chart-item,
      .brief-card {
        padding: 14px;
      }

      .status-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--muted);
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.03);
      }

      .status-dot.live {
        background: var(--success);
      }

      .conversation-shell {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
      }

      .conversation-header {
        padding: 18px 22px;
        border-bottom: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0));
      }

      .messages {
        padding: 18px 22px 24px;
        display: grid;
        gap: 12px;
        align-content: start;
        min-height: 0;
      }

      .message {
        padding: 16px;
        max-width: 92%;
      }

      .message.user {
        justify-self: end;
        background: linear-gradient(180deg, rgba(117, 231, 202, 0.08), rgba(117, 231, 202, 0.04));
        border-color: rgba(117, 231, 202, 0.28);
      }

      .message.assistant {
        justify-self: start;
      }

      .message-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .message-role {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 11px;
        color: var(--accent-2);
      }

      .message.user .message-role {
        color: var(--accent);
      }

      .message-content {
        white-space: pre-wrap;
        line-height: 1.6;
        font-size: 14px;
      }

      .attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .attachment {
        padding: 7px 10px;
        border-radius: 999px;
        border: 1px solid rgba(140, 184, 255, 0.24);
        color: var(--accent-2);
        font-size: 12px;
      }

      .empty-state {
        border: 1px dashed var(--line);
        border-radius: 22px;
        padding: 24px;
        color: var(--muted);
        line-height: 1.6;
        background: rgba(255, 255, 255, 0.015);
      }

      .composer {
        padding: 18px;
        border-top: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(0, 0, 0, 0.04));
      }

      .composer-box,
      .form-block {
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.025);
        border-radius: 22px;
      }

      .composer-box {
        padding: 14px;
      }

      .composer textarea,
      .form-block textarea,
      .form-block input,
      .form-block select {
        width: 100%;
        background: rgba(4, 10, 16, 0.55);
        color: var(--text);
        border: 1px solid rgba(137, 185, 226, 0.16);
        border-radius: 14px;
        padding: 11px 12px;
      }

      .composer textarea,
      .form-block textarea {
        resize: vertical;
        min-height: 104px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .form-grid.full {
        grid-template-columns: 1fr;
      }

      .form-block {
        padding: 14px;
      }

      .form-label {
        display: block;
        margin-bottom: 7px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
      }

      .composer-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }

      .selected-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .selected-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(117, 231, 202, 0.08);
        border: 1px solid rgba(117, 231, 202, 0.22);
        color: var(--accent);
        font-size: 12px;
      }

      .rail-scroll {
        min-height: 0;
        padding: 18px;
      }

      .grid-stack {
        display: grid;
        gap: 14px;
      }

      .card-title {
        font-size: 14px;
        font-weight: 700;
      }

      .card-body {
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.55;
        white-space: pre-wrap;
      }

      .list-inline {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 5px 9px;
        font-size: 11px;
        border: 1px solid var(--line);
        color: var(--muted);
      }

      .badge.high { color: var(--danger); }
      .badge.medium { color: var(--accent-3); }
      .badge.low { color: var(--accent); }
      .badge.active { color: var(--accent); }
      .badge.paused { color: var(--accent-3); }
      .badge.done { color: var(--muted); }
      .badge.in_progress { color: var(--accent-2); }
      .badge.open { color: var(--accent); }

      .split-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      .chart-list {
        display: grid;
        gap: 8px;
      }

      .chart-item {
        display: grid;
        gap: 8px;
      }

      .chart-check {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }

      .chart-check input {
        margin-top: 4px;
      }

      .helper {
        margin-top: 8px;
        font-size: 12px;
        color: var(--muted);
      }

      .flash {
        min-height: 20px;
        margin-top: 10px;
        font-size: 13px;
      }

      .flash.error { color: var(--danger); }
      .flash.success { color: var(--success); }

      .desktop-only {
        display: inline-flex;
      }

      @media (max-width: 1180px) {
        .frame {
          grid-template-columns: 300px minmax(0, 1fr);
        }

        .right-rail {
          grid-column: 1 / -1;
          min-height: auto;
        }

        .rail-scroll {
          overflow: visible;
        }
      }

      @media (max-width: 860px) {
        .app {
          padding: 12px;
        }

        .frame {
          grid-template-columns: 1fr;
        }

        .hero-grid,
        .form-grid {
          grid-template-columns: 1fr;
        }

        .left-rail {
          min-height: auto;
        }

        .thread-scroller,
        .messages,
        .rail-scroll {
          overflow: visible;
        }

        .message {
          max-width: 100%;
        }

        .desktop-only {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="app">
      <div class="frame">
        <aside class="panel left-rail">
          <section class="section hero">
            <div class="eyebrow">Aether Gateway</div>
            <div class="hero-grid">
              <div>
                <h1>Personal operator. Live desk. Real threads.</h1>
                <p class="subtle" style="margin-top: 12px;">
                  This surface is now centered on the active conversation, backed by the existing runtime endpoints.
                </p>
              </div>
              <div class="button-row desktop-only">
                <button id="refresh-all" class="ghost-button" type="button">Refresh</button>
              </div>
            </div>
            <div id="health-pills" class="pill-row" style="margin-top: 16px;"></div>
          </section>

          <section class="section">
            <div class="section-title">
              <h2>Threads</h2>
              <button id="new-thread" class="icon-button" type="button">New</button>
            </div>
            <div class="subtle">Thread list stays aligned with the stored gateway history and channel activity.</div>
          </section>

          <div class="thread-scroller">
            <div id="thread-list" class="thread-list"></div>
            <div class="stack" style="margin-top: 16px;">
              <div>
                <div class="section-title" style="margin-bottom: 10px;">
                  <h2>Channels</h2>
                </div>
                <div id="channel-list" class="channel-list"></div>
              </div>
              <div>
                <div class="section-title" style="margin-bottom: 10px;">
                  <h2>Routines</h2>
                </div>
                <div class="button-row" style="margin-bottom: 10px;">
                  <button class="routine-button" type="button" data-routine="daily">Daily</button>
                  <button class="routine-button" type="button" data-routine="london-prep">London</button>
                  <button class="routine-button" type="button" data-routine="new-york-prep">New York</button>
                  <button class="routine-button" type="button" data-routine="weekend-review">Weekend</button>
                </div>
                <div id="routine-list" class="routine-list"></div>
              </div>
            </div>
          </div>
        </aside>

        <section class="panel center-column">
          <div class="conversation-header">
            <div class="section-title">
              <div>
                <div id="thread-eyebrow" class="eyebrow">Active Thread</div>
                <h2 id="active-thread-title" style="margin-top: 6px; font-size: 20px; letter-spacing: 0.02em; text-transform: none; color: var(--text);">Loading conversation...</h2>
              </div>
              <div class="button-row">
                <button id="mobile-refresh" class="ghost-button" type="button">Refresh</button>
              </div>
            </div>
            <div id="active-thread-meta" class="pill-row"></div>
          </div>

          <div class="conversation-shell">
            <div id="message-list" class="messages"></div>
          </div>

          <section class="composer">
            <div class="composer-box">
              <label class="form-label" for="message-input">Send to Aether</label>
              <textarea id="message-input" placeholder="Frame the setup, ask for structure, hand off a chart, or continue the current thread."></textarea>
              <div id="selected-charts" class="selected-strip"></div>
              <div class="composer-toolbar">
                <div class="subtle">Charts selected here are sent through the existing \`POST /message\` contract.</div>
                <button id="send-message" class="action-button" type="button">Send Message</button>
              </div>
              <div id="composer-flash" class="flash"></div>
            </div>
          </section>
        </section>

        <aside class="panel right-rail">
          <div class="rail-scroll">
            <div class="grid-stack">
              <section>
                <div class="section-title">
                  <h2>Desk State</h2>
                </div>
                <div id="desk-state" class="card"></div>
                <div class="split-actions">
                  <button id="toggle-desk-form" class="mini-button" type="button">Edit Desk</button>
                  <button id="generate-brief" class="mini-button" type="button">Generate Brief</button>
                </div>
                <div id="desk-form-wrap" style="display: none; margin-top: 10px;"></div>
              </section>

              <section>
                <div class="section-title">
                  <h2>Watchlist</h2>
                  <button id="toggle-watchlist-form" class="icon-button" type="button">Add</button>
                </div>
                <div id="watchlist-list" class="stack"></div>
                <div id="watchlist-form-wrap" style="display: none; margin-top: 10px;"></div>
              </section>

              <section>
                <div class="section-title">
                  <h2>Tasks</h2>
                  <button id="toggle-task-form" class="icon-button" type="button">Add</button>
                </div>
                <div id="task-list" class="stack"></div>
                <div id="task-form-wrap" style="display: none; margin-top: 10px;"></div>
              </section>

              <section>
                <div class="section-title">
                  <h2>Charts</h2>
                </div>
                <div id="chart-list" class="chart-list"></div>
                <div class="helper">Attach saved charts to the active thread or upload a new one before sending.</div>
                <div style="margin-top: 10px;">
                  <button id="toggle-chart-form" class="mini-button" type="button">Upload Chart</button>
                </div>
                <div id="chart-form-wrap" style="display: none; margin-top: 10px;"></div>
              </section>

              <section>
                <div class="section-title">
                  <h2>Latest Brief</h2>
                </div>
                <div id="brief-card"></div>
              </section>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <script>
      const state = {
        health: null,
        threads: [],
        messages: [],
        activeThreadId: "",
        desk: null,
        routines: [],
        watchlist: [],
        tasks: [],
        briefs: [],
        charts: [],
        selectedChartIds: [],
        loadingMessages: false,
      };

      const elements = {};

      function byId(id) {
        return document.getElementById(id);
      }

      function escapeHtml(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function formatDate(value) {
        if (!value) return "Unknown time";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      function formatRelative(value) {
        if (!value) return "No activity";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        const minutes = Math.round((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + "m ago";
        const hours = Math.round(minutes / 60);
        if (hours < 24) return hours + "h ago";
        const days = Math.round(hours / 24);
        return days + "d ago";
      }

      async function requestJson(path, options) {
        const response = await fetch(path, options);
        const data = await response.json().catch(function () {
          return {};
        });
        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }
        return data;
      }

      function setFlash(node, message, type) {
        node.textContent = message || "";
        node.className = "flash" + (type ? " " + type : "");
      }

      function activeThread() {
        return state.threads.find(function (thread) {
          return thread.id === state.activeThreadId;
        }) || null;
      }

      async function loadHealth() {
        state.health = await requestJson("/health");
      }

      async function loadThreads() {
        const data = await requestJson("/threads");
        state.threads = data.threads || [];
        if (!state.activeThreadId && state.threads.length) {
          state.activeThreadId = state.threads[0].id;
        }
        if (state.activeThreadId && !state.threads.some(function (thread) { return thread.id === state.activeThreadId; })) {
          state.activeThreadId = state.threads[0] ? state.threads[0].id : "";
        }
      }

      async function loadMessages(threadId) {
        if (!threadId) {
          state.messages = [];
          renderConversation();
          return;
        }
        state.loadingMessages = true;
        renderConversation();
        const data = await requestJson("/threads/" + encodeURIComponent(threadId) + "/messages");
        state.messages = data.messages || [];
        state.loadingMessages = false;
        renderConversation();
      }

      async function loadDesk() {
        const data = await requestJson("/desk");
        state.desk = data.state || null;
        state.routines = (data.routines || []).slice().reverse();
      }

      async function loadWatchlist() {
        const data = await requestJson("/watchlist");
        state.watchlist = data.entries || [];
      }

      async function loadTasks() {
        const data = await requestJson("/tasks");
        state.tasks = data.tasks || [];
      }

      async function loadBriefs() {
        const data = await requestJson("/briefs");
        state.briefs = data.briefs || [];
      }

      async function loadCharts() {
        const data = await requestJson("/charts");
        state.charts = data.charts || [];
        state.selectedChartIds = state.selectedChartIds.filter(function (id) {
          return state.charts.some(function (chart) { return chart.id === id; });
        });
      }

      async function loadAll() {
        await Promise.all([
          loadHealth(),
          loadThreads(),
          loadDesk(),
          loadWatchlist(),
          loadTasks(),
          loadBriefs(),
          loadCharts(),
        ]);
        renderAll();
        if (state.activeThreadId) {
          await loadMessages(state.activeThreadId);
        } else {
          renderConversation();
        }
      }

      function renderHealth() {
        if (!state.health) return;
        const channels = (state.health.channels || []).map(function (channel) {
          return '<span class="pill">' + escapeHtml(channel.name) + ": " + escapeHtml(channel.connected ? "connected" : "offline") + "</span>";
        }).join("");
        elements.healthPills.innerHTML = [
          '<span class="pill">provider: ' + escapeHtml(state.health.provider) + "</span>",
          '<span class="pill">model: ' + escapeHtml(state.health.model) + "</span>",
          channels,
        ].join("");
        elements.channelList.innerHTML = (state.health.channels || []).length
          ? (state.health.channels || []).map(function (channel) {
              return '<div class="status-row"><div class="meta-row"><div><div class="card-title">' + escapeHtml(channel.name) + '</div><div class="tiny">' + escapeHtml(channel.connected ? "Live and reachable" : "Waiting for connection") + '</div></div><span class="status-dot ' + (channel.connected ? "live" : "") + '"></span></div></div>';
            }).join("")
          : '<div class="empty-state">No channel integrations are reporting yet.</div>';
      }

      function renderThreads() {
        elements.threadList.innerHTML = state.threads.length
          ? state.threads.map(function (thread) {
              const active = thread.id === state.activeThreadId ? " active" : "";
              return '<button class="thread-card' + active + '" type="button" data-thread-id="' + escapeHtml(thread.id) + '">' +
                '<div class="thread-card-header"><div class="thread-title">' + escapeHtml(thread.title || "Untitled thread") + '</div><div class="tiny">' + escapeHtml(thread.source) + '</div></div>' +
                '<div class="preview">' + escapeHtml(thread.lastMessagePreview || "No messages yet.") + '</div>' +
                '<div class="meta-row" style="margin-top: 10px;"><span class="tiny">' + escapeHtml(formatRelative(thread.updatedAt)) + '</span><span class="tiny">' + escapeHtml(formatDate(thread.updatedAt)) + '</span></div>' +
              '</button>';
            }).join("")
          : '<div class="empty-state">No active threads yet. Start one and the gateway will store it immediately.</div>';
      }

      function renderConversationHeader() {
        const thread = activeThread();
        elements.activeThreadTitle.textContent = thread ? thread.title : "New conversation";
        elements.threadEyebrow.textContent = thread ? "Active Thread" : "Ready";
        elements.activeThreadMeta.innerHTML = thread
          ? [
              '<span class="pill">source: ' + escapeHtml(thread.source) + "</span>",
              '<span class="pill">updated: ' + escapeHtml(formatDate(thread.updatedAt)) + "</span>",
              '<span class="pill">messages: ' + escapeHtml(String(state.messages.length)) + "</span>",
            ].join("")
          : '<span class="pill">No thread selected</span><span class="pill">Send a message to create one</span>';
      }

      function renderConversation() {
        renderConversationHeader();
        if (state.loadingMessages) {
          elements.messageList.innerHTML = '<div class="empty-state">Loading thread history...</div>';
          return;
        }
        if (!state.activeThreadId && !state.messages.length) {
          elements.messageList.innerHTML = '<div class="empty-state">Start with a clean ask, trading setup, or desk instruction. Aether will create the thread on first send.</div>';
          return;
        }
        if (!state.messages.length) {
          elements.messageList.innerHTML = '<div class="empty-state">This thread is open but still empty. Send the first message or attach a chart below.</div>';
          return;
        }
        elements.messageList.innerHTML = state.messages.map(function (message) {
          const attachments = (message.attachments || []).length
            ? '<div class="attachments">' + message.attachments.map(function (attachment) {
                return '<span class="attachment">' + escapeHtml(attachment.label || attachment.kind) + '</span>';
              }).join("") + "</div>"
            : "";
          return '<article class="message ' + escapeHtml(message.role) + '">' +
            '<div class="message-header"><span class="message-role">' + escapeHtml(message.role) + '</span><span class="tiny">' + escapeHtml(formatDate(message.timestamp)) + '</span></div>' +
            '<div class="message-content">' + escapeHtml(message.content) + '</div>' +
            attachments +
          '</article>';
        }).join("");
        elements.messageList.scrollTop = elements.messageList.scrollHeight;
      }

      function renderRoutines() {
        elements.routineList.innerHTML = state.routines.length
          ? state.routines.slice(0, 4).map(function (routine) {
              return '<div class="routine-item"><div class="meta-row"><div class="card-title">' + escapeHtml(routine.routine) + '</div><div class="tiny">' + escapeHtml(formatRelative(routine.timestamp)) + '</div></div><div class="card-body">' + escapeHtml(routine.output) + '</div></div>';
            }).join("")
          : '<div class="empty-state">No routines have been run from the desk yet.</div>';
      }

      function renderDesk() {
        if (!state.desk) {
          elements.deskState.innerHTML = "Desk state unavailable.";
          return;
        }
        const levels = (state.desk.keyLevels || []).length
          ? (state.desk.keyLevels || []).map(function (level) {
              return '<span class="badge">' + escapeHtml(level) + "</span>";
            }).join("")
          : '<span class="tiny">No levels set</span>';
        const blocks = (state.desk.noTradeConditions || []).length
          ? (state.desk.noTradeConditions || []).map(function (item) {
              return '<span class="badge">' + escapeHtml(item) + "</span>";
            }).join("")
          : '<span class="tiny">No no-trade conditions set</span>';
        elements.deskState.innerHTML =
          '<div class="card-title">' + escapeHtml(state.desk.activeFocus || "No active focus") + '</div>' +
          '<div class="card-body">Bias: ' + escapeHtml(state.desk.marketBias || "Neutral") + '</div>' +
          '<div class="helper">Updated ' + escapeHtml(formatDate(state.desk.updatedAt)) + '</div>' +
          '<div class="helper" style="margin-top: 10px;">No-trade conditions</div>' +
          '<div class="list-inline">' + blocks + '</div>' +
          '<div class="helper" style="margin-top: 12px;">Key levels</div>' +
          '<div class="list-inline">' + levels + '</div>' +
          '<div class="card-body" style="margin-top: 12px;">' + escapeHtml(state.desk.notes || "No desk notes yet.") + '</div>';
        renderDeskForm();
      }

      function renderWatchlist() {
        elements.watchlistList.innerHTML = state.watchlist.length
          ? state.watchlist.slice().reverse().map(function (entry) {
              return '<div class="card">' +
                '<div class="meta-row"><div class="card-title">' + escapeHtml(entry.symbol) + " · " + escapeHtml(entry.timeframe) + '</div><span class="badge ' + escapeHtml(entry.status) + '">' + escapeHtml(entry.status) + '</span></div>' +
                '<div class="helper">' + escapeHtml(entry.market) + " · " + escapeHtml(formatDate(entry.timestamp)) + '</div>' +
                '<div class="card-body">' + escapeHtml(entry.thesis) + '</div>' +
                '<div class="card-body" style="margin-top: 8px;">Invalidation: ' + escapeHtml(entry.invalidation) + '</div>' +
                '<div class="split-actions">' +
                  '<button class="mini-button" type="button" data-watchlist-id="' + escapeHtml(entry.id) + '" data-watchlist-status="active">Set Active</button>' +
                  '<button class="mini-button" type="button" data-watchlist-id="' + escapeHtml(entry.id) + '" data-watchlist-status="paused">Pause</button>' +
                  '<button class="mini-button" type="button" data-watchlist-id="' + escapeHtml(entry.id) + '" data-watchlist-status="done">Done</button>' +
                '</div>' +
              '</div>';
            }).join("")
          : '<div class="empty-state">No watchlist entries yet. Add one from this panel.</div>';
        renderWatchlistForm();
      }

      function renderTasks() {
        elements.taskList.innerHTML = state.tasks.length
          ? state.tasks.slice().reverse().map(function (task) {
              return '<div class="card">' +
                '<div class="meta-row"><div class="card-title">' + escapeHtml(task.title) + '</div><span class="badge ' + escapeHtml(task.priority) + '">' + escapeHtml(task.priority) + '</span></div>' +
                '<div class="helper">' + escapeHtml(task.domain) + " · " + escapeHtml(task.status) + " · " + escapeHtml(formatDate(task.timestamp)) + '</div>' +
                '<div class="card-body">' + escapeHtml(task.detail || "No detail added.") + '</div>' +
                '<div class="split-actions">' +
                  '<button class="mini-button" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-status="open">Open</button>' +
                  '<button class="mini-button" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-status="in_progress">In Progress</button>' +
                  '<button class="mini-button" type="button" data-task-id="' + escapeHtml(task.id) + '" data-task-status="done">Done</button>' +
                '</div>' +
              '</div>';
            }).join("")
          : '<div class="empty-state">No tasks are stored yet.</div>';
        renderTaskForm();
      }

      function renderCharts() {
        elements.chartList.innerHTML = state.charts.length
          ? state.charts.slice().reverse().map(function (chart) {
              const checked = state.selectedChartIds.includes(chart.id) ? " checked" : "";
              return '<label class="chart-item"><div class="chart-check"><input type="checkbox" data-chart-id="' + escapeHtml(chart.id) + '"' + checked + ' /><div><div class="card-title">' + escapeHtml(chart.symbol) + " · " + escapeHtml(chart.timeframe) + '</div><div class="helper">' + escapeHtml(formatDate(chart.timestamp)) + '</div><div class="card-body">' + escapeHtml(chart.note || "No note attached.") + '</div></div></div></label>';
            }).join("")
          : '<div class="empty-state">No charts stored yet. Upload one and it can be attached to a thread immediately.</div>';
        elements.selectedCharts.innerHTML = state.selectedChartIds.length
          ? state.selectedChartIds.map(function (id) {
              const chart = state.charts.find(function (item) { return item.id === id; });
              if (!chart) return "";
              return '<span class="selected-item">' + escapeHtml(chart.symbol) + " " + escapeHtml(chart.timeframe) + '<button class="icon-button" type="button" data-remove-chart-id="' + escapeHtml(chart.id) + '">x</button></span>';
            }).join("")
          : "";
        renderChartForm();
      }

      function renderBrief() {
        const brief = state.briefs[state.briefs.length - 1];
        elements.briefCard.innerHTML = brief
          ? '<div class="brief-card"><div class="meta-row"><div class="card-title">' + escapeHtml(brief.title) + '</div><div class="tiny">' + escapeHtml(formatDate(brief.timestamp)) + '</div></div><div class="card-body">' + escapeHtml(brief.body) + '</div></div>'
          : '<div class="empty-state">No brief generated yet.</div>';
      }

      function renderDeskForm() {
        const visible = elements.deskFormWrap.dataset.open === "true";
        if (!visible || !state.desk) {
          elements.deskFormWrap.innerHTML = "";
          return;
        }
        elements.deskFormWrap.innerHTML =
          '<form id="desk-form" class="form-block">' +
            '<div class="form-grid full">' +
              '<div><label class="form-label" for="desk-focus">Active Focus</label><input id="desk-focus" name="activeFocus" value="' + escapeHtml(state.desk.activeFocus || "") + '" /></div>' +
              '<div><label class="form-label" for="desk-bias">Market Bias</label><input id="desk-bias" name="marketBias" value="' + escapeHtml(state.desk.marketBias || "") + '" /></div>' +
              '<div><label class="form-label" for="desk-no-trade">No-Trade Conditions</label><textarea id="desk-no-trade" name="noTradeConditions">' + escapeHtml((state.desk.noTradeConditions || []).join("\\n")) + '</textarea></div>' +
              '<div><label class="form-label" for="desk-levels">Key Levels</label><textarea id="desk-levels" name="keyLevels">' + escapeHtml((state.desk.keyLevels || []).join("\\n")) + '</textarea></div>' +
              '<div><label class="form-label" for="desk-notes">Notes</label><textarea id="desk-notes" name="notes">' + escapeHtml(state.desk.notes || "") + '</textarea></div>' +
            '</div>' +
            '<div class="split-actions"><button class="action-button" type="submit">Save Desk</button></div>' +
            '<div id="desk-form-flash" class="flash"></div>' +
          '</form>';
      }

      function renderWatchlistForm() {
        const visible = elements.watchlistFormWrap.dataset.open === "true";
        if (!visible) {
          elements.watchlistFormWrap.innerHTML = "";
          return;
        }
        elements.watchlistFormWrap.innerHTML =
          '<form id="watchlist-form" class="form-block">' +
            '<div class="form-grid">' +
              '<div><label class="form-label" for="watch-symbol">Symbol</label><input id="watch-symbol" name="symbol" placeholder="BTC" /></div>' +
              '<div><label class="form-label" for="watch-timeframe">Timeframe</label><input id="watch-timeframe" name="timeframe" placeholder="4H" /></div>' +
              '<div><label class="form-label" for="watch-market">Market</label><select id="watch-market" name="market"><option value="crypto">crypto</option><option value="indices">indices</option><option value="forex">forex</option><option value="stocks">stocks</option></select></div>' +
              '<div><label class="form-label" for="watch-status">Status</label><select id="watch-status" name="status"><option value="active">active</option><option value="paused">paused</option><option value="done">done</option></select></div>' +
            '</div>' +
            '<div class="form-grid full" style="margin-top: 10px;">' +
              '<div><label class="form-label" for="watch-thesis">Thesis</label><textarea id="watch-thesis" name="thesis"></textarea></div>' +
              '<div><label class="form-label" for="watch-invalidation">Invalidation</label><textarea id="watch-invalidation" name="invalidation"></textarea></div>' +
              '<div><label class="form-label" for="watch-tags">Tags</label><input id="watch-tags" name="tags" placeholder="reclaim, momentum" /></div>' +
            '</div>' +
            '<div class="split-actions"><button class="action-button" type="submit">Add Watchlist Item</button></div>' +
            '<div id="watchlist-form-flash" class="flash"></div>' +
          '</form>';
      }

      function renderTaskForm() {
        const visible = elements.taskFormWrap.dataset.open === "true";
        if (!visible) {
          elements.taskFormWrap.innerHTML = "";
          return;
        }
        elements.taskFormWrap.innerHTML =
          '<form id="task-form" class="form-block">' +
            '<div class="form-grid">' +
              '<div><label class="form-label" for="task-title">Title</label><input id="task-title" name="title" /></div>' +
              '<div><label class="form-label" for="task-domain">Domain</label><select id="task-domain" name="domain"><option value="general">general</option><option value="trading">trading</option></select></div>' +
              '<div><label class="form-label" for="task-priority">Priority</label><select id="task-priority" name="priority"><option value="medium">medium</option><option value="high">high</option><option value="low">low</option></select></div>' +
              '<div><label class="form-label" for="task-status">Status</label><select id="task-status" name="status"><option value="open">open</option><option value="in_progress">in_progress</option><option value="done">done</option></select></div>' +
            '</div>' +
            '<div class="form-grid full" style="margin-top: 10px;">' +
              '<div><label class="form-label" for="task-detail">Detail</label><textarea id="task-detail" name="detail"></textarea></div>' +
              '<div><label class="form-label" for="task-tags">Tags</label><input id="task-tags" name="tags" placeholder="prep, london" /></div>' +
            '</div>' +
            '<div class="split-actions"><button class="action-button" type="submit">Add Task</button></div>' +
            '<div id="task-form-flash" class="flash"></div>' +
          '</form>';
      }

      function renderChartForm() {
        const visible = elements.chartFormWrap.dataset.open === "true";
        if (!visible) {
          elements.chartFormWrap.innerHTML = "";
          return;
        }
        elements.chartFormWrap.innerHTML =
          '<form id="chart-form" class="form-block">' +
            '<div class="form-grid">' +
              '<div><label class="form-label" for="chart-symbol">Symbol</label><input id="chart-symbol" name="symbol" placeholder="BTC" /></div>' +
              '<div><label class="form-label" for="chart-timeframe">Timeframe</label><input id="chart-timeframe" name="timeframe" placeholder="4H" /></div>' +
            '</div>' +
            '<div class="form-grid full" style="margin-top: 10px;">' +
              '<div><label class="form-label" for="chart-note">Note</label><textarea id="chart-note" name="note" placeholder="What matters about this chart?"></textarea></div>' +
              '<div><label class="form-label" for="chart-tags">Tags</label><input id="chart-tags" name="tags" placeholder="btc, reclaim, htf" /></div>' +
              '<div><label class="form-label" for="chart-file">Chart File</label><input id="chart-file" name="file" type="file" /></div>' +
            '</div>' +
            '<div class="split-actions"><button class="action-button" type="submit">Upload Chart</button></div>' +
            '<div id="chart-form-flash" class="flash"></div>' +
          '</form>';
      }

      function renderAll() {
        renderHealth();
        renderThreads();
        renderDesk();
        renderWatchlist();
        renderTasks();
        renderCharts();
        renderBrief();
        renderRoutines();
      }

      async function selectThread(threadId) {
        if (!threadId || threadId === state.activeThreadId) {
          return;
        }
        state.activeThreadId = threadId;
        renderThreads();
        renderConversation();
        await loadMessages(threadId);
      }

      function splitLines(value) {
        return String(value || "")
          .split("\\n")
          .map(function (item) { return item.trim(); })
          .filter(Boolean);
      }

      function splitTags(value) {
        return String(value || "")
          .split(",")
          .map(function (item) { return item.trim(); })
          .filter(Boolean);
      }

      async function handleNewThread() {
        const data = await requestJson("/threads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: "New gateway thread", source: "gateway" }),
        });
        await loadThreads();
        renderThreads();
        await selectThread(data.id);
      }

      async function handleSendMessage() {
        const message = elements.messageInput.value.trim();
        if (!message) {
          setFlash(elements.composerFlash, "Message is required.", "error");
          return;
        }
        elements.sendMessage.disabled = true;
        setFlash(elements.composerFlash, "Sending...", "");
        try {
          const payload = {
            message: message,
            threadId: state.activeThreadId || undefined,
            chartIds: state.selectedChartIds.length ? state.selectedChartIds : undefined,
          };
          const response = await requestJson("/message", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          elements.messageInput.value = "";
          state.selectedChartIds = [];
          await Promise.all([loadThreads(), loadBriefs(), loadCharts()]);
          state.activeThreadId = response.threadId;
          renderAll();
          await loadMessages(response.threadId);
          setFlash(elements.composerFlash, "Message delivered.", "success");
        } catch (error) {
          setFlash(elements.composerFlash, error.message || "Failed to send message.", "error");
        } finally {
          elements.sendMessage.disabled = false;
        }
      }

      async function handleRoutine(routine) {
        await requestJson("/desk/routines", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ routine: routine }),
        });
        await loadDesk();
        renderRoutines();
      }

      async function handleDeskSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const flash = byId("desk-form-flash");
        setFlash(flash, "Saving desk state...", "");
        try {
          await requestJson("/desk", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              activeFocus: form.activeFocus.value.trim(),
              marketBias: form.marketBias.value.trim(),
              noTradeConditions: splitLines(form.noTradeConditions.value),
              keyLevels: splitLines(form.keyLevels.value),
              notes: form.notes.value.trim(),
            }),
          });
          await loadDesk();
          renderDesk();
          setFlash(flash, "Desk state saved.", "success");
        } catch (error) {
          setFlash(flash, error.message || "Failed to save desk state.", "error");
        }
      }

      async function handleWatchlistSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const flash = byId("watchlist-form-flash");
        setFlash(flash, "Adding watchlist item...", "");
        try {
          await requestJson("/watchlist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              symbol: form.symbol.value.trim(),
              timeframe: form.timeframe.value.trim(),
              market: form.market.value,
              thesis: form.thesis.value.trim(),
              invalidation: form.invalidation.value.trim(),
              status: form.status.value,
              tags: splitTags(form.tags.value),
            }),
          });
          form.reset();
          await Promise.all([loadWatchlist(), loadBriefs()]);
          renderWatchlist();
          renderBrief();
          setFlash(flash, "Watchlist item added.", "success");
        } catch (error) {
          setFlash(flash, error.message || "Failed to add watchlist item.", "error");
        }
      }

      async function handleTaskSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const flash = byId("task-form-flash");
        setFlash(flash, "Adding task...", "");
        try {
          await requestJson("/tasks", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              title: form.title.value.trim(),
              detail: form.detail.value.trim(),
              domain: form.domain.value,
              priority: form.priority.value,
              status: form.status.value,
              tags: splitTags(form.tags.value),
            }),
          });
          form.reset();
          await loadTasks();
          renderTasks();
          setFlash(flash, "Task added.", "success");
        } catch (error) {
          setFlash(flash, error.message || "Failed to add task.", "error");
        }
      }

      async function handleChartSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const flash = byId("chart-form-flash");
        const fileInput = form.file;
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          setFlash(flash, "Choose a chart file to upload.", "error");
          return;
        }
        setFlash(flash, "Uploading chart...", "");
        try {
          const data = new FormData();
          data.append("symbol", form.symbol.value.trim());
          data.append("timeframe", form.timeframe.value.trim());
          data.append("note", form.note.value.trim());
          data.append("tags", form.tags.value.trim());
          data.append("file", file);
          const response = await requestJson("/charts", {
            method: "POST",
            body: data,
          });
          form.reset();
          await loadCharts();
          if (response.id) {
            state.selectedChartIds = Array.from(new Set(state.selectedChartIds.concat([response.id])));
          }
          renderCharts();
          setFlash(flash, "Chart uploaded and selected.", "success");
        } catch (error) {
          setFlash(flash, error.message || "Failed to upload chart.", "error");
        }
      }

      async function handleWatchlistStatus(id, status) {
        await requestJson("/watchlist/" + encodeURIComponent(id), {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: status }),
        });
        await loadWatchlist();
        renderWatchlist();
      }

      async function handleTaskStatus(id, status) {
        await requestJson("/tasks/" + encodeURIComponent(id), {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: status }),
        });
        await loadTasks();
        renderTasks();
      }

      async function handleGenerateBrief() {
        await requestJson("/briefs/daily", { method: "POST" });
        await loadBriefs();
        renderBrief();
      }

      function toggleSection(node) {
        node.dataset.open = node.dataset.open === "true" ? "false" : "true";
      }

      function wireEvents() {
        elements.refreshAll.addEventListener("click", loadAll);
        elements.mobileRefresh.addEventListener("click", loadAll);
        elements.newThread.addEventListener("click", function () {
          void handleNewThread();
        });
        elements.sendMessage.addEventListener("click", function () {
          void handleSendMessage();
        });
        elements.messageInput.addEventListener("keydown", function (event) {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void handleSendMessage();
          }
        });
        elements.toggleDeskForm.addEventListener("click", function () {
          toggleSection(elements.deskFormWrap);
          renderDeskForm();
        });
        elements.toggleWatchlistForm.addEventListener("click", function () {
          toggleSection(elements.watchlistFormWrap);
          renderWatchlistForm();
        });
        elements.toggleTaskForm.addEventListener("click", function () {
          toggleSection(elements.taskFormWrap);
          renderTaskForm();
        });
        elements.toggleChartForm.addEventListener("click", function () {
          toggleSection(elements.chartFormWrap);
          renderChartForm();
        });
        elements.generateBrief.addEventListener("click", function () {
          void handleGenerateBrief();
        });

        document.addEventListener("click", function (event) {
          const target = event.target;
          if (!(target instanceof HTMLElement)) {
            return;
          }

          const threadButton = target.closest("[data-thread-id]");
          if (threadButton) {
            void selectThread(threadButton.getAttribute("data-thread-id"));
            return;
          }

          const routineButton = target.closest("[data-routine]");
          if (routineButton) {
            void handleRoutine(routineButton.getAttribute("data-routine"));
            return;
          }

          const watchlistButton = target.closest("[data-watchlist-id]");
          if (watchlistButton) {
            void handleWatchlistStatus(
              watchlistButton.getAttribute("data-watchlist-id"),
              watchlistButton.getAttribute("data-watchlist-status"),
            );
            return;
          }

          const taskButton = target.closest("[data-task-id]");
          if (taskButton) {
            void handleTaskStatus(
              taskButton.getAttribute("data-task-id"),
              taskButton.getAttribute("data-task-status"),
            );
            return;
          }

          const removeChartButton = target.closest("[data-remove-chart-id]");
          if (removeChartButton) {
            const removeId = removeChartButton.getAttribute("data-remove-chart-id");
            state.selectedChartIds = state.selectedChartIds.filter(function (id) { return id !== removeId; });
            renderCharts();
          }
        });

        document.addEventListener("change", function (event) {
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) {
            return;
          }
          const chartId = target.getAttribute("data-chart-id");
          if (!chartId) {
            return;
          }
          if (target.checked) {
            state.selectedChartIds = Array.from(new Set(state.selectedChartIds.concat([chartId])));
          } else {
            state.selectedChartIds = state.selectedChartIds.filter(function (id) { return id !== chartId; });
          }
          renderCharts();
        });

        document.addEventListener("submit", function (event) {
          const form = event.target;
          if (!(form instanceof HTMLFormElement)) {
            return;
          }
          if (form.id === "desk-form") {
            void handleDeskSubmit(event);
          }
          if (form.id === "watchlist-form") {
            void handleWatchlistSubmit(event);
          }
          if (form.id === "task-form") {
            void handleTaskSubmit(event);
          }
          if (form.id === "chart-form") {
            void handleChartSubmit(event);
          }
        });
      }

      function bindElements() {
        elements.healthPills = byId("health-pills");
        elements.threadList = byId("thread-list");
        elements.channelList = byId("channel-list");
        elements.routineList = byId("routine-list");
        elements.threadEyebrow = byId("thread-eyebrow");
        elements.activeThreadTitle = byId("active-thread-title");
        elements.activeThreadMeta = byId("active-thread-meta");
        elements.messageList = byId("message-list");
        elements.messageInput = byId("message-input");
        elements.sendMessage = byId("send-message");
        elements.composerFlash = byId("composer-flash");
        elements.selectedCharts = byId("selected-charts");
        elements.deskState = byId("desk-state");
        elements.watchlistList = byId("watchlist-list");
        elements.taskList = byId("task-list");
        elements.chartList = byId("chart-list");
        elements.briefCard = byId("brief-card");
        elements.refreshAll = byId("refresh-all");
        elements.mobileRefresh = byId("mobile-refresh");
        elements.newThread = byId("new-thread");
        elements.toggleDeskForm = byId("toggle-desk-form");
        elements.toggleWatchlistForm = byId("toggle-watchlist-form");
        elements.toggleTaskForm = byId("toggle-task-form");
        elements.toggleChartForm = byId("toggle-chart-form");
        elements.generateBrief = byId("generate-brief");
        elements.deskFormWrap = byId("desk-form-wrap");
        elements.watchlistFormWrap = byId("watchlist-form-wrap");
        elements.taskFormWrap = byId("task-form-wrap");
        elements.chartFormWrap = byId("chart-form-wrap");
      }

      async function boot() {
        bindElements();
        wireEvents();
        try {
          await loadAll();
        } catch (error) {
          elements.messageList.innerHTML = '<div class="empty-state">Failed to load the gateway surface: ' + escapeHtml(error.message || "unknown error") + '</div>';
        }
      }

      boot();
    </script>
  </body>
</html>`;
}
