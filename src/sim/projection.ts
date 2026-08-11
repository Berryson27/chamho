import { HORIZON, PROJ_K, PROJ_S, PROJ_X, PROJ_Y, W } from '../config';
import type { Zombie } from '../types';

/* ── 투영 헬퍼 ─────────────────────────────────────────── */
const projP = (d: number) => 1 / (d + PROJ_K);
export const projY = (d: number) => HORIZON + PROJ_Y * projP(d);
export const projX = (wx: number,d: number) => W/2 + wx * PROJ_X * projP(d);
export const projS = (d: number) => PROJ_S * projP(d);
export function box(z: Zombie){                              // 좀비 화면 사각형
  const s = projS(z.d) * z.sz;
  const h = 92 * s, w = 40 * s;
  const fy = projY(z.d), x = projX(z.wx, z.d);
  return {x: x - w/2, y: fy - h, w, h, cx: x, cy: fy - h/2, fy, s, hh: h*0.26};
}

/* 화면 y → 거리. projY 의 역함수라 마우스로 자리를 찍을 수 있다. */
export function yToD(y: number){ return PROJ_Y / Math.max(1, y - HORIZON) - PROJ_K; }
