import { H, W } from './config';
import type { Ctx2D } from './types';

export const cv = document.getElementById('cv') as HTMLCanvasElement;
export const ctx = cv.getContext('2d') as Ctx2D;

/* ── 화면 맞춤 ─────────────────────────────────────────── */
export let view = {x:0, y:0, s:1};
export function resize(){
  // 창 크기를 아직 모르는 시점(임베드·헤드리스)에 0 이 오면 캔버스가 사라진 채
  // 리사이즈 이벤트를 영원히 못 받는다. 최소 스케일로 막아둔다.
  const s = Math.max(0.2, Math.min(innerWidth / W, innerHeight / H) || 1);
  cv.width = W; cv.height = H;
  cv.style.width  = (W * s) + 'px';
  cv.style.height = (H * s) + 'px';
  const r = cv.getBoundingClientRect();
  view = {x:r.left, y:r.top, s};
}
/* 리스너 등록은 main.ts 가 부팅 순서에 맞춰 한다 */
