# 經驗(experience)

執行時累積之經驗,留給後續嘗試、執行、判斷。2026-11-10 建立。

## 一、舊建置之 ES5 轉譯對整份合併檔沒有實益

舊 `gMergeWorker.mjs` 以 `@babel/preset-env`(未給 targets,等同全部轉 ES5)處理 `src/webworker.mjs`,產出 ES5 語法之 worker 段(約 1.2KB)。但合併檔另兩段中,`srcTemp/WConverwsClient.iife.js` 由 `w-package-tools` 以 `defaults` targets 產出,內含物件展開(`{...x}`,ES2018)、`let`、箭頭函式、樣板字串、`for-of`,故**整份合併檔最低語法等級本來就是 ES2018**,不支援 IE11 與更舊瀏覽器。把 worker 段改為只壓縮(語法 ES2015)不會讓任何原本能解析合併檔之瀏覽器失效。日後若真要支援更舊環境,須先處理 iife 段來源(`toolg/gDistRollupIIFE.mjs` 之 `targets`),只轉譯 worker 段沒有用。

## 二、terser 以字元頻率排短名,換 b64 就換變數名排列

`dist/*.umd.js` 內嵌 b64 字串;terser 的縮短名稱依整份輸出之字元頻率排序(含字串內容),故 worker 段一變,dist 內 `R`/`S`、`T`/`v` 等縮短名稱之排列隨之改變,`.map` 之個別映射亦變。比對新舊 dist 時,以新 b64 換回舊 b64 後仍不會逐位元組相同,屬正常;判斷等價改用「載入 dist 後建立 Worker 所用程式碼等於合併碼」(`unit-mergeWorker`)。

## 三、驗證「不依賴 Babel」的作法

以 `node --import` 載入一個攔截模組:ESM 用 `module.register` 的 resolve hook、CJS 另改 `Module._resolveFilename`,凡 `@babel/`、`babel-`、`core-js` 開頭之解析一律拋錯。新腳本在此環境仍成功且產物與一般執行逐位元組相同;舊腳本在此環境於載入 `@babel/core` 時即失敗(正向對照)。這比「在 Babel 8 安裝下跑一次」更強,因為與 Babel 版本無關。

## 四、在 Node 以 `worker_threads` 模擬 Web Worker 測合併碼

合併碼為 classic script,需 `self`、`postMessage`、`onmessage`;`w-converws` 的用戶端以 `typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope` 判斷處於 Web Worker 而改用 `self.WebSocket`(否則找 Node 的 `ws` 套件)。故前置碼須補:`globalThis.self = globalThis`、`globalThis.postMessage` 轉 `parentPort.postMessage`、`globalThis.WorkerGlobalScope`(類別,`Symbol.hasInstance` 回 `o === globalThis`)、並把 `parentPort` 訊息轉為 `onmessage({data})`。Node 24 之 worker thread 內有全域 `WebSocket`。以 `new Worker(code, { eval: true })` 載入時,頂層 `let` 屬 script 範圍,近似瀏覽器 classic worker。

## 五、測試用 `WConverwsServer` 之注意

- 建構後才非同步開始監聽,且沒有 close API:放在獨立 `worker_threads`,測完 `terminate()` 以免殘留監聽;就緒以 TCP 探測(事件驅動重試,不用固定延時)確認後才讓用戶端 init,否則連線被拒,觸發 `src/webworker.mjs` 的 `error` 處理;該處理在 2026-11-10 前會因 `DataCloneError` 使 worker 崩潰(已修,見規則帳本 R7 與本檔七)。
- 埠由作業系統配發(`listen(0)` 取得後釋放),同套件測試依序執行不會相撞。

## 六、執行 `script.txt` 列時

`./node_modules/.bin/jsdoc -c .jsdoc` 若經 `cmd.exe` 執行會報「'.' 不是內部或外部命令」(路徑以 `./` 開頭);等價寫法 `node ./node_modules/jsdoc/jsdoc.js -c .jsdoc`。這是呼叫方式問題,非產物問題。

## 七、worker 回傳資料之 `DataCloneError`:瀏覽器與 Node 之差異,及測試如何模擬

- 連不上伺服器時,`w-converws-client` 於 Web Worker 內以 `{ msg: 'websocket error', err: <WebSocket 之 Event> }` 通報 `error`;`Event` 是平台物件,`postMessage` 不能複製。真實 Chromium 實測:拋 `Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope': Event object could not be cloned`,**worker 不會結束**(瀏覽器中 worker 內未捕捉之例外只觸發頁面端 `error`),但該則 `error` 訊息遺失,呼叫端收不到事件(且每次重連再丟一次);Node 的 `worker_threads` 則是未捕捉例外使 worker 結束。兩者共通的後果:呼叫端收不到 `error`。
- 測試不可用全域 `structuredClone` 模擬 `postMessage`:Node 的 `structuredClone(new Event('x'))` 回 `{}` 而不拋錯,與真實 `postMessage` 不同;改用 `worker_threads` 的 `MessageChannel`(`port1.postMessage` 拋 `DataCloneError`,`receiveMessageOnPort(port2)` 取複製結果)。「不可複製」之觸發值用真實的 WebSocket 錯誤事件(Node 全域 `WebSocket` 連至無人監聽之埠取得;單純 `new Event()` 在 Node 可複製,不具代表性),並以前提案確認它確實不可複製。
- 以 `vm` 載入 `src/webworker.mjs` 時,被測碼內之 `Error` 是沙箱領域之 `Error`;測試要構造「`instanceof Error` 成立」之物件,須在沙箱內以 `vm.runInContext('new RangeError(...)', sandbox)` 建立,從主領域傳入之 `Error` 不成立。純物件判斷改用 `Object.prototype.toString`(跨領域有效)。

## 八、`toCloneable` 取捨:只在失敗時轉換,範圍限於實際會送出之形狀

第一版(122 行)對每則 `error` 訊息恆轉換,並處理循環參照、`Map`/`Set`、getter 拋錯、`__proto__`、跨領域等;主控複審認為對需求過度泛化。精簡版(約 40 行)改為:正常路徑原樣 `postMessage`,僅其拋例外時才轉換(`Event`→`type`、`Error`→`message`、函數→`'[Function]'`、其餘→`String(值)`,陣列與純物件逐欄遞迴,10 層為限,以 `Object.create(null)` 承接使 `__proto__` 鍵如一般鍵)。代價:**可複製之 `Error` 不轉換**,故 `err` 在支援複製 `Error` 之瀏覽器為 `Error` 物件、否則為其 `message` 字串(已寫入 JSDoc 與 README);`Date`、`Map` 等僅在整則訊息已不可複製時才被轉成字串,因為實際會送出之資料(伺服器 JSON 與 `{ msg, err }`)本來就不含這些型別。

## 九、在真瀏覽器驗證之作法(不新增依賴)

本套件無 e2e、`devDependencies` 無瀏覽器套件。探測腳本(放 `./tmp/`)可借用兄弟套件已安裝之 `playwright-core`(以絕對路徑 `import`,不寫進本套件 `package.json`)與本機已下載之 headless Chromium,起一個 `http` 伺服器提供頁面與 `dist/*.umd.js`、一個 `w-converws` 伺服器,頁面以 `page.evaluate` 建立 `window['w-converws-client-webworker']` 後監聽事件;以 `page.on('pageerror')` 擷取 worker 內未捕捉之例外。headless 不開視窗。
