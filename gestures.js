// Pointer Events share mouse, pen and touchscreen handling.
export function installGestures(element,{enabled,drag,zoom}) {
  const pointers=new Map();
  let span=0;
  const distance=()=>{const [a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
  element.addEventListener('pointerdown',e=>{
    if(!enabled()||e.button>0)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});element.setPointerCapture(e.pointerId);span=distance();
  });
  element.addEventListener('pointermove',e=>{
    const previous=pointers.get(e.pointerId);if(!previous)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(!enabled())return;
    if(pointers.size===1)drag((e.clientX-previous.x)/element.clientWidth,(e.clientY-previous.y)/element.clientHeight);
    else {const next=distance();if(span>0&&next>0)zoom(span/next);span=next;}
  });
  const release=e=>{pointers.delete(e.pointerId);span=distance();};
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>element.addEventListener(name,release));
  element.addEventListener('wheel',e=>{if(!enabled())return;e.preventDefault();zoom(Math.exp(Math.max(-100,Math.min(100,e.deltaY))*.003));},{passive:false});
}
