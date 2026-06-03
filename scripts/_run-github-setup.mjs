import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "setup-github-run.log");
const lines = [];

function log(msg) {
  const s = String(msg);
  lines.push(s);
  console.log(s);
}

function run(cmd, opts = {}) {
  log(`\n$ ${cmd}`);
  try {
    const out = execSync(cmd, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...opts,
    });
    if (out) log(out.trimEnd());
    return { ok: true, out };
  } catch (e) {
    const stdout = e.stdout?.toString?.() ?? "";
    const stderr = e.stderr?.toString?.() ?? "";
    if (stdout) log(stdout.trimEnd());
    if (stderr) log(stderr.trimEnd());
    log(`EXIT_CODE=${e.status ?? 1}`);
    return { ok: false, code: e.status ?? 1, stdout, stderr };
  }
}

process.chdir(root);
log("=== Context Translate: GitHub setup (node runner) ===");
log(`ROOT=${root}`);

if (!fs.existsSync(path.join(root, ".git"))) {
  run("git init");
} else {
  log("Git repository already exists.");
}

const giPath = path.join(root, ".gitignore");
let gi = fs.existsSync(giPath) ? fs.readFileSync(giPath, "utf8") : "";
if (!/(^|\n)\.env\s*$/m.test(gi) && !/(^|\n)\.env\//m.test(gi)) {
  if (gi && !gi.endsWith("\n")) gi += "\n";
  gi += ".env\n";
  fs.writeFileSync(giPath, gi);
  log("Added .env to .gitignore.");
} else {
  log(".env already listed in .gitignore.");
}

run("git add -A");
run("git status");

const porcelain = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
if (porcelain) {
  run('git commit -m "Context Translate: Chrome v1 local-first demo extension"');
  run("git rev-parse --short HEAD");
} else {
  log("Nothing to commit (working tree clean).");
}

log("\n=== gh auth status ===");
const auth = run("gh auth status");
if (!auth.ok) {
  log("Run: gh auth login");
  fs.writeFileSync(logPath, lines.join("\n"));
  process.exit(1);
}

const names = ["context-translate", "context-translate-app"];
let repoUrl = null;
for (const name of names) {
  log(`\nTrying: gh repo create ${name} --public --source=. --remote=origin --push`);
  const r = run(`gh repo create ${name} --public --source=. --remote=origin --push`);
  if (r.ok) {
    const login = execSync("gh api user -q .login", { cwd: root, encoding: "utf8" }).trim();
    repoUrl = `https://github.com/${login}/${name}`;
    log(`\nRepository URL: ${repoUrl}`);
    break;
  }
}

run("git remote -v");

if (!repoUrl) {
  log("FAILED: Could not create repo.");
  fs.writeFileSync(logPath, lines.join("\n"));
  process.exit(1);
}

fs.writeFileSync(logPath, lines.join("\n"));
fs.writeFileSync(path.join(root, "REPO_URL.txt"), repoUrl + "\n");
log(`\nSUCCESS_URL=${repoUrl}`);
process.exit(0);
