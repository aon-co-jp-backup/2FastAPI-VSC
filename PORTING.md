# 2FastAPI-VSC PORTING / 再開メモ

## 日本語
**状態**: v0.1.0(新規)。VS Code拡張。CLI(2fastapi)を呼び、フォルダ選択→スキャン→プロジェクト選択→保存先→作成確認(英日)→変換→レポート。テスト6件、実CLI(WSL)通し確認、CI成功、.vsix同梱。
**未了**: VS Code画面での実操作確認、Marketplace/Open VSX公開(アカウントとトークンが必要)、設定tofastapi.executableの自動検出。
**再開用メッセージ**: 「`F:\runo\PORTING.md` 末尾の「2026-11-15 別アカウントでの再開用メモ」と、`F:$1\PORTING.md` を読んで、未了の続きを確認なしで開発・TEST・DEBUG・commit・pushして。チャットは日本語のみ。」
**テスト**: npm install && npm test。実CLI: node test/smoke-real.js <ワークスペース> <出力先>(WSLのvenvが必要 / needs the WSL venv)

## English
**Status**: v0.1.0 (new). VS Code extension driving the 2fastapi CLI: pick folder, scan, choose projects, destination, create? (EN/JA), convert, report. 6 tests, real-CLI run via WSL, CI green, .vsix attached.
**Open**: Real interaction inside VS Code, Marketplace/Open VSX publication (needs account + token), auto-detecting the tofastapi.executable setting.
**Resume message**: "Read the 2026-11-15 section at the end of `F:\runo\PORTING.md` and `F:$1\PORTING.md`, then continue the open items without asking (develop, test, debug, commit, push). Chat in Japanese only."
**Tests**: npm install && npm test。実CLI: node test/smoke-real.js <ワークスペース> <出力先>(WSLのvenvが必要 / needs the WSL venv)
