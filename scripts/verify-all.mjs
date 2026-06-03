/**
 * Local verification only: install/build/test. No git push, gh, deploy, or billing.
 * See LOCAL_ONLY.md
 */
import { execSync } from "node:child_process";
import { writeFileSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const log = join(root, "scripts", "verify-results.log");

const steps = [
  ["core build", ["pnpm", "--filter", "@context-translate/core", "build"]],
  ["core test", ["pnpm", "--filter", "@context-translate/core", "test"]],
  ["api build", ["pnpm", "--filter", "@context-translate/api", "build"]],
  ["extension build", ["pnpm", "--filter", "@context-translate/extension", "build"]],
  ["desktop build", ["pnpm", "--filter", "@context-translate/desktop", "build"]],
];

writeFileSync(log, `Started ${new Date().toISOString()}\n`, "utf8");

const failed = [];
for (const [name, args] of steps) {
  appendFileSync(log, `\n========== ${name} ==========\n`, "utf8");
  try {
    const out = execSync(["corepack", ...args].join(" "), {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: process.env,
    });
    appendFileSync(log, out, "utf8");
    appendFileSync(log, "EXIT_CODE=0\n", "utf8");
  } catch (err) {
    appendFileSync(
      log,
      `${err.stdout ?? ""}${err.stderr ?? ""}${err.message}\nEXIT_CODE=${err.status ?? 1}\n`,
      "utf8",
    );
    failed.push(name);
  }
}

appendFileSync(
  log,
  `\n========== SUMMARY ==========\n${failed.length === 0 ? "ALL PASSED" : `FAILED: ${failed.join(", ")}`}\n`,
  "utf8",
);

process.exit(failed.length === 0 ? 0 : 1);
