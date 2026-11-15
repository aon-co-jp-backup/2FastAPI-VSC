# 2FastAPI-VSC

**日本語**: [2FastAPI](https://github.com/aon-co-jp/2FastAPI)(Flask / Django → FastAPI 変換ツール。出力は [MFastAPI](https://github.com/aon-co-jp/MFastAPI) 互換)の **Visual Studio Code 拡張**。フォルダを指定すると自動スキャンし、**複数のシステム・プロジェクトを自動検出**して、変換先フォルダ(無ければ**作成してよいか質問**、または自動作成)を英語と日本語で尋ねながら変換します。

**English**: **Visual Studio Code extension** for [2FastAPI](https://github.com/aon-co-jp/2FastAPI) (Flask / Django → FastAPI, MFastAPI compatible). Pick a folder, it scans, **detects several systems / projects at once**, and asks (in English and Japanese) where to put the converted code, offering to create the folder (or creating it automatically if you enable that).

## 使い方 / Usage
1. `pip install git+https://github.com/aon-co-jp/2FastAPI`(または設定 `tofastapi.executable` / `tofastapi.args` で `python -m tofastapi`)
2. コマンドパレット / Command Palette: **2FastAPI: Scan folder and convert / フォルダをスキャンして変換**(エクスプローラーのフォルダを右クリックでも可 / also in the Explorer folder context menu)
3. 検出一覧から変換するプロジェクトにチェック → 保存先(既定 `<フォルダ>-fastapi`)→ 無ければ作成確認 → 変換 → `CONVERSION_REPORT.md`(手作業が要る箇所の警告)

| コマンド / Command | 内容 / What |
|---|---|
| 2FastAPI: Scan folder and convert | スキャン→選択→保存先→変換 / scan → choose → destination → convert |
| 2FastAPI: Scan folder (list only) | 検出一覧だけ表示 / list only |
| 2FastAPI: Convert this Flask file | 開いている Flask ファイルを変換して横に表示 / convert the open file |

設定 / Settings: `tofastapi.executable`, `tofastapi.args`, `tofastapi.autoCreateFolders`(true で質問せずフォルダ作成 / create folders without asking)。

## 検出するもの / What is detected
`manage.py` のある Django プロジェクト、`urls.py` だけの Django アプリ、`Flask(...)` を作る Flask アプリ(ブループリントなど同じ階層以下の Flask モジュールも一緒に変換)。`venv` / `node_modules` / `.git` などは無視。コードは実行せず読むだけ。 / Django projects (`manage.py`), stand-alone Django apps, and Flask apps (blueprints below them are converted too). `venv`, `node_modules`, `.git` etc. are skipped; code is only read, never executed.

## 開発 / Development
```
npm install
npm test          # tsc + node --test (偽CLIで質問フロー全体を試験 / full question flow against a fake CLI)
npx vsce package  # .vsix
```
実CLI(WSL)の通し確認: `node test/smoke-real.js <ワークスペース> <出力先>`。 / Real-CLI smoke test: see `test/smoke-real.js`.
ライセンス / License: MIT
