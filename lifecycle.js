// Estimated from the supplied 30 fps reference, not original Unity curves.
export const OPEN_SECONDS = .30;
export const CLOSE_SECONDS = .20;
export function portalFrame(elapsed, reducedMotion=false) {
  const closing=elapsed>=30;
  const open=Math.min(1,Math.max(0,elapsed/OPEN_SECONDS));
  const close=Math.min(1,Math.max(0,(elapsed-30)/CLOSE_SECONDS));
  // Opening grows around the centre. Closing preserves width until the last
  // frames while collapsing vertically into a line at the same centre.
  return {
    finished:elapsed>=30+CLOSE_SECONDS,
    information:!closing,
    x:closing?1-.12*close:reducedMotion?1:1-(1-open)**3,
    y:closing?reducedMotion?0:(1-close)**2:reducedMotion?1:1-(1-open)**3,
    ring:!closing&&!reducedMotion?Math.max(0,1-elapsed/.65):0,
    particleOpacity:closing?1-close:1,
    countdown:Math.max(0,Math.ceil(30-elapsed)),
  };
}
