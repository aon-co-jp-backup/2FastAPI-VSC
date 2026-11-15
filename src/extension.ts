import * as vscode from "vscode";
import * as path from "path";
import { Cli, ConvertResult, Project, Ui, convertProject, runCli, scanAndConvert, scanFolder, t } from "./core";

function cliFromConfig(): Cli {
  const c = vscode.workspace.getConfiguration("tofastapi");
  return { exe: c.get<string>("executable", "2fastapi"), args: c.get<string[]>("args", []) };
}

function installHint(): string {
  return t(
    "2FastAPI was not found. Install it with: pip install git+https://github.com/aon-co-jp/2FastAPI  (or set tofastapi.executable).",
    "2FastAPI が見つかりません。pip install git+https://github.com/aon-co-jp/2FastAPI で導入するか、設定 tofastapi.executable を指定してください。"
  );
}

function makeUi(output: vscode.OutputChannel): Ui {
  return {
    async pickFolder() {
      const r = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
        openLabel: t("Scan this folder", "このフォルダをスキャン"),
        title: t("Folder to scan for Flask / Django projects", "Flask / Django を探すフォルダ"),
      });
      return r?.[0]?.fsPath;
    },
    async pickProjects(projects: Project[]) {
      const items = projects.map((p) => ({
        label: `$(package) ${p.name}`,
        description: `${p.kind}  ·  routes≈${p.routes}`,
        detail: p.path,
        picked: true,
        project: p,
      }));
      const sel = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        title: t(`Detected ${projects.length} project(s) - choose what to convert`, `${projects.length} 件を検出 - 変換するものを選択`),
        placeHolder: t("Tick the projects to convert", "変換するプロジェクトにチェック"),
      });
      return sel?.map((s) => s.project);
    },
    async askDestination(suggested: string) {
      const use = t(`Use ${suggested}`, `${suggested} を使う`);
      const choose = t("Choose another folder...", "別のフォルダを選ぶ...");
      const a = await vscode.window.showQuickPick([use, choose], {
        title: t("Where should the converted code go?", "変換後のコードの保存先はどこにしますか?"),
      });
      if (!a) return undefined;
      if (a === use) return suggested;
      const r = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: t("Use this folder", "このフォルダを使う") });
      return r?.[0]?.fsPath;
    },
    async confirmCreate(dir: string) {
      const yes = t("Create it", "作成する");
      const choose = t("Choose another", "別の場所を選ぶ");
      const a = await vscode.window.showWarningMessage(
        t(`The folder does not exist: ${dir}. Create it automatically?`, `フォルダがありません: ${dir}。自動作成しますか?`),
        { modal: true },
        yes,
        choose
      );
      return a === yes ? "yes" : a === choose ? "choose" : "no";
    },
    async confirmOverwrite(dir: string) {
      const yes = t("Overwrite", "上書きする");
      const a = await vscode.window.showWarningMessage(
        t(`${dir} is not empty. Overwrite files with the same name?`, `${dir} は空ではありません。同名のファイルを上書きしますか?`),
        { modal: true },
        yes
      );
      return a === yes;
    },
    info: (m) => void vscode.window.showInformationMessage(m),
    warn: (m) => {
      output.appendLine(m);
      void vscode.window.showWarningMessage(m);
    },
    done(results, destRoot) {
      for (const { project, result } of results) {
        output.appendLine(`${project.name} (${project.kind}) -> ${result.dest}: ${result.routes} routes, ${result.warnings.length} warnings`);
        for (const w of result.warnings) output.appendLine("  - " + w);
      }
      output.show(true);
      const open = t("Open destination", "変換先を開く");
      const report = t("Open report", "レポートを開く");
      void vscode.window
        .showInformationMessage(
          t(`Converted ${results.length} project(s).`, `${results.length} 件を変換しました。`),
          open,
          report
        )
        .then(async (a) => {
          if (a === open) await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(destRoot));
          if (a === report) {
            const f = path.join(results[0].result.dest, "CONVERSION_REPORT.md");
            await vscode.window.showTextDocument(vscode.Uri.file(f));
          }
        });
    },
  };
}

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("2FastAPI");
  const guard = async (fn: () => PromiseLike<unknown>) => {
    try {
      await fn();
    } catch (e: any) {
      const msg = e && e.code === "ENOENT" ? installHint() : String(e?.message ?? e);
      output.appendLine(msg);
      void vscode.window.showErrorMessage(msg);
    }
  };
  context.subscriptions.push(
    vscode.commands.registerCommand("tofastapi.scanAndConvert", (uri?: vscode.Uri) =>
      guard(() =>
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: t("2FastAPI: scanning / converting", "2FastAPI: スキャン・変換中") }, () =>
          scanAndConvert(makeUi(output), cliFromConfig(), { autoCreateFolders: vscode.workspace.getConfiguration("tofastapi").get<boolean>("autoCreateFolders", false) }, uri?.fsPath)
        )
      )
    ),
    vscode.commands.registerCommand("tofastapi.scanOnly", () =>
      guard(async () => {
        const r = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false });
        if (!r?.[0]) return;
        const ps = await scanFolder(cliFromConfig(), r[0].fsPath);
        output.clear();
        for (const p of ps) output.appendLine(`${p.kind}\t${p.name}\troutes≈${p.routes}\t${p.path}`);
        if (!ps.length) output.appendLine(t("No Flask or Django project found.", "Flask / Django のプロジェクトは見つかりませんでした。"));
        output.show(true);
      })
    ),
    vscode.commands.registerCommand("tofastapi.convertFile", () =>
      guard(async () => {
        const ed = vscode.window.activeTextEditor;
        if (!ed) return;
        const src = ed.document.uri.fsPath;
        const r = await runCli(cliFromConfig(), ["flask", src]);
        if (r.code !== 0) throw new Error(r.stderr.trim());
        const doc = await vscode.workspace.openTextDocument({ language: "python", content: r.stdout });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        if (r.stderr.trim()) output.appendLine(r.stderr.trim());
      })
    )
  );
}

export function deactivate() {}

// keep the import used (type only)
export type _Unused = ConvertResult | typeof convertProject;
