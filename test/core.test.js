const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const core = require("../out/core.js");

const cli = { exe: process.execPath, args: [path.join(__dirname, "fake-cli.js")] };

function ui(over = {}) {
  const log = { asked: [], warned: [], done: null };
  return Object.assign({
    log,
    pickFolder: async () => "/src",
    pickProjects: async (ps) => ps,
    askDestination: async (s) => s,
    confirmCreate: async (d) => { log.asked.push("create:" + d); return "yes"; },
    confirmOverwrite: async (d) => { log.asked.push("overwrite:" + d); return true; },
    info: (m) => log.asked.push("info:" + m),
    warn: (m) => log.warned.push(m),
    done: (r, d) => { log.done = { r, d }; },
  }, over);
}

test("t() joins English and Japanese", () => {
  assert.match(core.t("a", "あ"), /^a \/ あ$/);
});

test("scan + convert creates missing folders and asks (en/ja) when not automatic", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vsc-"));
  const dest = path.join(tmp, "out");
  const u = ui({ askDestination: async () => dest });
  const res = await core.scanAndConvert(u, cli, { autoCreateFolders: false });
  assert.strictEqual(res.length, 2);
  assert.ok(fs.existsSync(path.join(dest, "backend", "CONVERSION_REPORT.md")));
  assert.strictEqual(u.log.asked.filter((x) => x.startsWith("create:")).length, 2);
  assert.strictEqual(u.log.done.d, dest);
});

test("autoCreateFolders skips the question", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vsc-"));
  const u = ui({ askDestination: async () => path.join(tmp, "x", "y") });
  const res = await core.scanAndConvert(u, cli, { autoCreateFolders: true });
  assert.strictEqual(res.length, 2);
  assert.strictEqual(u.log.asked.length, 0);
});

test("declining creation skips that project; choosing a subset works", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vsc-"));
  const u = ui({
    pickProjects: async (ps) => ps.filter((p) => p.kind === "flask"),
    askDestination: async () => path.join(tmp, "o"),
    confirmCreate: async () => "no",
  });
  const res = await core.scanAndConvert(u, cli, { autoCreateFolders: false });
  assert.strictEqual(res.length, 0);
  assert.ok(u.log.warned.some((w) => w.includes("スキップ")));
});

test("non-empty destination asks for overwrite", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vsc-"));
  fs.writeFileSync(path.join(tmp, "keep.txt"), "x");
  const u = ui({
    pickProjects: async (ps) => [ps[1]],
    askDestination: async () => tmp,
    confirmOverwrite: async () => false,
  });
  const res = await core.scanAndConvert(u, cli, { autoCreateFolders: false });
  assert.strictEqual(res.length, 0);
});

test("default destination is <folder>-fastapi", () => {
  assert.strictEqual(core.defaultDestination("/a/b/"), "/a/b-fastapi");
});
