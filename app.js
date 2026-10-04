import * as THREE from './vendor/three.module.js';
const $ = id => document.getElementById(id);
const status = message => { $('status').textContent = message; };
const arStatus = message => { $('ar-status').textContent = message; };
let renderer, scene, camera, portal, surface, worldTexture, stream, xrSession, hitSource;
let arSource, arContext, markerRoot, markerControls, reticle, grid;
let mode = 'preview', placed = false, busy = false, xrSupported = false, ready = false;
let markerReady = false, generation = 0, resizeObserver;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const startButtons = ['start-marker','start-xr','start-camera'];
const noise = new THREE.TextureLoader().load('./assets/portal-noise.png');
noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
const uniforms = { time: { value: 0 }, picture: { value: null }, noiseMap: { value: noise }, hasPicture: { value: 0 }, aspect: { value: 1 }, tint: { value: new THREE.Color('#378eff') } };
const vertexShader = `varying vec2 p; void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragmentShader = `precision highp float;
uniform float time,hasPicture,aspect;uniform sampler2D picture,noiseMap;uniform vec3 tint;varying vec2 p;
void main(){float r=length(p);float a=atan(p.y,p.x);vec2 q=p*.5+.5;
float n=texture2D(noiseMap,vec2(a/6.283+time*.018,r*.8-time*.065)).r;
float ribbon=pow(max(0.,sin(a*12.+time*1.7+n*7.)),3.);
float edge=smoothstep(.83,.96,r);float glow=pow(max(0.,1.-abs(r-.945)/.10),2.);
vec2 uv=q;float target=.65;if(aspect>target)uv.x=(uv.x-.5)*(target/aspect)+.5;else uv.y=(uv.y-.5)*(aspect/target)+.5;
vec3 image=texture2D(picture,uv).rgb;vec3 base=mix(vec3(.012,.045,.12),image,hasPicture*.9);
base+=tint*(.05+.07*n)*(1.-hasPicture*.8);base=mix(base,tint*(.5+1.0*n+.6*ribbon),edge*.9);base+=tint*glow*.7;
float alpha=(1.-smoothstep(.98,1.,r))*mix(.94,.85,edge);gl_FragColor=vec4(base,alpha);}`;

function makeLabel(text) {
  const c=document.createElement('canvas');c.width=1024;c.height=160;
  const ctx=c.getContext('2d');ctx.fillStyle='#07162dcc';ctx.fillRect(0,0,1024,160);
  ctx.fillStyle='#f0f7ff';ctx.font='500 48px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
  const title=text.trim() || 'My world';
  let font=48;while(ctx.measureText(title).width>930 && font>22){ctx.font=`500 ${--font}px system-ui`;}
  ctx.fillText(title,512,64);ctx.fillStyle='#83baff';ctx.font='24px system-ui';ctx.fillText('PORTAL',512,122);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function refreshLabel() {
  if (!portal) return;
  const label=portal.getObjectByName('label');const old=label.material.map;
  label.material.map=makeLabel($('world').value);old?.dispose();label.material.needsUpdate=true;
}
function resize() {
  if(!renderer || renderer.xr.isPresenting)return;
  const active=mode!=='preview';const box=$('viewport').getBoundingClientRect();
  const w=active?innerWidth:box.width,h=active?innerHeight:box.height;
  renderer.setSize(w,h);
  if(mode==='marker' && arSource?.ready){
    arSource.onResizeElement();arSource.copyElementSizeTo(renderer.domElement);
    if(arContext?.arController)arSource.copyElementSizeTo(arContext.arController.canvas);
  } else {camera.aspect=w/h;camera.updateProjectionMatrix();}
}
function setMode(next) {
  mode=next;document.body.classList.toggle('ar-active',next!=='preview');
  $('ar-hud').hidden=next==='preview';$('mode').textContent=next==='preview'?'3D 預覽':'相機';
  grid.visible=next==='preview';scene.background=null;renderer.setClearColor(0x000000,0);
  placed=false;markerReady=false;$('drop').disabled=next!=='camera';
  $('reset').disabled=true;
  if(next==='preview'){
    scene.add(portal);portal.position.set(0,0,0);portal.rotation.set(0,0,0);portal.visible=true;
    portal.scale.setScalar(1);camera.position.set(0,1.25,4.6);camera.lookAt(0,1.1,0);
  } else if(next==='camera'){
    scene.add(portal);portal.position.set(0,0,-3);portal.rotation.set(0,0,0);portal.scale.setScalar(1);portal.visible=true;
    camera.position.set(0,1.1,0);camera.rotation.set(0,0,0);
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
  placed=true;portal.visible=true;$('drop').disabled=true;$('reset').disabled=false;
  arStatus(mode==='marker'?'已放置 · 保持辨識圖在畫面中':mode==='xr'?'已放置在地面':'已放置 · 相機預覽');
  $('ar-help').textContent=mode==='marker'?'繞著辨識圖觀看傳送門。辨識圖離開畫面時，傳送門會暫時隱藏。':mode==='xr'?'可以移動手機，從不同角度觀看傳送門。':'這個模式的傳送門固定在螢幕上。';
}
function resetPlacement() {
  placed=false;portal.visible=mode==='camera';$('drop').disabled=mode!=='camera';$('reset').disabled=true;
  arStatus(mode==='marker'?'尋找 Hiro 辨識圖':mode==='xr'?'掃描地面，重新定位':'相機預覽 · 無空間定位');
}
async function stop() {
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
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    worldTexture?.dispose();worldTexture=texture;uniforms.picture.value=texture;uniforms.hasPicture.value=1;uniforms.aspect.value=img.width/img.height;
    $('thumbnail').src=canvas.toDataURL('image/jpeg',.75);$('filename').textContent=file.name;
    status('圖片已更新。可以開啟相機放置傳送門。');
  }catch(e){status(e.message);}finally{URL.revokeObjectURL(url);$('image').value='';}
}
async function init() {
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.xr.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;$('viewport').appendChild(renderer.domElement);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(45,1,.01,100);
    const response=await fetch('./assets/portal-plane.json');if(!response.ok)throw new Error('傳送門模型載入失敗');const mesh=await response.json();
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(mesh.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(mesh.uvs,2));
    worldTexture=makeLabel('選擇世界圖片');uniforms.picture.value=worldTexture;
    portal=new THREE.Group();const shape=new THREE.Group();shape.name='shape';portal.add(shape);
    surface=new THREE.Mesh(geometry,new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
    surface.position.y=1.1;surface.scale.set(.715,1.1,1);shape.add(surface);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.195),new THREE.MeshBasicMaterial({map:makeLabel($('world').value),transparent:true,side:THREE.DoubleSide,depthWrite:false}));
    label.name='label';label.position.set(0,2.43,.015);shape.add(label);
    const particles=new THREE.BufferGeometry();const points=[];for(let i=0;i<65;i++){const a=i*2.399;points.push(Math.cos(a)*.72,1.1+Math.sin(a)*1.08,(Math.sin(i*15.31)*.12));}
    particles.setAttribute('position',new THREE.Float32BufferAttribute(points,3));shape.add(new THREE.Points(particles,new THREE.PointsMaterial({color:0xb4dfff,size:.012,transparent:true,opacity:.8,depthWrite:false})));
    grid=new THREE.GridHelper(16,32,0x274e77,0x162a43);grid.position.y=-.015;scene.add(grid);
    reticle=new THREE.Mesh(new THREE.RingGeometry(.13,.16,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x8bd1ff,side:THREE.DoubleSide}));reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
    setMode('preview');resizeObserver=new ResizeObserver(resize);resizeObserver.observe($('stage'));window.addEventListener('resize',resize);
    renderer.setAnimationLoop((time,frame)=>{
      uniforms.time.value=reducedMotion?0:time*.001;
      if(mode==='marker' && arSource?.ready && arContext?.arController && markerRoot){
        arContext.update(arSource.domElement);markerReady=markerRoot.visible;
        portal.visible=placed && markerReady;$('drop').disabled=placed || !markerReady;
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
        $('drop').disabled=!reticle.visible;arStatus(reticle.visible?'已找到平面 · 可以放置':'慢慢移動手機，掃描水平地面');
      }
      renderer.render(scene,camera);
    });
    ready=true;
    if(navigator.xr && isSecureContext){try{xrSupported=await navigator.xr.isSessionSupported('immersive-ar');}catch{}}
    startButtons.forEach(id=>$(id).disabled=false);$('start-xr').disabled=!xrSupported;
    if(!navigator.mediaDevices?.getUserMedia || !isSecureContext){$('start-marker').disabled=$('start-camera').disabled=true;$('support').textContent='相機需要 HTTPS 或 localhost，請部署至 GitHub Pages 後開啟。';}
    else $('support').textContent=xrSupported?'此裝置可使用地面 AR，也可以使用標記 AR。':'此瀏覽器未提供地面 AR。請使用標記 AR 或相機預覽。';
    status('傳送門已就緒，請選擇世界圖片。');
  }catch(e){status(`載入失敗：${e.message}。請確認瀏覽器支援 WebGL，並由網站網址開啟。`);}
}
$('image').addEventListener('change',e=>chooseImage(e.target.files[0]));$('world').addEventListener('input',refreshLabel);
$('size').addEventListener('input',()=>{const height=Number($('size').value);$('size-value').textContent=`${height.toFixed(1)} m`;portal?.getObjectByName('shape').scale.setScalar(height/2.2);});
$('start-camera').addEventListener('click',()=>begin(startCamera));$('start-marker').addEventListener('click',()=>begin(startMarker));$('start-xr').addEventListener('click',()=>begin(startXR));
$('exit').addEventListener('click',stop);$('drop').addEventListener('click',drop);$('reset').addEventListener('click',resetPlacement);
$('ar-hud').addEventListener('beforexrselect',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden && mode!=='preview')stop();});
window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(t=>t.stop());hitSource?.cancel();xrSession?.end().catch(()=>{});});
init();
