const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "desktop-dist");
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.DESKTOP_APP_URL || "http://localhost:3000";

fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Irshad</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #090b10;
        --panel: rgba(18, 20, 28, 0.96);
        --panel-border: rgba(255,255,255,0.08);
        --accent: #5865f2;
        --accent2: #00c2ff;
      }
      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: var(--bg); font-family: Segoe UI, Inter, system-ui, sans-serif; }
      body {
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 20% 20%, rgba(88,101,242,.25), transparent 30%),
          radial-gradient(circle at 80% 30%, rgba(0,194,255,.14), transparent 22%),
          linear-gradient(180deg, #090b10 0%, #0b0d12 100%);
        color: white;
      }
      .shell {
        width: min(1120px, 96vw);
        height: min(760px, 92vh);
        border: 1px solid var(--panel-border);
        border-radius: 28px;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(19,22,30,.96), rgba(10,12,17,.98));
        box-shadow: 0 24px 80px rgba(0,0,0,.55);
        display: grid;
        grid-template-rows: 42px 1fr;
      }
      .titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px 0 16px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: rgba(12,14,20,.85);
        -webkit-app-region: drag;
      }
      .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: .02em; }
      .brand-mark {
        width: 22px; height: 22px; border-radius: 999px;
        background: radial-gradient(circle at 35% 30%, #fff 0 8%, transparent 10%), radial-gradient(circle at 50% 50%, #5865f2 0 28%, #00c2ff 56%, #141822 57%);
        box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 0 24px rgba(88,101,242,.45);
      }
      .controls { display: flex; gap: 8px; -webkit-app-region: no-drag; }
      .ctrl {
        width: 34px; height: 26px; border-radius: 9px; border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.04); color: rgba(255,255,255,.86); display: grid; place-items: center;
      }
      .ctrl:hover { background: rgba(255,255,255,.09); }
      .ctrl.close:hover { background: rgba(239, 68, 68, .22); }
      iframe { width: 100%; height: 100%; border: 0; background: #0b0d12; }
      .fallback {
        position: absolute; inset: 42px 0 0 0;
        display: grid; place-items: center; padding: 24px; text-align: center;
        background: linear-gradient(180deg, rgba(10,12,17,.94), rgba(10,12,17,.98));
      }
      .card {
        max-width: 540px; padding: 28px; border-radius: 24px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.03);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }
      .title { font-size: 28px; margin: 0 0 8px; }
      .sub { margin: 0; color: rgba(255,255,255,.68); line-height: 1.5; }
      code { color: #a5b4fc; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="titlebar">
        <div class="brand"><div class="brand-mark"></div><div>Irshad</div></div>
        <div class="controls">
          <button class="ctrl" id="minBtn" aria-label="Minimize">—</button>
          <button class="ctrl" id="maxBtn" aria-label="Maximize">▢</button>
          <button class="ctrl close" id="closeBtn" aria-label="Close">✕</button>
        </div>
      </div>
      <iframe id="appFrame" src="${appUrl}" title="Irshad desktop app"></iframe>
    </div>
    <div class="fallback" id="fallback" hidden>
      <div class="card">
        <h1 class="title">Irshad desktop shell</h1>
        <p class="sub">
          If the embedded app cannot load, open <code>${appUrl}</code> in a browser.
          The desktop wrapper is still installed and ready for tray/autostart behavior.
        </p>
      </div>
    </div>
    <script>
      const fallback = document.getElementById('fallback');
      const frame = document.getElementById('appFrame');
      frame.addEventListener('load', () => fallback.hidden = true);
      frame.addEventListener('error', () => fallback.hidden = false);
      const tryInvoke = async (cmd) => {
        try {
          if (window.__TAURI__?.core?.invoke) return await window.__TAURI__.core.invoke(cmd);
        } catch {}
      };
      document.getElementById('minBtn').addEventListener('click', () => window.__TAURI__?.window?.getCurrentWindow?.().minimize?.());
      document.getElementById('maxBtn').addEventListener('click', () => window.__TAURI__?.window?.getCurrentWindow?.().toggleMaximize?.());
      document.getElementById('closeBtn').addEventListener('click', () => window.__TAURI__?.window?.getCurrentWindow?.().close?.());
    </script>
  </body>
</html>`;

fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(`desktop shell written to ${path.join(outDir, "index.html")}`);
