export function installPlacementInput(element,onTarget){
  let pointer=null;
  const update=e=>{const bounds=element.getBoundingClientRect();onTarget((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2);};
  element.addEventListener('pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;element.setPointerCapture(pointer);update(e);});
  element.addEventListener('pointermove',e=>{if(e.pointerId===pointer)update(e);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>element.addEventListener(name,e=>{if(e.pointerId===pointer)pointer=null;}));
}
