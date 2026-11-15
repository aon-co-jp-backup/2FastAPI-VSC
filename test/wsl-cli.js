// Windows-side adapter for the smoke test: wsl.exe mangles backslashes, so use forward slashes.
const { spawnSync } = require("child_process");
const args = process.argv.slice(2).map((a) => (/^[A-Za-z]:\\/.test(a) ? a.replace(/\\/g, "/") : a));
const r = spawnSync("wsl", ["-d", "Ubuntu", "--", "bash", "/mnt/f/2FastAPI-VSC/test/wsl-cli.sh", ...args], { stdio: "inherit" });
process.exit(r.status ?? 1);
