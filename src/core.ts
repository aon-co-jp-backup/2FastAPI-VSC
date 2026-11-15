// Editor-independent logic: talks to the `2fastapi` CLI and drives the question flow.
// Every user-facing text is English + Japanese. The UI is injected so this file has no `vscode` import.
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface Project {
  kind: "flask" | "django";
  name: string;
  path: string;
  entry: string;
  files: string[];
  routes: number;
  notes: string[];
}

export interface Cli {
  exe: string;
  args: string[]; // placed before the sub-command
}

export interface ConvertResult {
  routes: number;
  warnings: string[];
  dest: string;
}

export interface Ui {
  pickFolder(): Promise<string | undefined>;
  /** Show the detected projects, return the ones to convert (undefined = cancelled). */
  pickProjects(projects: Project[]): Promise<Project[] | undefined>;
  /** Ask for the destination root; `suggested` is the default. undefined = cancelled. */
  askDestination(suggested: string): Promise<string | undefined>;
  /** "Folder does not exist: create it automatically?" */
  confirmCreate(dir: string): Promise<"yes" | "no" | "choose">;
  confirmOverwrite(dir: string): Promise<boolean>;
  info(message: string): void;
  warn(message: string): void;
  done(results: Array<{ project: Project; result: ConvertResult }>, destRoot: string): void;
}

/** "English / 日本語" */
export function t(en: string, ja: string): string {
  return `${en} / ${ja}`;
}

export function runCli(cli: Cli, sub: string[], cwd?: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cli.exe, [...cli.args, ...sub], { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
    child.stderr.on("data", (d) => (stderr += d.toString("utf8")));
    child.on("error", (e) => reject(e));
    child.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }));
  });
}

export async function scanFolder(cli: Cli, folder: string): Promise<Project[]> {
  const r = await runCli(cli, ["scan", folder, "--json"]);
  if (r.code !== 0) {
    throw new Error(t("scan failed", "スキャンに失敗しました") + ": " + (r.stderr || r.stdout).trim());
  }
  const line = r.stdout.trim().split(/\r?\n/).filter((l) => l.startsWith("[")).pop() ?? "[]";
  return JSON.parse(line) as Project[];
}

export async function convertProject(cli: Cli, p: Project, dest: string): Promise<ConvertResult> {
  const r = await runCli(cli, ["convert", "--kind", p.kind, "--path", p.path, "-o", dest, "--json"]);
  if (r.code !== 0) {
    throw new Error(`${p.name}: ` + (r.stderr || r.stdout).trim());
  }
  const line = r.stdout.trim().split(/\r?\n/).filter((l) => l.startsWith("{")).pop() ?? "{}";
  return JSON.parse(line) as ConvertResult;
}

export function defaultDestination(folder: string): string {
  return folder.replace(/[\\/]+$/, "") + "-fastapi";
}

function isNonEmptyDir(d: string): boolean {
  try {
    return fs.readdirSync(d).length > 0;
  } catch {
    return false;
  }
}

export interface FlowOptions {
  autoCreateFolders: boolean;
}

/** The whole "scan → choose → where? → create? → convert" flow. */
export async function scanAndConvert(
  ui: Ui,
  cli: Cli,
  opts: FlowOptions,
  startFolder?: string
): Promise<Array<{ project: Project; result: ConvertResult }>> {
  const folder = startFolder ?? (await ui.pickFolder());
  if (!folder) return [];
  const projects = await scanFolder(cli, folder);
  if (projects.length === 0) {
    ui.info(t("No Flask or Django project found in this folder.", "このフォルダには Flask / Django のプロジェクトが見つかりませんでした。"));
    return [];
  }
  const chosen = await ui.pickProjects(projects);
  if (!chosen || chosen.length === 0) return [];
  let destRoot = await ui.askDestination(defaultDestination(folder));
  if (!destRoot) return [];
  const out: Array<{ project: Project; result: ConvertResult }> = [];
  for (const p of chosen) {
    let dest = chosen.length > 1 ? path.join(destRoot, p.name) : destRoot;
    if (!fs.existsSync(dest)) {
      if (!opts.autoCreateFolders) {
        const a = await ui.confirmCreate(dest);
        if (a === "no") {
          ui.warn(t(`Skipped ${p.name}.`, `${p.name} をスキップしました。`));
          continue;
        }
        if (a === "choose") {
          const again = await ui.askDestination(dest);
          if (!again) continue;
          dest = again;
          destRoot = path.dirname(dest);
        }
      }
    } else if (isNonEmptyDir(dest) && !(await ui.confirmOverwrite(dest))) {
      ui.warn(t(`Skipped ${p.name}.`, `${p.name} をスキップしました。`));
      continue;
    }
    if (path.resolve(dest) === path.resolve(p.path)) {
      ui.warn(t(`Skipped ${p.name}: destination equals the source.`, `${p.name} をスキップ: 変換先が変換元と同じです。`));
      continue;
    }
    fs.mkdirSync(dest, { recursive: true });
    const result = await convertProject(cli, p, dest);
    out.push({ project: p, result });
  }
  if (out.length) ui.done(out, destRoot);
  return out;
}
