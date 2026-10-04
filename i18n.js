const messages={
 '日本 · JP':['Japan · JP','日本 · JP'],
 '美國西部 · US West':['US West · USW','米国西部 · US West'],
 '美國東部 · US East':['US East · USE','米国東部 · US East'],
 '歐洲 · EU':['Europe · EU','ヨーロッパ · EU'],
 '地面 AR 使用實際公尺。':['Surface AR uses real-world meters.','平面ARのサイズは実際のメートル単位です。'],
 '地面 AR 只接受水平表面，不會偵測牆壁穿透或周圍障礙物。':['Surface AR accepts horizontal surfaces only; it does not detect walls or surrounding obstacles.','平面ARは水平面のみ対応し、壁や周囲の障害物を検出しません。'],
 '此裝置可使用 Android 地面 AR。':['This device supports Android surface AR.','この端末はAndroidの平面ARに対応しています。'],
 '此瀏覽器未提供地面 AR。請使用支援 ARCore 的 Android 手機，或相機預覽。':['Surface AR is unavailable. Use an ARCore-compatible Android phone, or camera preview.','平面ARを利用できません。ARCore対応のAndroid端末、またはカメラプレビューをご利用ください。'],
 '清除已保存圖片':['Clear saved image','保存した画像を削除'],
 '只保存最後一張圖片，新圖片會覆蓋舊圖片。':['Only the latest image is saved; a new image replaces the previous one.','最後の画像のみ保存され、新しい画像で上書きされます。'],
 '每次 Drop 使用隨機 5 位數':['Random 5-digit number on each Drop','Dropごとにランダムな5桁の番号'],
 '伺服器位置':['Server location','サーバー所在地'],
 '日本':['Japan','日本'],'美國':['United States','アメリカ'],'台灣':['Taiwan','台湾'],'德國':['Germany','ドイツ'],'法國':['France','フランス'],'義大利':['Italy','イタリア'],'荷蘭':['Netherlands','オランダ'],
 '已保存圖片':['Saved image','保存済み画像'],
 '已清除保存的圖片，下次開啟不會恢復。':['Saved image cleared. It will not be restored next time.','保存画像を削除しました。次回は復元されません。'],
 '無法清除保存的圖片，請重試。':['Could not clear the saved image. Please try again.','保存画像を削除できませんでした。もう一度お試しください。'],
 '此裝置無法記憶圖片，重新開啟時請再次選擇。':['This device could not remember the image. Please select it again next time.','この端末では画像を保存できません。次回もう一度選択してください。'],
 '用手指挪動預定位置，確認定位圈後按底部 Drop portal。地面 AR 拍照錄影請使用手機系統功能。':['Drag to choose a location, then press Drop portal below when the ring appears. Use system screenshots or recording for surface AR.','指で設置位置を動かし、リングを確認して下のDrop portalを押してください。平面ARの撮影は端末の機能をご利用ください。'],
 'Portal / 傳送門實驗室':['Portal / Portal Lab','Portal / ポータルラボ'],
 '選擇世界圖片，在現實中放置你的傳送門。支援 iPhone 標記 AR 與 Android WebXR。':['Choose a world image and place your portal in reality. Supports iPhone marker AR and Android WebXR.','ワールド画像を選んで現実にポータルを設置。iPhoneのマーカーARとAndroidのWebXRに対応。'],
 '傳送門實驗室':['Portal Lab','ポータルラボ'],
 '傳送門 3D 預覽':['Portal 3D preview','ポータルの3Dプレビュー'],
 '3D 預覽':['3D preview','3Dプレビュー'],'相機':['Camera','カメラ'],
 '拖曳旋轉 · 雙指縮放':['Drag to rotate · Pinch to zoom','ドラッグで回転・ピンチで拡大縮小'],
 '放下一個傳送門':['Drop a portal','ポータルを設置'],
 '選一張世界圖片，帶到現實中。':['Choose a world image and bring it into reality.','ワールドの画像を選んで、現実に置いてみよう。'],
 '目前世界圖片':['Current world image','現在のワールド画像'],
 '選擇世界圖片':['Choose world image','ワールド画像を選択'],
 'JPG、PNG、WebP · 圖片留在裝置上':['JPG, PNG, WebP · Images stay on your device','JPG・PNG・WebP · 画像は端末内で処理'],
 '世界名稱':['World name','ワールド名'],'輸入世界名稱':['Enter world name','ワールド名を入力'],
 '創建者名稱':['Creator name','制作者名'],'輸入創建者名稱':['Enter creator name','制作者名を入力'],
 '伺服器編號':['Instance ID','インスタンス番号'],'類型':['Access type','公開範囲'],
 '目前人數':['Current players','現在の人数'],'人數上限':['Capacity','定員'],
 '世界支援的平台':['Supported platforms','対応プラットフォーム'],
 '傳送門高度':['Portal height','ポータルの高さ'],
 '地面 AR 使用實際公尺；標記 AR 顯示縮小模型，大小取決於辨識圖尺寸。':['Surface AR uses metres; marker AR shows a miniature whose size depends on the marker.','平面ARはメートル単位です。マーカーARは縮小模型で、マーカーの大きさに依存します。'],
 '試放 · 30 秒':['Try drop · 30 sec','試しに設置・30秒'],
 '拍照':['Photo','写真'],'錄影':['Record','録画'],'停止錄影':['Stop recording','録画停止'],
 '開啟相機 · iPhone 標記 AR':['Open camera · iPhone marker AR','カメラを開く・iPhoneマーカーAR'],
 '將':['Place the',''],
 'Hiro 辨識圖':['Hiro marker','Hiroマーカー'],
 '列印或顯示在另一台螢幕，平放桌面／地面。看見定位後按 Drop portal；辨識圖需持續留在畫面中。':['on another screen or print it, then lay it flat on a table or floor. When detected, press Drop portal. Keep the marker visible.','を印刷するか別の画面に表示し、机や床に平置きしてください。認識後にDrop portalを押し、マーカーを画面内に保ってください。'],
 'Android · 掃描地面 AR':['Android · Surface AR','Android・平面AR'],
 '只使用相機預覽':['Camera preview only','カメラプレビューのみ'],
 '地面 AR 只接受水平表面，不會偵測牆壁穿透或周圍障礙物；標記 AR 不提供碰撞判斷。':['Surface AR accepts horizontal surfaces only. It does not detect wall penetration or nearby obstacles. Marker AR has no collision detection.','平面ARは水平面のみ設置できます。壁の貫通や周囲の障害物は検出しません。マーカーARに衝突判定はありません。'],
 '正在檢查裝置支援…':['Checking device support…','端末の対応状況を確認中…'],
 '正在載入傳送門…':['Loading portal…','ポータルを読み込み中…'],
 'VRChat 素材研究原型 · 非官方作品':['VRChat asset research prototype · Unofficial','VRChat素材の研究試作・非公式'],
 '正在開啟相機…':['Opening camera…','カメラを起動中…'],
 '結束相機':['Close camera','カメラを終了'],'結束':['Exit','終了'],
 '把相機對準辨識圖':['Point the camera at the marker','カメラをマーカーに向けてください'],
 '重新放置':['Reset placement','設置をリセット'],
 '你的傳送門':['Your portal','あなたのポータル'],
 '關閉媒體預覽':['Close media preview','プレビューを閉じる'],'關閉':['Close','閉じる'],
 '拍攝的傳送門':['Captured portal','撮影したポータル'],
 '可下載檔案，或分享並儲存到相簿。':['Download, or share and save to your photo library.','ダウンロードするか、共有して写真ライブラリに保存できます。'],
 '下載':['Download','ダウンロード'],'分享／儲存到相簿':['Share / Save','共有／保存'],
 '相機或 AR 權限未允許。請在瀏覽器的網站設定允許相機，再試一次。':['Camera or AR permission denied. Allow camera access in site settings and try again.','カメラまたはARの権限がありません。サイト設定でカメラを許可して再試行してください。'],
 '找不到可使用的相機。':['No camera found.','使用できるカメラがありません。'],
 '相機可能正被其他程式使用，請關閉後重試。':['The camera may be in use by another app. Close it and try again.','別のアプリがカメラを使用している可能性があります。終了して再試行してください。'],
 '此裝置不支援這個 AR 模式，請使用標記 AR 或相機預覽。':['This AR mode is unsupported. Use marker AR or camera preview.','このARモードは非対応です。マーカーARかカメラプレビューをご利用ください。'],
 '相機需要 HTTPS 網址或 localhost。請由 GitHub Pages 開啟。':['Camera access requires HTTPS or localhost. Open the GitHub Pages site.','カメラにはHTTPSまたはlocalhostが必要です。GitHub Pagesから開いてください。'],
 '相機預覽 · 無空間定位':['Camera preview · No spatial tracking','カメラプレビュー・空間追跡なし'],
 '按 Drop portal 顯示傳送門；單指拖曳位置，雙指縮放。此模式沒有空間定位。':['Press Drop portal. Drag to move, pinch to resize. This mode has no spatial tracking.','Drop portalで表示します。ドラッグで移動、ピンチでサイズ変更。このモードに空間追跡はありません。'],
 '正在準備標記辨識…':['Preparing marker tracking…','マーカー認識を準備中…'],
 '把 Hiro 圖平放，讓完整黑色邊框留在相機中。':['Lay the Hiro marker flat and keep its entire black border visible.','Hiroマーカーを平置きし、黒い枠全体をカメラに映してください。'],
 '尋找 Hiro 辨識圖':['Looking for Hiro marker','Hiroマーカーを探しています'],
 '慢慢移動手機，掃描地面':['Move your phone slowly to scan the floor','スマートフォンをゆっくり動かして床をスキャンしてください'],
 '出現定位圈後按 Drop portal。若沒有按鈕，輕點畫面放置；使用瀏覽器 AR 控制離開。 地面 AR 的拍照錄影請使用手機截圖／螢幕錄影。':['Press Drop portal when the ring appears, or tap to place if no button is shown. Exit using browser AR controls. Use system screenshots or screen recording for surface AR.','リングが現れたらDrop portalを押してください。ボタンがなければ画面をタップして設置します。ブラウザーのAR操作で終了します。平面ARの撮影は端末のスクリーンショット／画面録画をご利用ください。'],
 '傳送門已放置，30 秒後自動關閉。':['Portal placed. Closes automatically in 30 seconds.','設置しました。30秒後に自動で閉じます。'],
 '已放置 · 保持辨識圖在畫面中':['Placed · Keep marker visible','設置済み・マーカーを画面内に保ってください'],
 '已放置在地面':['Placed on surface','平面に設置済み'],
 '已放置 · 相機預覽':['Placed · Camera preview','設置済み・カメラプレビュー'],
 '繞著辨識圖觀看傳送門。辨識圖離開畫面時，傳送門會暫時隱藏。':['Move around the marker to view the portal. It hides while the marker is out of view.','マーカーの周囲からポータルを見られます。マーカーが画面外に出ると一時的に非表示になります。'],
 '可以移動手機，從不同角度觀看傳送門。':['Move your phone to view the portal from different angles.','スマートフォンを動かして、別の角度から見られます。'],
 '這個模式的傳送門固定在螢幕上。':['The portal is attached to the screen in this mode.','このモードではポータルは画面に固定されます。'],
 '掃描地面，重新定位':['Scan the floor to reposition','床をスキャンして再配置してください'],
 '已結束相機。可以更換圖片再放置。':['Camera closed. Choose another image or drop again.','カメラを終了しました。画像を変更して再設置できます。'],
 '請選擇 20 MB 以下的圖片。':['Choose an image under 20 MB.','20 MB以下の画像を選択してください。'],
 '請選 JPG、PNG 或 WebP 圖片。':['Choose a JPG, PNG or WebP image.','JPG、PNG、WebP画像を選択してください。'],
 '圖片已更新。可以開啟相機放置傳送門。':['Image updated. Open the camera to place your portal.','画像を更新しました。カメラを開いて設置できます。'],
 '已找到辨識圖 · 可以放置':['Marker detected · Ready to drop','マーカー認識済み・設置可能'],
 '已放置 · 標記定位中':['Placed · Marker tracking','設置済み・マーカー追跡中'],
 '辨識圖離開畫面 · 請重新對準':['Marker lost · Point at it again','マーカーが画面外です・もう一度映してください'],
 '水平表面可放置 · 未檢查周圍障礙物':['Horizontal surface found · Obstacles not checked','水平面に設置可能・周囲の障害物は未確認'],
 '此位置無有效水平表面 · 請掃描地面':['No valid horizontal surface · Scan the floor','有効な水平面がありません・床をスキャンしてください'],
 '拍照失敗，請再試一次。':['Photo capture failed. Try again.','撮影に失敗しました。再試行してください。'],
 '相機需要 HTTPS 或 localhost，請部署至 GitHub Pages 後開啟。':['Camera requires HTTPS or localhost. Open the deployed GitHub Pages site.','カメラにはHTTPSまたはlocalhostが必要です。公開済みのGitHub Pagesから開いてください。'],
 '此裝置可使用地面 AR，也可以使用標記 AR。':['Surface AR and marker AR are available.','平面ARとマーカーARが利用できます。'],
 '此瀏覽器未提供地面 AR。請使用標記 AR 或相機預覽。':['Surface AR is unavailable. Use marker AR or camera preview.','このブラウザーは平面AR非対応です。マーカーARかカメラプレビューをご利用ください。'],
 '傳送門已就緒，請選擇世界圖片。':['Portal ready. Choose a world image.','準備完了。ワールド画像を選択してください。'],
 '無法分享，請使用下載按鈕儲存檔案。':['Sharing unavailable. Use Download to save the file.','共有できません。ダウンロードで保存してください。'],
 '30 秒結束，傳送門已關閉。可以再次 Drop。':['30 seconds elapsed. Portal closed. You can drop again.','30秒が経過して閉じました。再び設置できます。'],
 '傳送門已關閉 · 可以重新放置':['Portal closed · Ready to drop again','ポータルを閉じました・再設置可能'],
 '此瀏覽器不支援網頁錄影，請使用手機螢幕錄影。':['Browser recording is unsupported. Use system screen recording.','ブラウザー録画は非対応です。端末の画面録画をご利用ください。'],
 '錄影沒有產生資料，請使用手機螢幕錄影。':['No recording data produced. Use system screen recording.','録画データがありません。端末の画面録画をご利用ください。'],
 '錄影中 · 無聲 · 再按一次停止':['Recording · No audio · Press again to stop','録画中・音声なし・もう一度押すと停止'],
 '錄影中（無聲），再按一次停止。最長 2 分鐘。':['Recording without audio. Press again to stop. Maximum 2 minutes.','音声なしで録画中。もう一度押すと停止します。最長2分です。'],
 '無法錄影，請使用手機螢幕錄影。':['Recording unavailable. Use system screen recording.','録画できません。端末の画面録画をご利用ください。'],
 '傳送門錄影':['Portal video','ポータル動画'],'傳送門照片':['Portal photo','ポータル写真'],
 '錄影不含聲音。下載後可在裝置上開啟，或分享並儲存到相簿。':['Videos have no audio. Download to play, or share and save to your library.','動画に音声はありません。ダウンロードして再生するか、共有して保存できます。'],
 '照片包含相機畫面與傳送門，不包含操作按鈕。':['Photos include the camera view and portal, without controls.','写真にはカメラ映像とポータルが入り、操作ボタンは入りません。'],
 'Hiro 辨識圖 · Portal':['Hiro marker · Portal','Hiroマーカー · Portal'],
 '列印這張圖，或在另一台裝置顯示。':['Print this marker or display it on another device.','印刷するか、別の端末に表示してください。'],
 '平放在桌面／地面，讓黑色邊框完整出現在相機中。':['Lay it flat on a table or floor and keep the entire black border visible.','机や床に平置きし、黒い枠全体をカメラに映してください。'],
 'Hiro AR 辨識圖':['Hiro AR marker','Hiro ARマーカー'],
 '傳送門會定位在辨識圖上。請維持辨識圖可見；離開畫面時傳送門會隱藏。標記模式是縮小模型，高度依圖的實際大小改變。':['The portal is anchored to this marker. Keep it visible; the portal hides when it leaves the view. Marker AR shows a miniature scaled to the physical marker size.','ポータルはマーカーに固定されます。画面外になると非表示になります。マーカーARは縮小模型で、高さはマーカーの実寸に依存します。'],
 '列印辨識圖':['Print marker','マーカーを印刷'],'返回傳送門':['Back to portal','ポータルに戻る'],'下載圖片':['Download image','画像をダウンロード'],
 'AR 元件載入失敗，請重新整理。':['AR library failed to load. Refresh the page.','ARライブラリを読み込めません。再読み込みしてください。'],
 '標記辨識載入逾時，請重新整理後再試。':['Marker tracking timed out. Refresh and try again.','マーカー認識の読み込みがタイムアウトしました。再読み込みしてください。'],
 '圖片無法讀取':['Cannot read image','画像を読み込めません'],
 '瀏覽器中止錄影':['Browser stopped recording','ブラウザーが録画を中止しました'],
};
export function systemLanguage(languages){
 for(const code of languages){if(/^zh\b/i.test(code))return 'zh';if(/^ja\b/i.test(code))return 'ja';if(/^en\b/i.test(code))return 'en';}
 return 'en';
}
let preference='auto';try{preference=localStorage.getItem('portal-language')||'auto';}catch{}
if(!['auto','zh','en','ja'].includes(preference))preference='auto';
let language=preference==='auto'?systemLanguage(navigator.languages||[navigator.language]):preference;
export function t(source){
 if(language==='zh')return source;
 if(messages[source])return messages[source][language==='en'?0:1];
 const patterns=[[/^無法啟動：(.*)$/s,'Unable to start: ','起動できません：'],[/^錄影失敗：(.*)$/s,'Recording failed: ','録画失敗：'],[/^無法錄影：(.*)$/s,'Unable to record: ','録画できません：'],[/^載入失敗：(.*)。請確認瀏覽器支援 WebGL，並由網站網址開啟。$/s,'Loading failed: ','読み込み失敗：']];
 for(const [pattern,en,ja] of patterns){const match=source.match(pattern);if(match)return (language==='en'?en:ja)+t(match[1]);}
 if(source.endsWith(' 載入失敗'))return source.slice(0,-5)+(language==='en'?' failed to load':' の読み込みに失敗しました');
 return source;
}
export function setText(element,source){element.dataset.i18nSource=source;element.textContent=t(source);}
const bindings=[];
export function initLanguages(){
 const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const node=walker.currentNode;const original=node.textContent;const source=original.trim();if(messages[source])bindings.push({node,source,original});}
 const attributes=[];
 document.querySelectorAll('[aria-label],[placeholder],[alt],meta[name="description"]').forEach(el=>{
  for(const name of ['aria-label','placeholder','alt','content']){const source=el.getAttribute(name);if(messages[source])attributes.push({el,name,source});}
 });
 const select=document.getElementById('language');select.value=preference;
 const apply=()=>{
  document.documentElement.lang={zh:'zh-Hant',en:'en',ja:'ja'}[language];
  bindings.forEach(({node,source,original})=>{if(node.isConnected)node.textContent=original.replace(source,t(source));});
  attributes.forEach(({el,name,source})=>el.setAttribute(name,t(source)));
  document.querySelectorAll('[data-i18n-source]').forEach(el=>el.textContent=t(el.dataset.i18nSource));
 };
 select.addEventListener('change',()=>{preference=select.value;language=preference==='auto'?systemLanguage(navigator.languages||[navigator.language]):preference;try{localStorage.setItem('portal-language',preference);}catch{}apply();});
 window.addEventListener('languagechange',()=>{if(preference==='auto'){language=systemLanguage(navigator.languages||[navigator.language]);apply();}});
 apply();
}
