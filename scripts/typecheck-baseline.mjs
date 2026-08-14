import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "tsconfig.app.json");
const baselinePath = resolve(root, "typecheck-baseline.json");
const mode = process.argv[2];

if (mode !== "check" && mode !== "update") {
  console.error("Usage: node scripts/typecheck-baseline.mjs <check|update>");
  process.exit(2);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  console.error(ts.formatDiagnosticsWithColorAndContext([configFile.error], formatHost));
  process.exit(2);
}

const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root, undefined, configPath);
if (parsed.errors.length > 0) {
  console.error(ts.formatDiagnosticsWithColorAndContext(parsed.errors, formatHost));
  process.exit(2);
}

const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
const current = countDiagnostics(diagnostics);

if (mode === "update") {
  const previous = readBaselineIfPresent();
  if (previous && diagnostics.length > previous.count) {
    console.error(`Refusing to grow the frontend baseline from ${previous.count} to ${diagnostics.length} errors.`);
    process.exit(1);
  }
  const baseline = {
    version: 1,
    project: "tsconfig.app.json",
    identity: "file + TypeScript error code + flattened message; occurrences preserve duplicates",
    count: diagnostics.length,
    diagnostics: [...current].sort(([left], [right]) => left.localeCompare(right)).map(([key, occurrences]) => ({ key, occurrences })),
  };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Frontend baseline updated: ${diagnostics.length} errors.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const expected = new Map(baseline.diagnostics.map(({ key, occurrences }) => [key, occurrences]));
const unexpected = [];

for (const [key, occurrences] of current) {
  const allowed = expected.get(key) ?? 0;
  if (occurrences > allowed) unexpected.push({ key, occurrences: occurrences - allowed });
}

console.log(`Frontend typecheck: ${diagnostics.length} current errors; ${baseline.count} baselined.`);
if (diagnostics.length < baseline.count) {
  console.log(`Baseline can shrink by ${baseline.count - diagnostics.length}; run npm run typecheck:baseline and commit the reduction.`);
}

if (unexpected.length > 0 || diagnostics.length > baseline.count) {
  console.error(`Frontend typecheck failed: ${unexpected.reduce((sum, item) => sum + item.occurrences, 0)} new error occurrence(s).`);
  for (const { key, occurrences } of unexpected) console.error(`  ${occurrences}x ${key}`);
  process.exit(1);
}

console.log("Frontend typecheck passed: no errors outside the committed shrink-only baseline.");

function countDiagnostics(items) {
  const counts = new Map();
  for (const diagnostic of items) {
    const file = diagnostic.file ? relative(root, diagnostic.file.fileName).replaceAll("\\", "/") : "<global>";
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ").replace(/\s+/g, " ").trim();
    const key = `${file} | TS${diagnostic.code} | ${message}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function readBaselineIfPresent() {
  try {
    return JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function formatHost() {
  return {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  };
}
