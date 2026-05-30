const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "desktop-dist");
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL is required to build the desktop shell.");
}

fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Irshad</title>
    <meta http-equiv="refresh" content="0;url=${appUrl}" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #090b10;
        color: white;
        font-family: Segoe UI, Inter, system-ui, sans-serif;
      }
      body {
        display: grid;
        place-items: center;
      }
      .card {
        max-width: 560px;
        padding: 28px;
        border-radius: 24px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 24px 80px rgba(0,0,0,0.45);
        text-align: center;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 24px;
      }
      p {
        margin: 0;
        color: rgba(255,255,255,0.7);
        line-height: 1.6;
      }
      code {
        color: #a5b4fc;
      }
    </style>
    <script>
      window.location.replace(${JSON.stringify(appUrl)});
    </script>
  </head>
  <body>
    <div class="card">
      <h1>Launching Irshad</h1>
      <p>
        If the app does not open automatically, go to
        <code>${appUrl}</code>.
      </p>
    </div>
  </body>
</html>`;

fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(`desktop shell written to ${path.join(outDir, "index.html")}`);
