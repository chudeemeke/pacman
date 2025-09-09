export const TILE = 16;
export const COLS = 28;
export const ROWS = 31;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;
export const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

export function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
export function rand(arr){ return arr[(Math.random()*arr.length)|0]; }
export function eq(a,b){ return a[0]===b[0] && a[1]===b[1]; }
export function manhattan(a,b){ return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]); }

export function drawRoundedRect(ctx, x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
