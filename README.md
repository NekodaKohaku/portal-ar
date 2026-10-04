# Portal / 現實傳送門

純靜態網頁，可由 GitHub Pages 託管。選圖片、設定名稱與大小，按相機模式，再按 **Drop portal**。圖片只在裝置記憶體中處理，不上傳；重新整理會清除設定。

## 裝置與模式

| 模式 | 使用方式 | 定位限制 |
| --- | --- | --- |
| iPhone / iPad 標記 AR | Safari 開啟 HTTPS 網址，允許相機；將 `marker.html` 的 Hiro 圖列印或顯示在另一台裝置，平放後對準完整邊框，按 Drop portal | 以辨識圖追蹤，圖必須持續可見；圖離開畫面時物件隱藏。不是無標記 ARKit 地面放置 |
| Android 地面 AR | 支援 ARCore 的裝置與 WebXR 瀏覽器；開啟 HTTPS，慢慢掃描水平面，定位圈出現後按 Drop portal | 依装置、瀏覽器、ARCore 支援與追蹤品質而定；程式會實際檢查 immersive-ar，無支援時按鈕停用 |
| 相機預覽 | 有相機的 HTTPS 瀏覽器 | 僅相機背景與螢幕上的傳送門，沒有空間追蹤 |

標記 AR 預設以辨識圖邊長為 1 個座標單位，因此顯示的是縮小模型：16 cm 的圖搭配 2.2 的高度設定，傳送門約 35 cm 高。高度的公尺數僅在 WebXR 中代表實際公尺。保持黑色邊框完整可見、光線充足且不要反光。標記 AR 和地面 AR 是不同的定位技術。

網頁是視覺體驗，沒有連接 VRChat 帳號，也不會進入 VRChat 世界或同步朋友位置。

## 在這台電腦預覽

在 `my file` 執行：

```powershell
node tools/serve.cjs
```

開啟 `http://127.0.0.1:8766`。手機上的 localhost 是手機自己，不是電腦；手機相機測試請使用部署後的 HTTPS 網址。不要直接雙擊 HTML。

## 部署 GitHub Pages

把 **portal-web 資料夾的內容** 作為一個獨立 GitHub repository 的根目錄。不要上傳整個 VRChat 安裝目錄、`tools` 或 `extracted`。

1. GitHub 建立 repository，預設分支使用 `main`。
2. 登入 GitHub 後，將本資料夾內容推送至 repository。`.github/workflows/pages.yml` 必須一併推送；GitHub 網頁的拖曳上傳可能遺漏隱藏資料夾，建議使用 Git。
3. Repository → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
4. 在 Actions 執行 **Deploy Portal to GitHub Pages**，或再推送一次 `main`。
5. 工作流程成功後，從 Pages 開啟 HTTPS 網址，再用手機 Safari / Chrome 開啟。

可以使用：

```powershell
cd 'D:\Program Files (x86)\Steam\steamapps\common\VRChat\my file\portal-web'
git init -b main
git add .
git commit -m 'Create portal AR website'
gh auth login
gh repo create portal-ar --public --source . --remote origin --push
```

本次沒有建立或推送 GitHub repository，因為電腦的 `gh` 未登入；上述指令需在登入後自行執行。公開部署前請確認你有權發布所使用的 VRChat 素材。

## 素材來源與轉換

- `assets/portal-plane.json`：本機 `VRChat_Data/resources.assets`，Mesh `Circle`，path ID 893，轉為三角網格。
- `assets/portal-noise.png`：相同檔案的 Texture2D `noiseTexture`，path ID 679；由 `PortalRingMaterial` 的 `_PerlinNoiseTex` 引用。
- `assets/default-world.png`：Texture2D `PortalThumbnail`，path ID 806，僅用作選圖控制的縮圖。
- 完整匯出清單在相鄰的 `extracted/inventory.json`，共有 105 個名稱含 portal 的物件，另有依賴的圓形網格、噪聲貼圖、shader 參考輸出。
- `tools/extract_portal.py`、`export_dependencies.py`、`convert_mesh.py` 可重現素材匯出與轉換。
- Unity shader 匯出只有屬性／編譯資訊，不能直接執行於 WebGL；網頁中的藍色環、噪聲動畫與粒子是重新實作的近似效果，沒有完整搬移遊戲粒子系統或所有傳送門皮膚。

## 第三方程式

Three.js 0.160.1、AR.js 3.4.7，以及 AR.js 的 Hiro pattern / image / camera calibration 都已保存本地，不依賴第三方 CDN 在執行時載入。第三方授權見 `vendor/*LICENSE.txt`。VRChat 素材來源標記不是再散布授權；本專案不替 VRChat 素材授予任何權利。

## 驗證狀態

- 已完成 JavaScript 語法檢查、桌面 Chrome 的 WebGL 顯示與名稱輸入檢查、本地資產與頁面回應檢查；390 × 844 手機視窗無橫向溢出。
- `verify-marker.html` 本機整合測試成功辨識 Hiro 圖並產生有效的 Three.js 定位矩陣；此測試檔不推送、不部署。
- 手機版畫面可用響應式布局；相機拒絕／無相機／AR 不支援等狀態有處理。
- 瀏覽器自動上傳測試被 Chrome 擴充功能的檔案 URL 存取設定擋住，未修改設定。
- **尚未完成 iPhone / Android 實機相機與空間定位驗證，也尚未上線 GitHub Pages。**

## 清理

所有專案、匯出、工具與相依套件都在 `my file` 內。先停止 `node tools/serve.cjs`（Ctrl+C），再刪除整個 `my file` 即可；未修改遊戲原始檔。
