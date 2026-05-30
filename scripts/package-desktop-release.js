const fs = require("fs");
const path = require("path");

const root = process.cwd();
const source = path.join(root, "src-tauri", "target", "release", "bundle", "nsis", "Irshad_0.1.0_x64-setup.exe");
const distDir = path.join(root, "release", "v0.1.0");
const targetExe = path.join(distDir, "Irshad-Setup-x64.exe");
const notesPath = path.join(distDir, "Irshad-Release-Notes.txt");
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://irshad-tau.vercel.app/";

if (!fs.existsSync(source)) {
  console.error(`Missing installer: ${source}`);
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(source, targetExe);

const notes = `Irshad Windows Release

Installer: Irshad-Setup-x64.exe
Build: ${new Date().toISOString()}

Checklist:
- Entry lock enabled with NEXT_PUBLIC_ENTRY_PASSWORD
- Tray open / quick reply / autostart verified
- Minimize-to-tray preference persisted
- 15-minute idle lock verified
- Installer built from Tauri NSIS bundle

Usage:
1. Run Irshad-Setup-x64.exe
2. Launch Irshad from the Start menu or desktop shortcut
3. Enter the access code on first open
4. Use Settings → Desktop for tray and autostart behavior
5. The desktop shell loads ${appUrl}
`;

fs.writeFileSync(notesPath, notes);
console.log(`Wrote ${targetExe}`);
console.log(`Wrote ${notesPath}`);
