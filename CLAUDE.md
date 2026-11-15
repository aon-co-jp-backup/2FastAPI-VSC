# 2FastAPI-VSC 開発方針 / Development notes

**日本語**: 共通ルールは [`open-raid-z/CLAUDE.md`](https://github.com/aon-co-jp/open-raid-z) と [`runo`](https://github.com/aon-co-jp/runo) の `CLAUDE.md` を参照。チャットは日本語のみ。確認なしで開発・TEST・DEBUG・commit・push。UI・インストーラーはリリース前に実機/エミュレーターで確認。heredocでバックスラッシュを含むコードを書かない(Writeツールを使う)。
**English**: shared rules live in `open-raid-z/CLAUDE.md` and `runo/CLAUDE.md`. Chat in Japanese only. Develop, test, debug, commit and push without asking. Verify UI/installers on real devices/emulators before each release. Do not write code containing backslashes through bash heredocs (use the Write tool).

## 状態 / Status
- 日本語: v0.1.0(新規)。VS Code拡張。CLI(2fastapi)を呼び、フォルダ選択→スキャン→プロジェクト選択→保存先→作成確認(英日)→変換→レポート。テスト6件、実CLI(WSL)通し確認、CI成功、.vsix同梱。
- English: v0.1.0 (new). VS Code extension driving the 2fastapi CLI: pick folder, scan, choose projects, destination, create? (EN/JA), convert, report. 6 tests, real-CLI run via WSL, CI green, .vsix attached.

## 未了 / Open
- 日本語: VS Code画面での実操作確認、Marketplace/Open VSX公開(アカウントとトークンが必要)、設定tofastapi.executableの自動検出。
- English: Real interaction inside VS Code, Marketplace/Open VSX publication (needs account + token), auto-detecting the tofastapi.executable setting.

詳細・再開用メッセージ / details and the resume message: [`PORTING.md`](PORTING.md)
