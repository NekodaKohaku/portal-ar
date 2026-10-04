# Portal / 現實傳送門

正式網站：https://nekodakohaku.github.io/portal-ar/  
GitHub：https://github.com/NekodaKohaku/portal-ar

介面支援中文、English、日本語。預設 Auto 依瀏覽器／系統偏好語言決定，無對應語言時使用英文；手動選擇會保存在此裝置，可選 Auto 恢復跟隨系統。類型選單保留 Invite、Invite+、Friends、Friends+、Public 英文名稱，使用者輸入不翻譯。辨識圖頁沿用相同語言偏好。

上方五行文字沿傳送門的垂直軸轉向觀察者，不隨視角上下傾斜；門面保持放置時的方向。

純靜態網頁，可由 GitHub Pages 託管。選圖片、設定五行資訊與大小，按相機模式，再按 **Drop portal**。圖片只在裝置記憶體中處理，不上傳；重新整理會清除設定。

五行依序為世界名稱、創建者、伺服器編號與類型、目前／上限人數、30 秒倒數。這些資訊是手動設定，不向 VRChat 查詢。支援 Windows / Android / iOS 圖示選擇。Drop 前顯示虛線橢圓、中央圖示、地面圓環與指引軌跡；Drop 後顯示世界圖片、粒子和五行資訊，30 秒後播放關閉效果，接著可重新放置。

## 拍照與錄影

標記 AR、相機預覽和 3D 預覽都能拍照／錄影。拍照合成相機背景與 3D 物件，不包含按鈕。录影不含聲音，最長 2 分鐘；瀏覽器支援時使用 MP4，否則 WebM，會顯示預覽並提供下載／分享。iPhone 可在系統分享面板儲存到相簿，實際選項依 Safari 與系統而定。錄影會包含開門、倒數和關閉動畫。

WebXR 地面 AR 的相機背景由系統合成，這個版本未實作實驗性的 Raw Camera Access；該模式的網頁拍照／錄影按鈕停用，請使用手機截圖／螢幕錄影。不能把不包含相機背景的 WebGL 截圖當作完整 AR 照片。

## 裝置與模式

| 模式 | 使用方式 | 定位限制 |
| --- | --- | --- |
| iPhone / iPad 標記 AR | Safari 開啟 HTTPS 網址，允許相機；將 `marker.html` 的 Hiro 圖列印或顯示在另一台裝置，平放後對準完整邊框，按 Drop portal | 以辨識圖追蹤，圖必須持續可見；圖離開畫面時物件隱藏。不是無標記 ARKit 地面放置 |
| Android 地面 AR | 支援 ARCore 的裝置與 WebXR 瀏覽器；開啟 HTTPS，慢慢掃描水平面，定位圈出現後按 Drop portal | 依装置、瀏覽器、ARCore 支援與追蹤品質而定；程式會實際檢查 immersive-ar，無支援時按鈕停用 |
| 相機預覽 | 有相機的 HTTPS 瀏覽器 | 僅相機背景與螢幕上的傳送門，沒有空間追蹤 |

標記 AR 預設以辨識圖邊長為 1 個座標單位，因此顯示的是縮小模型：16 cm 的圖搭配 2.2 的高度設定，傳送門約 35 cm 高。高度的公尺數僅在 WebXR 中代表實際公尺。保持黑色邊框完整可見、光線充足且不要反光。標記 AR 和地面 AR 是不同的定位技術。

網頁是視覺體驗，沒有連接 VRChat 帳號，也不會進入 VRChat 世界或同步朋友位置。

觸控操作：3D 預覽單指拖曳旋轉、雙指縮放；桌面支援拖曳和滑鼠滾輪。相機預覽单指拖曳位置、雙指改變尺寸。標記 AR 使用移動手機改變視角，雙指調整尺寸；地面 AR 以移動手機掃描／觀看為主。

放置檢查：地面 AR 的 hit-test 法線必須接近向上，直立牆面不能作為放置面。這不代表檢查整個傳送門佔用空間：沒有牆壁碰撞、障礙物體積或深度遮擋，門面仍可能穿過附近牆壁。標記 AR 和普通相機預覽沒有空間碰撞判斷。

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

本機已建立 `main` 分支與網站提交；GitHub 目的地為 `NekodaKohaku/portal-ar`。本機已有 Git repository 時不要再次執行 `git init`。公開部署前請確認你有權發布所使用的 VRChat 素材。

## 素材來源與轉換

- `assets/portal-plane.json`：本機 `VRChat_Data/resources.assets`，Mesh `Circle`，path ID 893，轉為三角網格。
- `assets/portal-noise.png`：相同檔案的 Texture2D `noiseTexture`，path ID 679；由 `PortalRingMaterial` 的 `_PerlinNoiseTex` 引用。
- `assets/default-world.png`：Texture2D `PortalThumbnail`，path ID 806，僅用作選圖控制的縮圖。
- `assets/placement-outline.json`：sharedassets0 Mesh `Portal_Outline_GEO` 1031；原始虛線橢圓網格，5,226 個三角形。
- `assets/placement-cursor.json`、`holoport-valid.png`：Mesh `Holoport_Valid_Cursor_mesh` 1043、Texture `UI_Holoport_TEX_VALID` 470；`placement-icon.png` 是 Texture `PortalPlace_CenterIcon_VALID` 571。
- `assets/blue-spark.png`、`ember.png`：Texture IDs 726、620；由原始粒子材質引用。`effects-config.json` 由原始 ParticleSystem 49825、49833 解析產生，包括發射率、壽命、尺寸、速度、最大數量、形狀縮放。
- 原始 Blue Sparks：每秒 25 個，壽命 1.5 秒，速度 -0.25 至 -0.1，尺寸 0.04–0.08，上限 50。原始 Embers：每秒 12 個，壽命 1–2 秒，速度 -0.25 至 -0.2，尺寸 0.05，上限 20。WebGL 模擬沿用上述值與淡入淡出設定，但隨機序列與拉伸 billboard 尚未完整重現 Unity 實作。
- 平台圖示由 sharedassets0 的 Texture 681、421、592 匯出。標籤字型由 Font `NotoSans-Regular` 1409 與 `NotoSansCJK-JP-Regular` 1407 匯出並轉為 WOFF2；Noto 字型為 SIL OFL。
- 完整匯出清單在相鄰的 `extracted/inventory.json`，共有 105 個名稱含 portal 的物件，另有依賴的圓形網格、噪聲貼圖、shader 參考輸出。
- `tools/extract_portal.py`、`export_dependencies.py`、`convert_mesh.py` 可重現素材匯出與轉換。
- 原始 Shader 1237 的 LZ4 區塊已解壓，並以 Windows 官方 D3DDisassemble 反組譯出 16 組不同的 DXBC 程式。UnityPy 的一般匯出未處理此版本的 `m_PlayerSubPrograms`，因此一開始輸出只有屬性。`tools/disassemble_shader.py`、`inspect_shader.py` 保留可重現的解析路徑；原始 disassembly 和參數綁定保存在相鄰的 `extracted`。
- `portal-shader.js` 依非立體 `ps_4_0` 的運算轉寫，包括邊界距離、平滑邊框、圖片混合／視差、背景透明度、atan 多項式、噪聲光暈；`shader-parameters.json` 和 `ring-fx-parameters.json` 由兩個原始材質常數直接產生。噪聲採原本的 mirrored repeat 與 bilinear filtering。擴散環沿用原始 Circle 網格、Ring FX 材質參數和水平擺放。
- **尚未達到遊戲內 100% 一致**：開關過渡時間與縮放、弧線導引、地面外環仍有重建；粒子的隨機序列／拉伸 billboard、渲染色彩空間及全部變體尚未逐幀對照。沒有搬移所有傳送門皮膚。原始 DXBC 本身無法直接在 WebGL 執行。

## 第三方程式

Three.js 0.160.1、AR.js 3.4.7，以及 AR.js 的 Hiro pattern / image / camera calibration 都已保存本地，不依賴第三方 CDN 在執行時載入。第三方授權見 `vendor/*LICENSE.txt`。VRChat 素材來源標記不是再散布授權；本專案不替 VRChat 素材授予任何權利。

## 驗證狀態

2026-10-04 已依使用者提供的完整影片修正開關動畫：開門改為中心放大，關閉時先隱藏資訊，再垂直壓成細線；倒數補為兩位數。粒子改用隨模型尺寸縮放的 billboard 平面，白色粒子依投影後的速度方向旋轉。時間為 30 fps 影片的估計值，詳細觀測見 `REFERENCE-NOTES.md`。

- 已完成 JavaScript 語法檢查、桌面 Chrome 的 WebGL 顯示與名稱輸入檢查、本地資產與頁面回應檢查；390 × 844 手機視窗無橫向溢出。
- `verify-marker.html` 本機整合測試成功辨識 Hiro 圖並產生有效的 Three.js 定位矩陣；此測試檔不推送、不部署。
- 30 秒倒數結束後關閉、重新 Drop 已在桌面 Chrome 驗證；錄影產出可解碼的 838 × 872 影片（測試片段約 52 秒），拍照產出 PNG 預覽。
- 手機版畫面可用響應式布局；相機拒絕／無相機／AR 不支援等狀態有處理。
- 瀏覽器自動上傳測試被 Chrome 擴充功能的檔案 URL 存取設定擋住，未修改設定。
- 已上線 GitHub Pages，Actions 部署成功；正式 HTTPS 網站可載入。
- **尚未完成 iPhone / Android 實機相機與空間定位驗證。**

## 清理

所有專案、匯出、工具與相依套件都在 `my file` 內。先停止 `node tools/serve.cjs`（Ctrl+C），再刪除整個 `my file` 即可；未修改遊戲原始檔。
