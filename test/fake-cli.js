// Stand-in for `2fastapi`: scan -> two projects, convert -> writes a marker file.
const fs = require("fs");
const path = require("path");
const a = process.argv.slice(2);
if (a[0] === "scan") {
  const root = a[1];
  console.log(JSON.stringify([
    { kind: "django", name: "backend", path: path.join(root, "backend"), entry: "", files: [], routes: 5, notes: [] },
    { kind: "flask", name: "api", path: path.join(root, "api"), entry: "app.py", files: ["app.py"], routes: 3, notes: [] },
  ]));
} else if (a[0] === "convert") {
  const out = a[a.indexOf("-o") + 1];
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "CONVERSION_REPORT.md"), "report");
  console.log(JSON.stringify({ routes: 3, warnings: ["w1"], dest: out }));
} else { process.exit(2); }
