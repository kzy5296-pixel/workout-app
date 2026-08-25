# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**101トレーニング** — A PWA workout tracker built on the Yamamoto Yoshinori (山本義徳) training method.

- Live: `https://kzy5296-pixel.github.io/workout-app/`
- Repo: `https://github.com/kzy5296-pixel/workout-app`
- Installed on iOS via PWA (Home Screen shortcut)

## Development

**Preview locally** (`.claude/launch.json` と同じ設定。キャッシュ無効なのでPWA開発向き):
```sh
npx --yes http-server -p 3333 -c-1
# Open http://localhost:3333
```

**Deploy:** push to main (GitHub Pages, no CI). キャッシュ更新を含む手順は `deploy` スキル（`.claude/skills/deploy/SKILL.md`）を参照。

**コミットとpushは、頼まれた作業の一部として最後まで行う。** 「直して」「作って」と頼まれたら、編集して結果を確認したあと `deploy` スキルの手順（`sw.js` の `CACHE_NAME` を上げる → 変更ファイルを名指しで add → commit → push → 公開URLで反映確認）まで通してから報告する。

ただしこのリポジトリは公開されていて、mainへのpushがそのまま本番公開になる（カズヤさんのiPhoneのホーム画面に入っているPWAにも配信される）。**`git add .` は使わず、今回変更したファイルだけを名指しで add する。** 同居している無関係なファイル（下の「作業範囲」の表）を巻き込まないため。

There is no build step, no package manager, no transpilation. Edit the HTML/CSS/JS files directly.

## 作業範囲

アプリ開発を頼まれたときに編集してよいのは、リポジトリ直下のアプリ本体だけ:
`index.html` / `styles.css` / `js/*.js` / `sw.js` / `manifest.json` / アイコン画像。

同じフォルダに、このアプリと無関係なものが同居している。名指しで頼まれない限り読み書きしない:

| 場所 | 中身 | 注意 |
|---|---|---|
| `ai-staff/` | AI社員の記憶・タスク・ナレッジ | 別リポジトリ。`.gitignore` 済み |
| `シフト表作成/` | 職場のシフト自動作成ツール一式 | **`.gitignore` されていない。公開リポジトリなので絶対にコミットしない** |
| `実装指示書*.md` | 機能追加の発注書 | 読む対象。実装結果を書き戻す場所ではない |
| `.claude/` `.codex/` | 設定とスキル | |

上のどれにも当てはまらないファイルを編集する必要が出たら、先に確認する。

## Architecture

Plain HTML/CSS/JS with no framework, no bundler, and no external dependencies. 2026-05-08 に単一ファイル（旧 index.html 約4300行）から以下に分割済み：

| File | 内容 |
|---|---|
| `index.html` (~170行) | マークアップのみ（5画面のコンテナ） |
| `styles.css` (~1150行) | 全スタイル |
| `js/state.js` (~350行) | `load()`/`save()`、`BODY_PARTS`、`PHASE_ROTATION` |
| `js/speech.js` (~150行) | インターバル終了の音声アナウンス（既定OFF） |
| `js/exercises.js` (~1080行) | `EXERCISES`、`VIDEO_LINKS`、`UL_DAYS`、`renderGuide()` |
| `js/record.js` (~950行) | 記録画面、レストポーズ |
| `js/analysis.js` (~560行) | `renderAnalysis()`、グラフ、カレンダー |
| `js/app.js` (~840行) | `switchTab()`、ホーム・メニュー画面 |

**ファイルを新規追加したら `sw.js` の `ASSETS` 配列にも登録する**（オフラインキャッシュの対象リスト）。

### Screen structure

Five tabs rendered into static `<div id="screen-*">` containers. Tab switches call `switchTab(tab)`, which shows the target screen and calls its `render*()` function:

| Screen div | Render function | Purpose |
|---|---|---|
| `screen-home` | `renderHome()` | Dashboard, today's recommendations |
| `screen-menu` | `renderMenu()` | Training menu / split selector |
| `screen-record` | `renderRecord()` | Active workout session |
| `screen-analysis` | `renderAnalysis()` | History, charts, calendar |
| `screen-guide` | `renderGuide()` | Exercise encyclopedia (種目図鑑) |

### Data layer

All state is persisted in `localStorage` through two wrappers (`load(key, default)` / `save(key, val)`):

| Key | Contents |
|---|---|
| `t101_history` | Array of completed workout sessions |
| `t101_session` | Currently active session (null if none) |
| `t101_prs` | Personal records by exercise name |
| `t101_restdays` | Array of date strings for gym days (calendar) |
| `t101_big3` | Big 3 max weights `{squat, bench, deadlift}` |
| `t101_prog_start` | ISO date string when the 9-week UL program started |
| `t101_split` | Selected split (2 / 3 / 4 days) |

Data export/import is JSON (`exportData()` / `importData()`). `clearAllData()` wipes all keys above.

### Training method (Mandelbrot / Yamamoto)

The app implements the Mandelbrot method with three intensity phases that rotate automatically:

- **medium** (Phase 1 — 中重量)
- **heavy** (Phase 2 — 高重量)  
- **light** (Phase 3 — 低重量)

`getRecommendedPhase(parts)` looks at recent history and advances `PHASE_ROTATION` automatically. Heavy phase uses the **Rest-Pause** technique (`startYamaSpecial()` / `toggleRestPause()`).

The 9-week Upper/Lower program (`UL_DAYS` array, `buildULExercises()`) calculates percentages of Big 3 1RM week-by-week via `COMPOUND_PCT` and `getProgWeek()`.

### Service Worker (`sw.js`)

- Cache name: `CACHE_NAME` 定数（`101training-vNN`）— 数字を上げるとキャッシュバストされ更新バナーが出る（手順は `deploy` スキル参照）。
- Navigation requests (HTML): network-first, cache fallback.
- Asset requests: cache-first.
- On activate: broadcasts `{type: 'SW_UPDATED'}` to all open clients so the app can show the update banner.
- Background timer: receives `SCHEDULE_TIMER` / `CANCEL_TIMER` messages and fires a push notification when the rest interval ends.

### Exercise database

`EXERCISES` object maps body part keys to arrays of exercise definitions. `BODY_PARTS` maps keys to display names. `VIDEO_LINKS` maps exercise names to YouTube video IDs for the guide.

Bilateral flag (`bilateral: true`) enables separate left/right weight tracking in the record screen.

## Key conventions

- **No leg exercises** — カズヤさんの希望でスキップ済み。`プロジェクト２/ai-staff/knowledge/workout_app.md` を参照。
- When adding a new exercise, add it to `EXERCISES`, add a `VIDEO_LINKS` entry if available, and add guide card HTML inside the `renderGuide()` function block for the appropriate body part (all three live in `js/exercises.js`).
- When adding a new screen or major feature, follow the existing pattern: static container div → `render*()` function called from `switchTab()`.
- Commit messages use `feat:` / `fix:` / `style:` prefixes (see git log).

## AI staff system (`ai-staff/`)

`ai-staff/CLAUDE.md` is a separate instruction set for a personal assistant persona — it is not related to app development. The `ai-staff/` directory stores assistant memory, tasks, and knowledge files; do not confuse it with app source code.
