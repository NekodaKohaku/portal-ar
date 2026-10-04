import * as THREE from './vendor/three.module.js';
import {createEmitters,updateEmitters} from './effects.js';
import {vertexShader,fragmentShader} from './portal-shader.js';
const $ = id => document.getElementById(id);
const status = message => { $('status').textContent = message; };
const arStatus = message => { $('ar-status').textContent = message; };
let renderer, scene, camera, portal, surface, worldTexture, stream, xrSession, hitSource;
let arSource, arContext, markerRoot, markerControls, reticle, grid;
let mode = 'preview', placed = false, busy = false, xrSupported = false, ready = false;
let markerReady = false, generation = 0, resizeObserver;
let droppedAt=null,lastCountdown=30,burst=0,emitters=[],placementGuide,guideArrows=[],armed=true,expandingRing,ringUniforms;
let recorder=null,recordingStream=null,recordChunks=[],recordStarted=0,recordWidth=0,recordHeight=0;
let savedMedia=null,mediaUrl=null,captureFrameRequested=false;
const captureCanvas=document.createElement('canvas');const captureContext=captureCanvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const portalFont='"PortalText", "PortalCJK", sans-serif';
const startButtons = ['start-marker','start-xr','start-camera'];
const noise = new THREE.TextureLoader().load('./assets/portal-noise.png');
noise.wrapS = noise.wrapT = THREE.MirroredRepeatWrapping;noise.generateMipmaps=false;noise.minFilter=THREE.LinearFilter;
const uniforms = { time: { value: 0 }, picture: { value: null }, noiseMap: { value: noise },globals:{value:[]},ratio:{value:1.432},localCamera:{value:new THREE.Vector3()},flash:{value:0} };

function makeLabel() {
  const c=document.createElement('canvas');c.width=1024;c.height=600;
  const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const capacity=Math.max(1,Math.min(999,Number($('capacity').value)||32));
  const occupancy=Math.max(0,Math.min(capacity,Number($('occupancy').value)||0));
  const access=$('access').value;const rows=[$('world').value.trim()||'My world',$('creator').value.trim()||'Your name',`#${$('instance').value.trim()||'15247'}  ${access}`,`${occupancy} / ${capacity}`,String(lastCountdown)];
  rows.forEach((text,i)=>{
    let font=i===4?88:68;ctx.font=`${i===4?'700':'400'} ${font}px ${portalFont}`;
    while(ctx.measureText(text).width>880 && font>24){ctx.font=`${i===4?'700':'400'} ${--font}px ${portalFont}`;}
    const y=64+i*113;ctx.strokeStyle='#123260b0';ctx.lineWidth=6;ctx.strokeText(text,512,y);ctx.fillStyle='#f4f8ff';ctx.fillText(text,512,y);
    if(i===2){const x=512-ctx.measureText(text).width/2-36;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.fill();ctx.fillStyle=access==='Public'?'#26bb7d':access.startsWith('Invite')?'#bd1846':'#eea236';ctx.beginPath();ctx.arc(x,y,16,0,Math.PI*2);ctx.fill();}
  });
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function refreshLabel() {
  if (!portal) return;
  const label=portal.getObjectByName('label');const old=label.material.map;
  label.material.map=makeLabel();old?.dispose();label.material.needsUpdate=true;
}
function resize() {
  if(!renderer || renderer.xr.isPresenting)return;
  const active=mode!=='preview';const box=$('viewport').getBoundingClientRect();
  const w=active?innerWidth:box.width,h=active?innerHeight:box.height;
  renderer.setSize(w,h);
  if(mode==='marker' && arSource?.ready){
    arSource.onResizeElement();arSource.copyElementSizeTo(renderer.domElement);
    if(arContext?.arController)arSource.copyElementSizeTo(arContext.arController.canvas);
    // Match the drawing-buffer aspect to the source before CSS crops it to the screen.
    const sourceWidth=parseFloat(arSource.domElement.style.width),sourceHeight=parseFloat(arSource.domElement.style.height);
    if(sourceWidth && sourceHeight)renderer.setSize(sourceWidth,sourceHeight,false);
  } else {renderer.domElement.style.marginLeft='0px';renderer.domElement.style.marginTop='0px';camera.aspect=w/h;camera.updateProjectionMatrix();}
}
function setMode(next) {
  mode=next;document.body.classList.toggle('ar-active',next!=='preview');
  $('ar-hud').hidden=next==='preview';$('mode').textContent=next==='preview'?'3D 預覽':'相機';
  grid.visible=next==='preview';scene.background=null;renderer.setClearColor(0x000000,0);
  placed=false;armed=true;droppedAt=null;lastCountdown=30;refreshLabel();markerReady=false;$('drop').disabled=next!=='camera';
  $('preview-drop').disabled=!ready;portal.getObjectByName('shape').scale.setScalar(Number($('size').value)/2.2);
  const captureSupported=next!=='xr';['photo','record'].forEach(id=>$(id).disabled=!captureSupported);
  $('reset').disabled=true;
  if(next==='preview'){
    scene.add(portal);portal.position.set(0,0,0);portal.rotation.set(0,0,0);portal.visible=true;
    portal.scale.setScalar(1);camera.position.set(0,1.5,5.8);camera.lookAt(0,1.5,0);
  } else if(next==='camera'){
    scene.add(portal);portal.position.set(0,0,-4.5);portal.rotation.set(0,0,0);portal.scale.setScalar(1);portal.visible=true;
    camera.position.set(0,1.65,0);camera.rotation.set(0,0,0);
  } else {portal.visible=false;}
  resize();
}
function friendlyError(error) {
  if(error.name==='NotAllowedError')return '相機或 AR 權限未允許。請在瀏覽器的網站設定允許相機，再試一次。';
  if(error.name==='NotFoundError')return '找不到可使用的相機。';
  if(error.name==='NotReadableError')return '相機可能正被其他程式使用，請關閉後重試。';
  if(error.name==='NotSupportedError')return '此裝置不支援這個 AR 模式，請使用標記 AR 或相機預覽。';
  return `無法啟動：${error.message || error}`;
}
async function begin(action) {
  if(busy || !ready || mode!=='preview')return;
  if(!isSecureContext){status('相機需要 HTTPS 網址或 localhost。請由 GitHub Pages 開啟。');return;}
  busy=true;startButtons.forEach(id=>$(id).disabled=true);status('正在開啟相機…');
  try {await action();}catch(error){await stop();status(friendlyError(error));}
  finally{busy=false;startButtons.forEach(id=>$(id).disabled=!ready);$('start-xr').disabled=!xrSupported;}
}
async function startCamera() {
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
  const video=$('camera');video.srcObject=stream;video.hidden=false;await video.play();
  setMode('camera');arStatus('相機預覽 · 無空間定位');
  $('ar-help').textContent='按 Drop portal 顯示傳送門；它會跟著畫面移動。';
}
let arLibrary;
function loadARLibrary() {
  if(arLibrary)return arLibrary;
  window.THREE=THREE;
  arLibrary=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='./vendor/ar-threex.js';
    script.onload=resolve;script.onerror=()=>reject(new Error('AR 元件載入失敗，請重新整理。'));document.head.appendChild(script);
  }).catch(e=>{arLibrary=null;throw e;});
  return arLibrary;
}
async function startMarker() {
  await loadARLibrary();
  const epoch=++generation;
  // Acquire the stream here so permission errors and cancellation are controlled by this app.
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
  if(epoch!==generation){stream.getTracks().forEach(t=>t.stop());return;}
  const video=$('camera');video.srcObject=stream;video.hidden=false;await video.play();
  setMode('marker');video.classList.add('marker-video');
  arStatus('正在準備標記辨識…');$('ar-help').textContent='把 Hiro 圖平放，讓完整黑色邊框留在相機中。';
  // ArToolkitSource uses its own stream acquisition. Supply the already authorized video instead.
  arSource=new window.THREEx.ArToolkitSource({sourceType:'webcam',sourceWidth:1280,sourceHeight:720});
  arSource.domElement=video;arSource.ready=true;
  arContext=new window.THREEx.ArToolkitContext({cameraParametersUrl:'./assets/camera_para.dat',detectionMode:'mono',canvasWidth:640,canvasHeight:480,maxDetectionRate:30});
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('標記辨識載入逾時，請重新整理後再試。')),20000);
    arContext.init(()=>{clearTimeout(timeout);resolve();});
  });
  if(epoch!==generation)return;
  camera.position.set(0,0,0);camera.rotation.set(0,0,0);camera.projectionMatrix.copy(arContext.getProjectionMatrix());
  markerRoot=new THREE.Group();scene.add(markerRoot);
  markerControls=new window.THREEx.ArMarkerControls(arContext,markerRoot,{type:'pattern',patternUrl:'./assets/patt.hiro',size:1,changeMatrixMode:'modelViewMatrix'});
  markerRoot.add(portal);portal.position.set(0,0,0);portal.rotation.set(0,0,0);
  // A standard 16 cm printed marker yields a miniature portal about 35 cm tall.
  portal.scale.setScalar(1);resize();arStatus('尋找 Hiro 辨識圖');
}
async function startXR() {
  if(!xrSupported)throw new DOMException('WebXR AR unavailable','NotSupportedError');
  xrSession=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['dom-overlay'],domOverlay:{root:$('ar-hud')}});
  const session=xrSession;
  session.addEventListener('end',()=>{if(xrSession===session){xrSession=null;stop();}},{once:true});
  setMode('xr');scene.add(portal);portal.scale.setScalar(1);renderer.xr.setReferenceSpaceType('local');
  await renderer.xr.setSession(session);
  const viewer=await session.requestReferenceSpace('viewer');hitSource=await session.requestHitTestSource({space:viewer});
  session.addEventListener('select',()=>{if(!session.domOverlayState)drop();});
  arStatus('慢慢移動手機，掃描地面');$('ar-help').textContent='出現定位圈後按 Drop portal。若沒有按鈕，輕點畫面放置；使用瀏覽器 AR 控制離開。';
  $('ar-help').textContent+=' 地面 AR 的拍照錄影請使用手機截圖／螢幕錄影。';
}
function drop() {
  if(placed)return;
  if(mode==='xr'){
    if(!reticle.visible)return;
    const p=new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
    portal.position.copy(p);
    const c=new THREE.Vector3();renderer.xr.getCamera().getWorldPosition(c);
    portal.rotation.set(0,Math.atan2(c.x-p.x,c.z-p.z),0);
    reticle.visible=false;
  }else if(mode==='marker' && !markerReady)return;
  placed=true;armed=false;droppedAt=performance.now();lastCountdown=30;refreshLabel();portal.visible=true;$('drop').disabled=true;$('reset').disabled=false;$('preview-drop').disabled=true;
  if(mode==='preview'){camera.position.set(0,1.75,5.8);camera.lookAt(0,1.75,0);status('傳送門已放置，30 秒後自動關閉。');}
  arStatus(mode==='marker'?'已放置 · 保持辨識圖在畫面中':mode==='xr'?'已放置在地面':'已放置 · 相機預覽');
  $('ar-help').textContent=mode==='marker'?'繞著辨識圖觀看傳送門。辨識圖離開畫面時，傳送門會暫時隱藏。':mode==='xr'?'可以移動手機，從不同角度觀看傳送門。':'這個模式的傳送門固定在螢幕上。';
}
function resetPlacement() {
  placed=false;armed=true;droppedAt=null;lastCountdown=30;refreshLabel();portal.visible=mode==='camera'||mode==='preview';portal.getObjectByName('shape').scale.setScalar(Number($('size').value)/2.2);$('drop').disabled=mode!=='camera';$('reset').disabled=true;$('preview-drop').disabled=false;
  arStatus(mode==='marker'?'尋找 Hiro 辨識圖':mode==='xr'?'掃描地面，重新定位':'相機預覽 · 無空間定位');
}
async function stop() {
  if(recorder?.state==='recording')finishRecording();
  ++generation;
  const session=xrSession;xrSession=null;
  hitSource?.cancel();hitSource=null;
  if(session){try{await session.end();}catch{}}
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  const v=$('camera');v.pause();v.srcObject=null;v.hidden=true;v.classList.remove('marker-video');v.removeAttribute('style');
  markerControls?.dispose?.();markerControls=null;
  arContext?.arController?.dispose?.();arContext=null;arSource=null;
  if(markerRoot){scene.add(portal);scene.remove(markerRoot);markerRoot=null;}
  reticle.visible=false;setMode('preview');status('已結束相機。可以更換圖片再放置。');
}
async function chooseImage(file) {
  if(!file)return;
  if(file.size>20*1024*1024){status('請選擇 20 MB 以下的圖片。');return;}
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)){status('請選 JPG、PNG 或 WebP 圖片。');return;}
  const url=URL.createObjectURL(file);const img=new Image();
  try{
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('圖片無法讀取'));img.src=url;});
    const canvas=document.createElement('canvas');const scale=Math.min(1,2048/Math.max(img.width,img.height));
    canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.NoColorSpace;
    worldTexture?.dispose();worldTexture=texture;uniforms.picture.value=texture;uniforms.globals.value[2].set(1/canvas.width,1/canvas.height,canvas.width,canvas.height);uniforms.globals.value[3].w=1;
    $('thumbnail').src=canvas.toDataURL('image/jpeg',.75);$('filename').textContent=file.name;
    status('圖片已更新。可以開啟相機放置傳送門。');
  }catch(e){status(e.message);}finally{URL.revokeObjectURL(url);$('image').value='';}
}
async function init() {
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.xr.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;$('viewport').appendChild(renderer.domElement);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.01,100);
    const [mesh,outline,cursor,config,registers,fxRegisters]=await Promise.all(['portal-plane.json','placement-outline.json','placement-cursor.json','effects-config.json','shader-parameters.json','ring-fx-parameters.json'].map(async name=>{const r=await fetch(`./assets/${name}`);if(!r.ok)throw new Error(`${name} 載入失敗`);return r.json();}));
    uniforms.globals.value=registers.map(values=>new THREE.Vector4(...values));
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(mesh.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(mesh.uvs,2));
    worldTexture=makeLabel('選擇世界圖片');uniforms.picture.value=worldTexture;
    portal=new THREE.Group();const shape=new THREE.Group();shape.name='shape';portal.add(shape);
    surface=new THREE.Mesh(geometry,new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
    surface.position.y=1.1;surface.scale.set(1.1,1.1*.518576979637146/.742755115032196,1);surface.rotation.z=-Math.PI/2;shape.add(surface);
    ringUniforms={time:{value:0},picture:uniforms.picture,noiseMap:uniforms.noiseMap,globals:{value:fxRegisters.map(v=>new THREE.Vector4(...v))},ratio:{value:1},localCamera:{value:new THREE.Vector3(0,0,3)},flash:{value:0}};
    expandingRing=new THREE.Mesh(geometry,new THREE.ShaderMaterial({uniforms:ringUniforms,vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,depthWrite:false}));expandingRing.rotation.x=-Math.PI/2;expandingRing.position.y=1.1;shape.add(expandingRing);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.05),new THREE.MeshBasicMaterial({map:makeLabel(),transparent:true,side:THREE.DoubleSide,depthWrite:false}));
    label.name='label';label.position.set(0,2.9,.025);shape.add(label);
    for(const [index,name,color] of [[0,'windows',0x00aaff],[1,'android',0x20bf6a],[2,'apple',0xbac7d8]]){
      const map=new THREE.TextureLoader().load(`./assets/platform-${name}.png`);const icon=new THREE.Mesh(new THREE.PlaneGeometry(.24,.24),new THREE.MeshBasicMaterial({map,color,transparent:true,side:THREE.DoubleSide,depthWrite:false}));icon.position.set(.87+index*.29,2.08,.03);icon.name=`platform-${name}`;shape.add(icon);
    }
    emitters=createEmitters(config,shape);
    placementGuide=new THREE.Group();placementGuide.name='placement';portal.add(placementGuide);
    const geoFrom=data=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uvs,2));g.computeBoundingBox();return g;};
    const outlineGeo=geoFrom(outline);const dashed=new THREE.Mesh(outlineGeo,new THREE.MeshBasicMaterial({color:0x00aaf1,side:THREE.DoubleSide}));
    const bounds=outlineGeo.boundingBox;dashed.scale.setScalar(2.2/(bounds.max.y-bounds.min.y));dashed.position.y=-bounds.min.y*dashed.scale.y;placementGuide.add(dashed);
    const iconTex=new THREE.TextureLoader().load('./assets/placement-icon.png');iconTex.colorSpace=THREE.SRGBColorSpace;
    const icon=new THREE.Mesh(new THREE.PlaneGeometry(.75,.75),new THREE.MeshBasicMaterial({map:iconTex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));icon.position.set(0,1.1,.01);icon.scale.x=-1;placementGuide.add(icon);
    const floor=new THREE.Mesh(new THREE.RingGeometry(1.25,1.28,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x00aaff,transparent:true,opacity:.9,side:THREE.DoubleSide}));floor.position.y=.002;placementGuide.add(floor);
    const cursorTex=new THREE.TextureLoader().load('./assets/holoport-valid.png');const cursorMesh=new THREE.Mesh(geoFrom(cursor),new THREE.MeshBasicMaterial({map:cursorTex,transparent:true,side:THREE.DoubleSide}));cursorMesh.position.y=.04;placementGuide.add(cursorMesh);
    const arrowGeo=new THREE.BufferGeometry();arrowGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,.055,.035,0,.055,0,0,-.055],3));
    for(let i=0;i<35;i++){const arrow=new THREE.Mesh(arrowGeo,new THREE.MeshBasicMaterial({color:0x00aaff,side:THREE.DoubleSide,transparent:true,opacity:.85}));placementGuide.add(arrow);guideArrows.push(arrow);}
    grid=new THREE.GridHelper(16,32,0x274e77,0x162a43);grid.position.y=-.015;scene.add(grid);
    reticle=new THREE.Mesh(new THREE.RingGeometry(.13,.16,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x8bd1ff,side:THREE.DoubleSide}));reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
    setMode('preview');resizeObserver=new ResizeObserver(resize);resizeObserver.observe($('stage'));window.addEventListener('resize',resize);
    renderer.setAnimationLoop((time,frame)=>{
      uniforms.time.value=reducedMotion?0:time*.001;
      updatePortal(performance.now());
      if(mode==='marker' && arSource?.ready && arContext?.arController && markerRoot){
        arContext.update(arSource.domElement);markerReady=markerRoot.visible;
        portal.visible=(placed||armed) && markerReady;$('drop').disabled=placed || !markerReady;
        if(!placed)arStatus(markerReady?'已找到辨識圖 · 可以放置':'尋找 Hiro 辨識圖');
        else arStatus(markerReady?'已放置 · 標記定位中':'辨識圖離開畫面 · 請重新對準');
      }
      if(mode==='xr' && frame && hitSource && !placed){
        const hits=frame.getHitTestResults(hitSource);reticle.visible=false;
        if(hits.length){const pose=hits[0].getPose(renderer.xr.getReferenceSpace());if(pose){
          reticle.matrix.fromArray(pose.transform.matrix);
          // Only place on horizontal surfaces, so the upright portal stands on the floor/table.
          reticle.visible=reticle.matrix.elements[5]>.85;
        }}
        $('drop').disabled=!reticle.visible;
        if(reticle.visible){const p=new THREE.Vector3().setFromMatrixPosition(reticle.matrix);portal.position.copy(p);const c=new THREE.Vector3();renderer.xr.getCamera().getWorldPosition(c);portal.rotation.set(0,Math.atan2(c.x-p.x,c.z-p.z),0);portal.visible=armed;}
        else portal.visible=false;
        arStatus(reticle.visible?'已找到平面 · 可以放置':'慢慢移動手機，掃描水平地面');
      }
      renderer.render(scene,camera);
      if((recorder?.state==='recording'||captureFrameRequested) && mode!=='xr')composeCapture();
      if(captureFrameRequested){captureFrameRequested=false;captureCanvas.toBlob(blob=>{if(blob)showMedia(blob,'image/png');else status('拍照失敗，請再試一次。');},'image/png');}
      if(recorder?.state==='recording' && performance.now()-recordStarted>120000)finishRecording();
    });
    ready=true;
    document.fonts.load(`400 68px ${portalFont}`,$('world').value+$('creator').value).then(refreshLabel).catch(()=>{});
    ['preview-drop','preview-photo','preview-record'].forEach(id=>$(id).disabled=false);
    if(navigator.xr && isSecureContext){try{xrSupported=await navigator.xr.isSessionSupported('immersive-ar');}catch{}}
    startButtons.forEach(id=>$(id).disabled=false);$('start-xr').disabled=!xrSupported;
    if(!navigator.mediaDevices?.getUserMedia || !isSecureContext){$('start-marker').disabled=$('start-camera').disabled=true;$('support').textContent='相機需要 HTTPS 或 localhost，請部署至 GitHub Pages 後開啟。';}
    else $('support').textContent=xrSupported?'此裝置可使用地面 AR，也可以使用標記 AR。':'此瀏覽器未提供地面 AR。請使用標記 AR 或相機預覽。';
    status('傳送門已就緒，請選擇世界圖片。');
  }catch(e){status(`載入失敗：${e.message}。請確認瀏覽器支援 WebGL，並由網站網址開啟。`);}
}
$('image').addEventListener('change',e=>chooseImage(e.target.files[0]));['world','creator','instance','access','occupancy','capacity'].forEach(id=>$(id).addEventListener('input',()=>{refreshLabel();if(id==='world'||id==='creator')document.fonts.load(`400 68px ${portalFont}`,$('world').value+$('creator').value).then(refreshLabel).catch(()=>{});}));
$('size').addEventListener('input',()=>{const height=Number($('size').value);$('size-value').textContent=`${height.toFixed(1)} m`;portal?.getObjectByName('shape').scale.setScalar(height/2.2);});
$('start-camera').addEventListener('click',()=>begin(startCamera));$('start-marker').addEventListener('click',()=>begin(startMarker));$('start-xr').addEventListener('click',()=>begin(startXR));
$('exit').addEventListener('click',stop);$('drop').addEventListener('click',drop);$('reset').addEventListener('click',resetPlacement);
$('preview-drop').addEventListener('click',()=>{if(!placed)drop();});
['photo','preview-photo'].forEach(id=>$(id).addEventListener('click',()=>{captureFrameRequested=true;}));
['record','preview-record'].forEach(id=>$(id).addEventListener('click',()=>{if(recorder?.state==='recording')finishRecording();else startRecording();}));
$('media-close').addEventListener('click',()=>{$('media-video').pause();$('media-dialog').close();});
$('media-share').addEventListener('click',async()=>{if(!savedMedia)return;try{await navigator.share({files:[savedMedia],title:'Portal'});}catch(e){if(e.name!=='AbortError')$('media-note').textContent='無法分享，請使用下載按鈕儲存檔案。';}});
$('ar-hud').addEventListener('beforexrselect',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden && mode!=='preview')stop();});
window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(t=>t.stop());hitSource?.cancel();xrSession?.end().catch(()=>{});});
init();

function updatePortal(now) {
  let openness=1;burst=0;
  if(droppedAt!==null){
    const elapsed=(now-droppedAt)/1000;const seconds=Math.max(0,Math.ceil(30-elapsed));
    if(seconds!==lastCountdown){lastCountdown=seconds;refreshLabel();}
    if(elapsed<.65){const p=Math.min(1,elapsed/.65);openness=reducedMotion?1:1-Math.pow(1-p,3);burst=1-p;}
    else if(elapsed>=30){const p=Math.min(1,(elapsed-30)/.85);openness=reducedMotion?0:Math.pow(1-p,2);burst=Math.sin(p*Math.PI);
      if(p===1){placed=false;droppedAt=null;portal.visible=false;$('preview-drop').disabled=false;$('drop').disabled=mode==='marker'?!markerReady:mode==='xr';$('reset').disabled=false;status('30 秒結束，傳送門已關閉。可以再次 Drop。');arStatus('傳送門已關閉 · 可以重新放置');}
    }
  }
  const base=Number($('size').value)/2.2;const shape=portal.getObjectByName('shape');shape.scale.set(base*Math.max(.001,openness),base*(.8+.2*openness),base);
  shape.visible=placed;placementGuide.visible=!placed&&armed;placementGuide.scale.setScalar(base);
  ['windows','android','apple'].forEach(name=>shape.getObjectByName(`platform-${name}`).visible=$(`platform-${name}`).checked);
  uniforms.flash.value=0;
  expandingRing.visible=!reducedMotion&&burst>.001;
  expandingRing.scale.setScalar(1+3*(1-burst));ringUniforms.time.value=uniforms.time.value;
  ringUniforms.globals.value[7].w=burst;
  surface.updateWorldMatrix(true,false);
  const eye=new THREE.Vector3();(mode==='xr'?renderer.xr.getCamera():camera).getWorldPosition(eye);uniforms.localCamera.value.copy(surface.worldToLocal(eye));
  const m=surface.matrixWorld.elements;uniforms.ratio.value=Math.sqrt(m[1]*m[1]+m[5]*m[5]+m[9]*m[9])/Math.max(.00001,Math.sqrt(m[0]*m[0]+m[4]*m[4]+m[8]*m[8]));
  const t=reducedMotion?0:now*.001;
  updateEmitters(emitters,reducedMotion?1.2:Math.max(0,(now-(droppedAt??now))/1000),renderer.domElement.height,burst);
  guideArrows.forEach((arrow,i)=>{const s=((i/35+t*.2)%1);arrow.position.set(.35*s,Math.sin(s*Math.PI)*.65+.03,2.4*s);arrow.rotation.x=-Math.atan2(Math.cos(s*Math.PI)*Math.PI*.65,2.4);arrow.scale.setScalar(.35+s);});
}
function composeCapture() {
  const w=recorder?.state==='recording'?recordWidth:Math.round(mode==='preview'?$('viewport').clientWidth:innerWidth);
  const h=recorder?.state==='recording'?recordHeight:Math.round(mode==='preview'?$('viewport').clientHeight:innerHeight);
  const cap=Math.min(1,1280/Math.max(w,h));const width=Math.max(2,Math.floor(w*cap/2)*2),height=Math.max(2,Math.floor(h*cap/2)*2);
  if(captureCanvas.width!==width||captureCanvas.height!==height){captureCanvas.width=width;captureCanvas.height=height;}
  const ctx=captureContext;ctx.clearRect(0,0,width,height);
  if(mode==='preview'){
    const bg=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,height*.7);bg.addColorStop(0,'#152e51');bg.addColorStop(1,'#090e19');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  }else{
    const video=$('camera');if(video.readyState>=2){const scale=Math.max(width/video.videoWidth,height/video.videoHeight);ctx.drawImage(video,(width-video.videoWidth*scale)/2,(height-video.videoHeight*scale)/2,video.videoWidth*scale,video.videoHeight*scale);}
  }
  const canvas=renderer.domElement;const rect=canvas.getBoundingClientRect();const container=mode==='preview'?$('viewport').getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};
  ctx.drawImage(canvas,(rect.left-container.left)/container.width*width,(rect.top-container.top)/container.height*height,rect.width/container.width*width,rect.height/container.height*height);
}
function startRecording() {
  if(mode==='xr')return;
  if(!window.MediaRecorder||!captureCanvas.captureStream){arStatus('此瀏覽器不支援網頁錄影，請使用手機螢幕錄影。');status('此瀏覽器不支援網頁錄影，請使用手機螢幕錄影。');return;}
  try{
    composeCapture();recordWidth=captureCanvas.width;recordHeight=captureCanvas.height;recordingStream=captureCanvas.captureStream(30);
    const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    recorder=new MediaRecorder(recordingStream,mime?{mimeType:mime}:{});recordChunks=[];recordStarted=performance.now();
    recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data);};
    recorder.onstop=()=>{const type=recorder.mimeType||recordChunks[0]?.type||'video/webm';const blob=new Blob(recordChunks,{type});recordingStream?.getTracks().forEach(t=>t.stop());recordingStream=null;recorder=null;recordChunks=[];setRecordButtons(false);if(blob.size)showMedia(blob,type);else status('錄影沒有產生資料，請使用手機螢幕錄影。');};
    recorder.onerror=e=>{status(`錄影失敗：${e.error?.message||'瀏覽器中止錄影'}`);if(recorder?.state==='recording')recorder.stop();};
    recorder.start(250);setRecordButtons(true);arStatus('錄影中 · 無聲 · 再按一次停止');status('錄影中（無聲），再按一次停止。最長 2 分鐘。');
  }catch(e){recordingStream?.getTracks().forEach(t=>t.stop());recordingStream=null;recorder=null;status(`無法錄影：${e.message}`);arStatus('無法錄影，請使用手機螢幕錄影。');}
}
function setRecordButtons(active){['record','preview-record'].forEach(id=>{$(id).textContent=active?'停止錄影':'錄影';$(id).classList.toggle('recording',active);});}
function finishRecording(){if(recorder?.state==='recording')recorder.stop();}
function showMedia(blob,type) {
  $('media-video').pause();
  if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(blob);
  const video=type.startsWith('video/');const extension=video?(type.includes('mp4')?'mp4':'webm'):'png';
  savedMedia=new File([blob],`portal-${new Date().toISOString().replace(/[:.]/g,'-')}.${extension}`,{type});
  $('media-image').hidden=video;$('media-video').hidden=!video;
  if(video){$('media-video').src=mediaUrl;$('media-image').removeAttribute('src');}else{$('media-image').src=mediaUrl;$('media-video').removeAttribute('src');}
  $('media-title').textContent=video?'傳送門錄影':'傳送門照片';$('media-download').href=mediaUrl;$('media-download').download=savedMedia.name;
  $('media-note').textContent=video?'錄影不含聲音。下載後可在裝置上開啟，或分享並儲存到相簿。':'照片包含相機畫面與傳送門，不包含操作按鈕。';
  $('media-share').hidden=!(navigator.canShare?.({files:[savedMedia]}));if(!$('media-dialog').open)$('media-dialog').showModal();
}
