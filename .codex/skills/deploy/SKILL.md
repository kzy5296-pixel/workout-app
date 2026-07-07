---
name: deploy
description: 101トレーニング（workout-app）をGitHub Pagesへデプロイする手順。デプロイ・公開・リリース・キャッシュ更新（sw.jsのバージョン上げ）を頼まれたときに使う。
---

# デプロイ手順（GitHub Pages — CIなし、mainへのpushで即公開）

1. **キャッシュバージョンを上げる**（アプリに見える変更があるとき必須）
   - `sw.js` 冒頭の `CACHE_NAME`（`101training-vNN`）の数字を +1 する。
   - これを忘れると、ユーザーの端末が古いキャッシュを使い続けて変更が反映されない。
   - 数字を上げると、開いているアプリに更新バナーが表示される（SW_UPDATED ブロードキャスト）。

2. **コミット & プッシュ**
   ```sh
   git add index.html sw.js
   git commit -m "feat: ..."   # feat: / fix: / style: プレフィックス（git log 参照）
   git push
   ```

3. **反映確認**
   - https://kzy5296-pixel.github.io/workout-app/ を開いて確認（反映まで1〜2分かかることがある）。
   - iOS の PWA（ホーム画面版）は、アプリを開き直すと更新バナーが出る。
