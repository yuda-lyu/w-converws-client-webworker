# 回饋(feedback)

任務中發現之自有套件、全域技能、全域設定之調整與抽提提案(只增不改,處置結果另記一列)。

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-10 | 自有套件 | w-package-tools | 建議提供「只壓縮、不轉譯、不改頂層結構」之程式碼片段 API(類 `minifyCode`)。現以 `rollupCode` 處理無匯出之 worker 片段:`formatOut:'iife'` 會包 `!function(){"use strict";…}()` 並內聯 `init`,`'es'` 則縮短頂層名稱(`wo`→`n` 等),且輸出隨 Babel/browserslist 版本而變,無法保證 worker 全域結構不變;本套件因此改自宣告 `terser`。若多個套件有同類片段需求,由上游統一提供較省事 | 本套件經驗二、三;以 `rollupCode(src, {formatIn:'mjs', formatOut:'iife'\|'es'\|'umd', targets:'old'})` 實測輸出(2026-11-10) |
| 2026-11-10 | 自有套件 | w-converws-client-webworker(本套件) | `src/webworker.mjs` 的 `error` 事件處理把含 WebSocket `Event` 之 `err` 原樣 `postMessage`,不可 structured clone,拋 `DataCloneError` 使 worker 崩潰,呼叫端收不到 `error` 系統訊息;建議只傳可複製之摘要(如訊息字串)。本輪規定不改 `src/`,待使用者裁示 | 對不存在之伺服器 init:舊、新產物皆 `DataCloneError: Cannot clone object of unsupported type.`;瀏覽器端依規範推測同樣無法複製(需實測確認) |
| 2026-11-10 | 自有套件 | w-converws-client-webworker(本套件) | 承接上一列(`DataCloneError`):**已修**。`sendMessage` 先照原資料 `postMessage`,拋例外才改送 `toCloneable` 摘要,摘要仍送不出則放棄不外拋(規則帳本 R7);`error` 事件資料形狀已寫入 README 與 `src/webcaller.mjs` JSDoc,並與非 worker 版對照。真實 Chromium 實測證實:修前 `Event object could not be cloned`、呼叫端收不到 `error`(瀏覽器中 worker 不結束,但訊息遺失);修後收到 `{ msg: 'websocket error', err: 'error' }` | 修前夾具(HEAD 之 `src/webworker.mjs` 與修前產物)跑現行測試檔 8 案紅;修後 `npm test` 33 passing;真瀏覽器探測見經驗七、九、state〈最近一次驗證〉 |
