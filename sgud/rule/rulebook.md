# 規則帳本(rulebook)

本檔為**藍圖**:以規則為單位記「程式碼須長成什麼樣」,附盤點方式與判準。各功能做到哪裡見 `sgud/state/state.md`;過程與經驗見 `sgud/exp/experience.md`。2026-11-10 建立(本套件原無 sgud)。

## 一、合併 worker 之建置(`toolg/gMergeWorker.mjs`)

本套件之 worker 程式碼由三段依序串接而成:`promise-polyfill` 壓縮檔 + `srcTemp/WConverwsClient.iife.js`(w-converws 用戶端之 iife,`(ws)` 置換為 `()`)+ `src/webworker.mjs` 之壓縮碼;串接後刪除全部換行與 `use strict`,存為 `srcTemp/WConverwsClient_WebworkerMerge.mjs`,並另存其 base64(`.b64`)供 `toolg/gMergeCaller.mjs` 置換進 `src/webcaller.mjs` 之 `{codeB64}`。

本節只規範本套件特有之「IIFE 與合併 worker」建置列(統一建置機制規格載明之 A 型特有列)的行為,不涉其他 `toolg/` 腳本之標準寫法;`script.txt` 之內容與列序由使用者維護,不在本節。

| 條號 | 規則 | 盤點與判準 | 狀態 |
|---|---|---|---|
| R1 | 建置腳本不得依賴 Babel:不 import `@babel/*`、`babel-*`、`core-js`,也不依賴由 `w-package-tools` 提升而來之套件;所用第三方套件須於 `package.json` 之 `devDependencies` 自行宣告 | 測試 `unit-mergeWorker` 第 1 案(掃腳本內容與 import 清單對照 `package.json`)。另可用載入攔截(攔 `@babel/`、`babel-`、`core-js` 之 ESM 與 CJS 解析)執行腳本,應仍成功,見經驗三 | 已套 |
| R2 | worker 段(`src/webworker.mjs`)**只壓縮、不轉譯**,且不改頂層結構:頂層名稱(`wo`、`bInit`、`init`、`sendMessage`、`sendSystemMessage`)與 `self.onmessage` 賦值維持,不包 IIFE、不加 `use strict`(`terser` 之 `toplevel` 保持預設 false) | 產物之 worker 段應含上列名稱;見 `unit-mergeWorker` 往返案(init/execute/broadcast/deliver/未知 type) | 已套 |
| R3 | 合併碼之最低語法等級由 iife 段決定(現為 ES2018,物件展開),worker 段語法不得高於 iife 段 | 以 `acorn` 對三段各以 `ecmaVersion` 5/2015/…/2018 解析,worker 段之最低版本應 ≤ iife 段;現況 worker 段 2015、iife 段 2018 | 已套(未自動化,見 state 已知缺口) |
| R4 | 合併碼須為單行,且刪換行後仍為合法之 classic script(`clearCode` 刪除全部 `\n`,故碼中不得有行註解 `//` 或依賴自動分號之寫法) | `unit-mergeWorker`「單行且可解析」案(`vm.Script` 只編譯不執行) | 已套 |
| R5 | `.b64` 解碼(`wsemi` 之 `b642str`)須等於合併碼;`dist/*.umd.js` 載入後建立之 Worker 其程式碼須等於合併碼 | `unit-mergeWorker`「.b64 解碼」案與「dist 內嵌」案(以 `vm` 沙箱假造 `Blob`、`Worker`、`URL.createObjectURL`) | 已套 |
| R6 | worker 之訊息契約(對應 `src/webworker.mjs`):`init` 後回系統訊息 `open`、`openOnce`(`data:null`)並回 `{_id, output:null}`;`execute` 回進度 `{_id, prog}` 與 `{_id, output}`;`broadcast`/`deliver` 回進度至 100 並使伺服器收到資料;未知 `type` 回系統訊息 `error`,內容 `type error: <type>` | `unit-mergeWorker` 往返案(真實 `w-converws` 伺服器置於獨立 `worker_threads`,Web Worker 語意以 `worker_threads` 補 `self`、`postMessage`、`WorkerGlobalScope` 模擬),對「已提交產物」與「現場執行建置腳本於暫存資料夾之產物」各跑一次 | 已套 |
| R7 | 跨 worker 邊界之資料須可 structured clone:worker 送回呼叫端之訊息全數經 `sendMessage` 單一出口(`src/webworker.mjs` 內 `self.postMessage` 只出現在 `sendMessage`);正常路徑原樣 `postMessage`,不在每則訊息上轉換;只在其拋例外(`DataCloneError`)時,改送 `toCloneable` 之摘要(`Event` 取 `type`、`Error` 取 `message`、函數 `'[Function]'`、其餘不可複製之值取 `String(值)`;陣列與純物件逐欄處理以保留可複製欄位,巢狀以 10 層為限);摘要仍送不出(如通道已關閉)則放棄、不外拋,以免 worker 崩潰。`toCloneable` 僅處理實際會送出之形狀(`w-converws-client` 之 `{ msg, err }` 與伺服器傳來之 JSON 資料),不泛化到其他物件型別。呼叫端收到之 `error` 資料形狀見 README〈Data of the `error` event〉與 `src/webcaller.mjs` JSDoc | 盤點:`git grep -n "postMessage" -- src/webworker.mjs` 應只有 `sendMessage` 內兩處(原樣與摘要重試)。站點全集(worker→呼叫端):`open`/`openOnce`/`close`/`error`/`reconn`/`broadcast`/`deliver` 系統訊息、`init` 回覆、`execute` 進度與結果、`broadcast`/`deliver` 進度,皆經 `sendSystemMessage`／`sendMessage`:**已套**。呼叫端→worker 方向(`src/webcaller.mjs` 之 `wk.postMessage`)之 `input` 由呼叫端提供,不可複製者於呼叫端同步拋 `DataCloneError`:**刻意不套**。測試:`unit-mergeWorker`「src/webworker.mjs送回呼叫端之資料須可structured clone」10 案(以 `vm` 載入 src,以 `MessageChannel` 模擬 `postMessage` 之 `DataCloneError`,以真實 WebSocket 錯誤事件為觸發值)與「init連不上伺服器」整合案(對已提交產物與現場建置產物各一) | 已套 |

## 二、不屬本套件之配合事項(記錄,非本套件待辦)

- 專案根目錄之 `babel.config.js`(含 `useBuiltIns`/`corejs`)由 `w-package-tools` 升 `@babel/core` 8 時之全庫連動統一處理;本套件不自行改。
- `script.txt` 由使用者維護,其中說明建置用 Babel 之註解列已過時(R1 之後腳本不再用 Babel),不由 agent 改。
