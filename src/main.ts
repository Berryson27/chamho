import { resize } from './canvas';
import { newGame } from './game';
import { bindInput } from './input';
import { render } from './render/index';
import { update } from './sim/update';
import { setPhase } from './state';

import './fatal';                 // 예외를 화면에 띄우는 훅을 가장 먼저 건다

/* ── 루프 ──────────────────────────────────────────────── */
let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

resize();
addEventListener('resize', resize);
addEventListener('load', resize);   // 폰트·레이아웃이 잡힌 뒤 한 번 더

bindInput();
newGame();
setPhase('menu');                   // 메뉴 뒤에서도 배경이 살아있게
requestAnimationFrame(loop);
