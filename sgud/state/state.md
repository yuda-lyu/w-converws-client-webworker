# 現況(state)

本檔只記**現況**:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證;過程寫入 `sgud/exp/experience.md`。與 `sgud/rule/rulebook.md`(藍圖)比對即知尚未做到者。2026-11-10 建立。

## 版本與驗證

- `package.json` 版本 1.0.59(未改版、未發布、未提交;版本與發布由使用者處理)。
- 全套 `npm test`:33 passing(`test/all.test.mjs` 1 + `test/unit-mergeWorker.test.mjs` 32),見下〈最近一次驗證〉。

## 功能現況

| 功能 | 檔案 | 規則帳本 | 測試檔 | 狀態 |
|---|---|---|---|---|
| 瀏覽器端以 Web Worker 建立 WebSocket 用戶端(呼叫端) | `src/webcaller.mjs` | R5、R6、R7 | `test/unit-mergeWorker.test.mjs`(dist 內嵌案) | 可用;`error` 事件資料形狀已寫入 JSDoc 與 README |
| Worker 端程式(轉接 `WConverwsClient`) | `src/webworker.mjs` | R6、R7 | `test/unit-mergeWorker.test.mjs`(往返案、送回資料須可複製案) | 可用;**2026-11-10 起** `postMessage` 拋 `DataCloneError` 時改送可複製之摘要(`toCloneable`),`error` 事件不再使 worker 丟失訊息或崩潰 |
| 合併 worker 建置(promise polyfill + iife + worker 壓縮碼) | `toolg/gMergeWorker.mjs` | R1–R4 | `test/unit-mergeWorker.test.mjs` | **2026-11-10 改寫完成**:由 Babel(`@babel/core`+`babel-preset-minify`+`preset-env`)改為自宣告之 `terser` 只壓縮不轉譯;不再依賴 Babel 任何版本 |
| 合併 b64 置換進呼叫端 | `toolg/gMergeCaller.mjs` | R5 | 同上 | 可用(未改) |
| IIFE、dist 打包、docs | `toolg/gDistRollupIIFE.mjs`、`toolg/gDistRollupWorker.mjs`、`toolg/genDocsDist.mjs`、`toolg/cleanFolder.mjs` | — | — | 可用(未改;經 `w-package-tools`) |

## 已知缺口與待辦

- R3(worker 段語法等級不高於 iife 段)尚無自動化測試,僅在報告以 `acorn` 比對留證。
- `script.txt` 第 9 列註解(建置用 Babel、須安裝 `babel-preset-minify`)已過時,由使用者決定是否更新。
- 專案根 `babel.config.js` 待全庫連動統一改(見規則帳本二)。
- 呼叫端→worker 方向(`src/webcaller.mjs` 之 `wk.postMessage`)之 `input` 若含不可複製之值(如函數),於呼叫端同步拋 `DataCloneError`;屬呼叫端自身之呼叫,刻意不處理(見 R7)。
- 真實瀏覽器(Chromium)已實測 `error` 事件與正常路徑(見〈最近一次驗證〉),未測其他瀏覽器;Error 物件是否可複製依瀏覽器而異,可複製時 `err` 為複製後之 Error 而非字串。

## 最近一次驗證

- 2026-11-10(`DataCloneError` 修正輪):`script.txt` 建置列(`cleanFolder` → `jsdoc` → `gDistRollupIIFE` → `gMergeWorker` → `gMergeCaller` → `gDistRollupWorker` → `genDocsDist`)全數 exit 0;`npm test` 33 passing(經測試鎖);`unit-mergeWorker` 另連跑 8 次全過;`src/webworker.mjs` 變異 11 個皆被對應斷言抓到;修前夾具(HEAD 之 `src/webworker.mjs` 與修前產物)跑現行測試檔 8 案紅(含「init 連不上伺服器」整合案);真實 Chromium(headless,playwright-core)對修前 dist:連不上伺服器時頁面出現 `Event object could not be cloned`、呼叫端收不到 `error`;對修後 dist:收到 `{ msg: 'websocket error', err: 'error' }`、頁面無例外,正常路徑(open、openOnce、execute add=3、broadcast、deliver)皆通。
- 2026-11-10(合併 worker 建置改寫輪):新舊產物差異:polyfill 段、iife 段逐字相同,僅 worker 段由 ES5 變為 ES2015 語法(整份合併檔最低語法等級 ES2018 不變)。
