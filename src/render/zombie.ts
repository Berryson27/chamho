import { TYPES } from '../data/zombies';
import { ctx } from '../canvas';
import { box } from '../sim/projection';
import { fogT, zColors } from './colors';
import type { Zombie } from '../types';

export function drawZombie(z: Zombie){
  const b = box(z), t = fogT(z.d);
  const cc = zColors(z.type, z.hue, t);
  const body = cc.body, head = cc.head, dark = cc.dark;
  const s = b.s * z.sz, h = b.h, x = b.cx, fy = b.fy;
  const walk = Math.sin(z.ph), walk2 = Math.cos(z.ph);

  /* 화면에서 차지하는 키로 디테일 단계를 나눈다.
     수백 마리가 몰려오면 멀리 있는 놈의 눈·입·림라이트·비틀거림 회전은
     보이지도 않는데 값은 똑같이 나갔다. 특히 회전은 모든 도형을
     축에 어긋나게 래스터화시켜서 제일 비싸다. */
  const FAR = h < 74, NEAR = h > 118;

  ctx.save();
  ctx.translate(x, fy);
  if(!FAR || z.swing > 0.05)                                 // 비틀거림 + 내려찍는 반동
    ctx.rotate(Math.sin(z.ph*0.5) * 0.035 + z.swing * 0.10);

  if(!FAR){                                                  // 그림자
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ctx.beginPath(); ctx.ellipse(0, 0, h*0.22, h*0.05, 0, 0, 7); ctx.fill();
  }

  const legH = h*0.40, torH = h*0.36, headR = h*0.115, bw = h*0.20;

  // 다리
  ctx.strokeStyle = dark; ctx.lineWidth = h*0.075; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-bw*0.30, -legH); ctx.lineTo(-bw*0.30 + walk*h*0.09, 0);
  ctx.moveTo( bw*0.30, -legH); ctx.lineTo( bw*0.30 - walk*h*0.09, 0);
  ctx.stroke();

  /* 몸통 — 위가 밝은 그라디언트로 통을 세우고, 밑단은 찢긴 옷처럼 들쭉날쭉하게.
     그라디언트 객체 생성이 비싸서 가까운 놈에게만 쓴다. 멀리 있는 놈은
     어차피 몇 픽셀이라 단색으로 칠해도 차이가 안 보인다. */
  if(s > 0.62){
    const tg = ctx.createLinearGradient(0, -legH - torH, 0, -legH);
    tg.addColorStop(0, body);
    tg.addColorStop(1, cc.deep);
    ctx.fillStyle = tg;
  }else{
    ctx.fillStyle = body;
  }
  ctx.beginPath();
  ctx.moveTo(-bw*0.62, -legH - torH);
  ctx.lineTo( bw*0.62, -legH - torH);
  if(FAR){                                                   // 밑단 톱니는 가까울 때만
    ctx.lineTo( bw*0.50, -legH + torH*0.08);
    ctx.lineTo(-bw*0.50, -legH + torH*0.08);
  }else{
    ctx.lineTo( bw*0.50, -legH + torH*0.10);
    ctx.lineTo( bw*0.28, -legH - torH*0.04);
    ctx.lineTo( bw*0.02, -legH + torH*0.12);
    ctx.lineTo(-bw*0.26, -legH - torH*0.02);
    ctx.lineTo(-bw*0.50, -legH + torH*0.08);
  }
  ctx.closePath(); ctx.fill();
  if(!FAR){                                                  // 찢긴 옷 얼룩
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(-bw*0.5, -legH - torH*0.45, bw*0.42, torH*0.30);
  }

  // 팔 — 전진 중엔 앞으로 뻗고, 참호를 때릴 땐 위로 들었다 내려찍는다.
  // 양팔을 똑같이 움직이면 허수아비처럼 보이므로 개체마다 좌우를 어긋나게 둔다.
  const asym = z.hue / 26;
  ctx.strokeStyle = head; ctx.lineWidth = h*0.062;
  const sy = -legH - torH*0.86;
  const armY = z.melee ? (h*0.34*z.swing - h*0.24*(1 - z.swing)) : h*0.05 ;
  ctx.beginPath();
  ctx.moveTo(-bw*0.55, sy);
  ctx.lineTo(-bw*(0.95 + asym*0.12), sy + armY*(1 + asym*0.28) + walk2*h*0.03);
  ctx.moveTo( bw*0.55, sy);
  ctx.lineTo( bw*(0.95 - asym*0.12), sy + armY*(1 - asym*0.34) - walk2*h*0.03);
  ctx.stroke();

  // 머리 (히트박스 상단 26%)
  const hy = -legH - torH - headR*0.85;
  ctx.fillStyle = head;
  ctx.beginPath(); ctx.arc(0, hy, headR, 0, 7); ctx.fill();
  if(!FAR){                                                  // 붉은 눈 + 벌어진 입
    ctx.fillStyle = 'rgba(255,60,50,.9)';
    ctx.beginPath();
    ctx.arc(-headR*0.38, hy - headR*0.12, headR*0.20, 0, 7);
    ctx.arc( headR*0.38, hy - headR*0.12, headR*0.20, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(10,8,8,.8)';
    ctx.fillRect(-headR*0.42, hy + headR*0.35, headR*0.84, headR*0.22);
  }else{
    ctx.fillStyle = 'rgba(255,60,50,.75)';                   // 멀면 눈만 한 덩이로
    ctx.fillRect(-headR*0.5, hy - headR*0.3, headR, headR*0.34);
  }

  // 달빛 림라이트 — 광원이 오른쪽 위(달)에 있으니 그쪽 윤곽만 밝게 딴다.
  // 평면 실루엣이 입체로 읽히는 데 이 한 줄이 제일 크게 먹는다.
  if(NEAR){
    ctx.strokeStyle = `rgba(196,212,236,${0.30 * (1 - t)})`;
    ctx.lineWidth = Math.max(0.8, h*0.014);
    ctx.beginPath();
    ctx.arc(0, hy, headR, -Math.PI*0.85, -Math.PI*0.10);
    ctx.moveTo(bw*0.62, -legH - torH);
    ctx.lineTo(bw*0.50, -legH + torH*0.08);
    ctx.stroke();
  }

  /* 피격 플래시 — 예전엔 히트박스 사각형을 통째로 밝혀서, 맞을 때마다 좀비 위에
     흰 상자가 떠올랐다. 몸통과 머리 실루엣만 물들인다. */
  if(z.flash > 0){
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,152,138,${z.flash*0.34})`;
    ctx.beginPath();
    ctx.moveTo(-bw*0.62, -legH - torH);
    ctx.lineTo( bw*0.62, -legH - torH);
    ctx.lineTo( bw*0.50, -legH + torH*0.10);
    ctx.lineTo(-bw*0.50, -legH + torH*0.08);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, hy, headR*1.04, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();

  /* 체력바는 브루트·보스만. 워커와 러너는 한두 발에 터지는데 떼로 몰려오면
     막대 수백 개가 머리 위에 깔려서, 정작 봐야 할 큰 놈이 안 보였다.
     "이건 오래 쏴야 하는 놈이다" 를 알려주는 게 목적이므로 그 놈들에게만 준다. */
  const T = TYPES[z.type];
  if(z.hp < z.max && T.bar && b.h > 40){
    const bwid = Math.max(20, b.w*0.9), bx = b.cx - bwid/2, by = b.y - 10;
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(bx - 1, by - 1, bwid + 2, 6);
    ctx.fillStyle = T.barCol;
    ctx.fillRect(bx, by, bwid * (z.hp/z.max), 4);
  }
}

