import { H, W } from '../config';
import { mouse } from '../mouse';
import { g } from '../state';

/* ── 총구 축 ───────────────────────────────────────────────
   총을 그릴 때와 탄도를 만들 때가 반드시 같은 축을 쓰도록 한 곳에서 계산한다.
   총은 조준점을 향해 회전하고, 총구는 그 회전축 위 BARREL 만큼 떨어진 점이다.
   ─────────────────────────────────────────────────────── */
export const BARREL = 376;                                   // 회전 원점 → 총구 거리(로컬)
export function gunAim(){
  const rec = g ? g.recoil : 0;
  const rl  = g && g.reloadT > 0 ? Math.sin((1 - g.reloadT / g.gun.reload) * Math.PI) : 0;
  const ox  = W/2 + 158;
  // 74 였을 때는 리시버가 화면 아래로 완전히 빠져서, 3회 강화마다 바뀌는 도색과
  // 노리쇠·금장식이 게임 중엔 한 번도 보이지 않았다. 총을 올려 보이게 한다.
  const oy  = H + 38 + rec*32 + rl*118;
  // 화면 위쪽(-y)이 0도. 조준점 방향으로 총열을 돌린다.
  let ang = Math.atan2(mouse.x - ox, oy - mouse.y);
  ang = Math.max(-1.05, Math.min(1.05, ang)) + rl*0.30;
  return {ox, oy, ang, rl,
          mx: ox + Math.sin(ang)*BARREL,              // 총구 x
          my: oy - Math.cos(ang)*BARREL};             // 총구 y
}

