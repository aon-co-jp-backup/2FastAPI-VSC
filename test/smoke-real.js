// Manual smoke test against the real CLI (WSL): node test/smoke-real.js <workspace-dir> <dest-root>
const core = require("../out/core.js");
const cli = { exe: process.execPath, args: [require("path").join(__dirname, "wsl-cli.js")] };
const [ws, dest] = process.argv.slice(2);
const ui = {
  pickFolder: async () => ws, pickProjects: async (p) => p, askDestination: async () => dest,
  confirmCreate: async () => "yes", confirmOverwrite: async () => true,
  info: console.log, warn: console.warn,
  done: (r) => r.forEach((x) => console.log(x.project.kind, x.project.name, "routes", x.result.routes, "warnings", x.result.warnings.length)),
};
core.scanAndConvert(ui, cli, { autoCreateFolders: false }).then((r) => console.log("converted", r.length));
