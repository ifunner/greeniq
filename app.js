"use strict";
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const G=32.174, HOLE_R=2.125/12, VS=6.0, CUP=4.25;

/* ---------- state ---------- */
const S={ slope:2.0, dirDeg:0, length:10, stimp:10, grain:0, metric:false, locked:false, live:false, raw:{x:0,y:0,z:1}, off:{x:0,y:0} };
function effStimp(){ return clamp(S.stimp + S.grain*1.0, 5, 16); } // down-grain ≈ +1 stimp, into ≈ −1
// dirDeg: 0 = downhill points straight toward the hole-side away (i.e. straight DOWNHILL putt = ball above hole).
// Convention for engine: putt line is ball(bottom)->hole(top)=+Y up. Downhill vector angle measured clockwise from "toward hole/up".
//   0°   = downhill is up-and-away past the hole  -> a DOWNHILL putt
//   180° = downhill is back toward the player      -> an UPHILL putt
//   90°  = downhill to the right  -> breaks right→left, aim right
//   270° = downhill to the left   -> breaks left→right, aim left

/* ---------- PHYSICS ENGINE (validated) ---------- */
function af(stimp){ return VS*VS/(2*stimp); }              // level rolling deceleration ft/s^2
// downhill unit vector in field coords: putt travels -Y(down) -> +Y(up to hole). We'll sim in (x:right, y:towards hole)
function downVec(dirDeg){ const a=dirDeg*Math.PI/180; return {x:Math.sin(a), y:Math.cos(a)}; }
function simulate(L,slope,stimp,v0,phi,dv){
  const a_f=af(stimp), theta=Math.atan(slope/100), ag=(5/7)*G*Math.sin(theta);
  let px=0, py=0;                       // start at ball (origin); hole at (0,L)
  let vx=Math.sin(phi)*v0, vy=Math.cos(phi)*v0; // phi: + aims toward +x (right). Putt mainly +y.
  const dt=0.0022; let made=false, mind=1e9, xAtHole=0, passed=false;
  const path=[[0,0]];
  for(let i=0;i<22000;i++){
    const sp=Math.hypot(vx,vy); if(sp<1e-3) break;
    const axx=-a_f*vx/sp + ag*dv.x;
    const ayy=-a_f*vy/sp + ag*dv.y;
    vx+=axx*dt; vy+=ayy*dt; px+=vx*dt; py+=vy*dt;
    path.push([px,py]);
    const d=Math.hypot(px, py-L); if(d<mind) mind=d;
    if(d<HOLE_R && Math.hypot(vx,vy)<4.9){ made=true; break; }
    if(py>L+0.05 && vy>0 && !passed){ passed=true; xAtHole=px; }
    if(py>L+1.8) break;
  }
  return {made, mind, path};
}
// effective length for pace from along-slope component (signed: +uphill plays longer)
function effLength(L,slope,stimp,dv){
  const m=(slope/100)*(-dv.y);            // dv.y>0 means downhill toward hole => downhill putt => shorter
  return L*(1 + m*G*stimp/18/ (G) *1 );    // see below; simplified
}
function read(p){
  const L=p?p.L:S.length, slope=p?p.slope:S.slope, stimp=p?p.stimp:effStimp(), dv=downVec(p?p.dirDeg:S.dirDeg);
  // along-line grade: + = uphill (downhill points back at player => dv.y<0)
  const grade = (slope/100) * (-dv.y);     // uphill positive
  const a_f=af(stimp);
  // launch-speed-equivalent flat distance: D = L + L*grade*g/a_f  (a_f = 18/stimp)
  const Leff = clamp(L*(1 + grade*G*stimp/18), 0.6, L*5);
  const v0 = Math.sqrt(2*a_f*(Leff+1.5));
  // search aim angle phi that makes the putt; cross slope sets break.
  let best=null;
  for(let deg=-30; deg<=30; deg+=0.25){
    const phi=deg*Math.PI/180;
    const r=simulate(L,slope,stimp,v0,phi,dv);
    if(r.made){ if(!best || Math.abs(phi)<Math.abs(best.phi)){ best={phi, path:r.path}; } }
  }
  if(!best){ // couldn't hole at this pace (very steep/fast downhill) — find closest & flag
    let bm=1e9;
    for(let deg=-30; deg<=30; deg+=0.5){
      const phi=deg*Math.PI/180; const r=simulate(L,slope,stimp,v0,phi,dv);
      if(r.mind<bm){ bm=r.mind; best={phi:phi, path:r.path, miss:true}; }
    }
  }
  const aimFt=L*Math.tan(best.phi);        // signed: + = aim right
  return {aimFt, Leff, path:best.path, phi:best.phi, miss:!!best.miss, grade};
}

/* ---------- RENDER READ ---------- */
function fmtCall(aimIn){
  const a=Math.abs(aimIn), side=aimIn>=0?"right":"left";
  if(a<0.8) return "Aim center / dead straight";
  const cups=a/CUP;
  if(cups<0.6) return `Aim ${side} edge`;
  if(cups<1.4) return `Aim a cup ${side}`;
  if(cups<2.4) return `Aim ${cups.toFixed(1)} cups ${side}`;
  return `Aim ${cups.toFixed(1)} cups ${side} — big break`;
}
function renderRead(){
  const r=read();
  const aimIn=r.aimFt*12, a=Math.abs(aimIn);
  $("aimIn").textContent=fmtBr(a);
  document.querySelector(".aimcol .u").textContent=uBr();
  $("aimSub").textContent=`≈ ${(a/CUP).toFixed(1)} cups · ${aimIn>=0?"high side right":"high side left"}`;
  $("aimFingers").textContent = a<0.5? "" : `≈ ${fingersFor(aimIn,S.length).toFixed(1)} fingers at arm's length`;
  $("aimCall").textContent=fmtCall(aimIn);
  $("aimCall").className="callout";

  const plays=r.Leff;
  $("paceFt").textContent = fmtLen(plays);
  document.querySelector(".readgrid > div:nth-child(2) .u").textContent=uLen();
  let pc, sub;
  const diff=Math.abs(plays-S.length);
  if(r.grade>0.008){ sub=`uphill — firm it up`; pc=`Plays ${fmtLen(diff,1)} ${uLen()} longer`; }
  else if(r.grade<-0.008){ sub=`downhill — ease off`; pc=`Plays ${fmtLen(diff,1)} ${uLen()} shorter`; }
  else { sub="plays its length"; pc="Standard pace"; }
  $("paceSub").textContent=sub; $("paceCall").textContent=pc;
  $("paceCall").className="callout"+(r.miss?" warn":"");
  if(r.miss){ $("paceCall").textContent="Slick — may not hold; play defense below the hole"; }
  drawSchematic(r);
}

/* ---------- SCHEMATIC (top-down) ---------- */
function drawSchematic(r){
  const W=320,H=220, svg=$("schem");
  const path=r.path; if(!path||path.length<2){svg.innerHTML="";return;}
  let minX=0,maxX=0; for(const p of path){ if(p[0]<minX)minX=p[0]; if(p[0]>maxX)maxX=p[0]; }
  const L=S.length;
  const padX=34, padTop=22, padBot=30;
  const spanX=Math.max(maxX-minX, 0.6)+0.5;
  const sx=v=>padX + ((v-minX+0.25)/spanX)*(W-2*padX);
  const sy=v=>H-padBot - (v/(L*1.06))*(H-padTop-padBot);
  const ball=path[0], hole=[0,L];
  // build path
  let d="M "+sx(ball[0]).toFixed(1)+" "+sy(ball[1]).toFixed(1);
  const step=Math.max(1,Math.floor(path.length/120));
  for(let i=step;i<path.length;i+=step){ d+=" L "+sx(path[i][0]).toFixed(1)+" "+sy(path[i][1]).toFixed(1); }
  // apex (max |x|)
  let ap=path[0]; for(const p of path){ if(Math.abs(p[0])>Math.abs(ap[0])) ap=p; }
  // aim point: where start line (angle phi) crosses hole's y
  const aimX = L*Math.tan(r.phi);
  // fall line arrow (downhill direction) drawn at hole
  const dv=downVec(S.dirDeg); const flAng=Math.atan2(dv.x,dv.y); // screen: x right, y up→ but svg y down
  const hx=sx(0), hy=sy(L), flLen=26;
  const fx=hx+Math.sin(flAng)*flLen, fy=hy+Math.cos(flAng)*flLen; // downhill goes +y(down screen) when toward player
  const NS="http://www.w3.org/2000/svg";
  svg.innerHTML=`
    <defs>
      <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3.2" orient="auto">
        <path d="M0,0 L6,3.2 L0,6.4 Z" fill="var(--sage)"/>
      </marker>
    </defs>
    <line x1="${sx(0)}" y1="${padTop-6}" x2="${sx(0)}" y2="${H-padBot+6}" stroke="var(--line)" stroke-dasharray="3 5"/>
    <line x1="${hx}" y1="${hy}" x2="${fx}" y2="${fy}" stroke="var(--sage)" stroke-width="2" marker-end="url(#ar)"/>
    <text x="${fx}" y="${fy+ (fy>hy?12:-6)}" fill="var(--sage)" font-size="9" text-anchor="middle">downhill</text>
    <line x1="${sx(ball[0])}" y1="${sy(ball[1])}" x2="${sx(aimX)}" y2="${sy(L)}" stroke="var(--flag)" stroke-width="1.4" stroke-dasharray="2 4" opacity="0.85"/>
    <path d="${d}" fill="none" stroke="var(--path)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${sx(0)}" cy="${sy(L)}" r="6.2" fill="none" stroke="var(--ink)" stroke-width="2"/>
    <circle cx="${sx(0)}" cy="${sy(L)}" r="2" fill="var(--ink)"/>
    <circle cx="${sx(aimX)}" cy="${sy(L)}" r="4.5" fill="var(--flag)"/>
    <text x="${sx(aimX)}" y="${sy(L)-9}" fill="var(--flag)" font-size="9" text-anchor="middle">aim</text>
    <circle cx="${sx(ball[0])}" cy="${sy(ball[1])}" r="4.5" fill="#fff"/>
    <text x="${sx(ball[0])}" y="${sy(0)+16}" fill="var(--ink-dim)" font-size="9" text-anchor="middle">ball · ${fmtLen(S.length)} ${uLen()}</text>
  `;
}

/* ---------- LEVEL GAUGE ---------- */
function drawLevel(){
  const slope=S.slope, dir=S.dirDeg;
  const cx=64,cy=64,R=56;
  const mag=clamp(slope/6,0,1);
  const a=dir*Math.PI/180;
  const bx=cx+Math.sin(a)*mag*40, by=cy+Math.cos(a)*mag*40; // bubble moves DOWNHILL? show it toward downhill
  const col = S.locked? "var(--flag)" : (S.live? "var(--path)":"var(--sage)");
  $("level").innerHTML=`
  <svg viewBox="0 0 128 128" width="128" height="128">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#0a1f19" stroke="var(--line)" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${R*0.62}" fill="none" stroke="var(--line)" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${R*0.30}" fill="none" stroke="var(--line)" stroke-width="1"/>
    <line x1="${cx-R}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="var(--line)" stroke-width=".6"/>
    <line x1="${cx}" y1="${cy-R}" x2="${cx}" y2="${cy+R}" stroke="var(--line)" stroke-width=".6"/>
    <circle cx="${bx}" cy="${by}" r="9" fill="${col}" opacity="0.9"/>
    <circle cx="${bx}" cy="${by}" r="9" fill="none" stroke="#fff" stroke-opacity=".25"/>
  </svg>`;
}

/* ---------- CLOCK DIAL ---------- */
function drawClock(){
  const c=$("clock"), cx=59,cy=59,R=50, a=S.dirDeg*Math.PI/180;
  const tx=cx+Math.sin(a)*R*0.8, ty=cy-Math.cos(a)*R*0.8; // 0°=up(toward hole side)
  // but downhill 0° means downhill points toward hole(up) = downhill putt; arrow points up
  let ticks="";
  for(let i=0;i<12;i++){ const t=i*Math.PI/6; const x1=cx+Math.sin(t)*R, y1=cy-Math.cos(t)*R, x2=cx+Math.sin(t)*(R-6), y2=cy-Math.cos(t)*(R-6); ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="1.5"/>`; }
  c.innerHTML=`
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#0a1f19" stroke="var(--line)" stroke-width="2"/>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="4" fill="var(--sage)"/>
    <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="var(--flag)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${tx}" cy="${ty}" r="6" fill="var(--flag)"/>
    <text x="${cx}" y="14" fill="var(--ink-dim)" font-size="8.5" text-anchor="middle">HOLE</text>
    <text x="${cx}" y="${cy+R+6}" fill="var(--ink-dim)" font-size="8.5" text-anchor="middle">YOU</text>`;
}
function clockDrag(e){
  const c=$("clock"), rect=c.getBoundingClientRect();
  const t=e.touches?e.touches[0]:e;
  const x=t.clientX-rect.left-rect.width/2, y=t.clientY-rect.top-rect.height/2;
  let deg=Math.atan2(x,-y)*180/Math.PI; if(deg<0)deg+=360;
  S.dirDeg=deg; drawClock(); updateAll(true);
}
$("clock").addEventListener("pointerdown",e=>{e.preventDefault(); clockDrag(e);
  const mv=ev=>clockDrag(ev), up=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);};
  window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up);});

/* ---------- SENSORS ---------- */
let motionHandler=null, smooth={x:0,y:0,z:1};
function startSensor(){
  const begin=()=>{
    S.live=true; $("liveBtn").textContent="Sensor on"; $("liveBtn").className="live";
    $("readerHint").innerHTML="Set the phone face‑up on the green along your line. Tap <b>Zero</b> on a flat spot to calibrate, then <b>Lock</b> when steady.";
    motionHandler=ev=>{
      const g=ev.accelerationIncludingGravity||ev.acceleration; if(!g||g.z==null) return;
      smooth.x=smooth.x*0.85+g.x*0.15; smooth.y=smooth.y*0.85+g.y*0.15; smooth.z=smooth.z*0.85+g.z*0.15;
      if(S.locked) return;
      S.raw={x:smooth.x,y:smooth.y,z:smooth.z};
      const ax=smooth.x-S.off.x, ay=smooth.y-S.off.y, az=Math.abs(smooth.z)||9.81;
      const tan=Math.hypot(ax,ay)/az; S.slope=clamp(tan*100,0,25);
      // direction: phone frame -> field. downhill points where gravity pulls in-plane.
      // device x = right, y = top of phone (pointing toward hole when laid along line). downhill dir:
      let deg=Math.atan2(ax, ay)*180/Math.PI; if(deg<0)deg+=360;
      S.dirDeg=deg;
      $("slopeManual").value=S.slope.toFixed(1);
      updateAll(false);
    };
    window.addEventListener("devicemotion",motionHandler,true);
  };
  if(typeof DeviceMotionEvent!=="undefined" && typeof DeviceMotionEvent.requestPermission==="function"){
    DeviceMotionEvent.requestPermission().then(p=>{ if(p==="granted") begin(); else sensorFail(); }).catch(sensorFail);
  } else if(typeof DeviceMotionEvent!=="undefined"){ begin(); }
  else sensorFail();
}
function sensorFail(){
  $("readerHint").innerHTML="<b>No motion sensor here</b> (common inside a desktop browser or a sandboxed frame). Open this file on your phone — or just set the slope with the manual slider. Everything else works.";
  toast("Sensor unavailable — use manual");
}
$("liveBtn").onclick=()=>{ if(!S.live) startSensor(); };
$("zeroBtn").onclick=()=>{ if(S.live){ S.off={x:smooth.x,y:smooth.y}; toast("Zeroed flat"); } else toast("Start the sensor first"); };
$("lockBtn").onclick=()=>{
  S.locked=!S.locked; $("lockBtn").textContent=S.locked?"Unlock":"Lock";
  $("lockBtn").className=S.locked?"primary":"ghost"; toast(S.locked?"Reading locked":"Live again"); drawLevel();
};

/* ---------- INPUTS ---------- */
$("slopeManual").addEventListener("input",e=>{ if(!S.live||S.locked){} S.slope=parseFloat(e.target.value)||0; if(!S.live){} updateAll(true); });
document.querySelectorAll('[data-step]').forEach(b=>{
  b.onclick=()=>{ const k=b.dataset.step, d=parseFloat(b.dataset.d);
    if(k==="length"){ const stepFt=S.metric? d*0.5/FT2M : d; S.length=clamp(S.length+stepFt,1,100);
      $("length").value=S.metric? (S.length*FT2M).toFixed(1): Math.round(S.length); }
    if(k==="stimp"){ S.stimp=clamp((parseFloat($("stimp").value)||0)+d,6,15); $("stimp").value=S.stimp; }
    if(k==="roll"){ const r=clamp((parseFloat($("roll").value)||0)+d,2,20); $("roll").value=r; calcStimp(); }
    if(k==="calfw"){ CAL.fw=clamp((parseFloat($("calfw").value)||0.8)+d,0.5,1.2); $("calfw").value=CAL.fw.toFixed(2); store.set("giq_cal",CAL); }
    if(k==="calarm"){ CAL.arm=clamp((parseFloat($("calarm").value)||25)+d,15,36); $("calarm").value=CAL.arm; store.set("giq_cal",CAL); }
    if(k==="calback"){ CAL.back=clamp((parseFloat($("calback").value)||6)+d,0,15); $("calback").value=CAL.back; store.set("giq_cal",CAL); }
    updateAll(true);
  };
});
$("length").addEventListener("input",e=>{ const v=parseFloat(e.target.value)||1;
  S.length=clamp(S.metric? v/FT2M : v,1,100); updateAll(true); });
$("stimp").addEventListener("input",e=>{ S.stimp=clamp(parseFloat(e.target.value)||6,6,15); updateAll(true); });

/* ---------- STIMP FINDER ---------- */
function calcStimp(){
  // roll distance D (ft) from a smooth medium stroke; map paces->ft (1 pace=3ft) then to stimp.
  // Heuristic: a "medium" practice roll ~ travels about (stimp+? ). We tie roll distance to stimp:
  // assume the calibration stroke leaves the putter at ~ a speed that on stimp-10 rolls ~24ft (8 paces).
  // stimp ≈ 10 * (D/24).  (linear, since stop distance ∝ stimp for fixed launch speed)
  const paces=parseFloat($("roll").value)||6; const D=paces*3;
  const stimp=clamp(10*D/24,6,15);
  $("stimpResult").textContent="≈ stimp "+stimp.toFixed(1);
  $("stimpResult").dataset.val=stimp.toFixed(1);
}
$("stimpFinderBtn").onclick=()=>{ $("stimpModal").classList.add("on"); calcStimp(); };
$("stimpClose").onclick=()=>$("stimpModal").classList.remove("on");
$("stimpApply").onclick=()=>{ const v=parseFloat($("stimpResult").dataset.val||10); S.stimp=v; $("stimp").value=v; $("stimpModal").classList.remove("on"); updateAll(true); toast("Speed set to "+v.toFixed(1)); };
$("paceOffBtn").onclick=()=>$("paceModal").classList.add("on");
$("paceClose").onclick=()=>$("paceModal").classList.remove("on");

/* ---------- toast ---------- */
let tT; function toast(m){ const t=$("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove("on"),1600); }

/* ---------- update loop ---------- */
let raf=null;
function updateAll(force){
  $("slopeNum").textContent=S.slope.toFixed(1);
  const dl=dirWord(S.dirDeg);
  $("dirLabel").textContent = S.slope<0.3? "Essentially flat" : dl;
  drawLevel(); drawClock();
  if(raf) cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{ try{ renderRead(); }catch(e){console.warn(e);} });
}
function dirWord(deg){
  const dirs=[[0,"downhill putt"],[90,"breaks right → left"],[180,"uphill putt"],[270,"breaks left → right"]];
  // nearest descriptive
  let best="sidehill", bd=999;
  const labels=[[0,"runs downhill"],[45,"downhill, breaks R→L"],[90,"breaks right→left"],[135,"uphill, breaks R→L"],[180,"runs uphill"],[225,"uphill, breaks L→R"],[270,"breaks left→right"],[315,"downhill, breaks L→R"],[360,"runs downhill"]];
  for(const [a,l] of labels){ const d=Math.abs(a-deg); if(d<bd){bd=d;best=l;} }
  return best;
}

/* ---------- UNITS ---------- */
const FT2M=0.3048, IN2CM=2.54;
function fmtLen(ft,dp){ return S.metric? (ft*FT2M).toFixed(dp==null?1:dp) : ft.toFixed(dp==null?(ft<10?1:0):dp); }
function fmtBr(inch){ return S.metric? (inch*IN2CM).toFixed(0) : inch.toFixed(1); }
const uLen=()=>S.metric?"m":"ft", uBr=()=>S.metric?"cm":"in";
$("unitsBtn").onclick=()=>{ S.metric=!S.metric; $("unitsBtn").textContent=S.metric?"m / cm":"ft / in";
  $("lenUnitLbl").textContent=S.metric?"(m)":"(ft)";
  $("length").value=S.metric? (S.length*FT2M).toFixed(1) : Math.round(S.length);
  document.querySelectorAll(".trUnit").forEach(el=>el.textContent=S.metric?"cm":"in");
  saveStats(); updateAll(true); if(TR.active) trRenderGuess(); };

/* ---------- GRAIN ---------- */
document.querySelectorAll("#grainRow button").forEach(b=>{
  b.onclick=()=>{ S.grain=parseFloat(b.dataset.grain);
    document.querySelectorAll("#grainRow button").forEach(x=>x.className= x===b?"primary":"ghost");
    updateAll(true); };
});

/* ---------- SAFE STORAGE (falls back to memory) ---------- */
const store=(()=>{ let mem={};
  try{ const k="__giq_t"; window.localStorage.setItem(k,"1"); window.localStorage.removeItem(k);
    return { get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
             set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };
  }catch(e){ return { get:k=>mem[k]||null, set:(k,v)=>{mem[k]=v} }; }
})();

/* ---------- TRAINER ---------- */
const TR={active:false, putt:null, truth:null, stats: store.get("giq_stats")||{n:0,errSum:0,streak:0,best:0,metric:false} };
function saveStats(){ TR.stats.metric=S.metric; store.set("giq_stats",TR.stats); }
function trShowStats(){
  const s=TR.stats;
  $("trStats").innerHTML = s.n===0 ? "" :
    `<b style="color:var(--ink)">Your record:</b> ${s.n} putts read · avg error <b style="color:var(--ink)">${fmtBr(s.errSum/s.n)} ${uBr()}</b> · best streak <b style="color:var(--ink)">${s.best}</b> within a cup.`;
}
function trDeal(){
  // realistic distribution: mostly 5–20ft, slopes 1–3.5%, any direction, current green speed
  const L=Math.round(4+Math.random()*18);
  const slope=Math.round((0.8+Math.random()*2.8)*10)/10;
  const dirs=[60,75,90,105,120,240,255,270,285,300, 30,150,210,330];  // mostly sidehill, some quartering
  const dirDeg=dirs[Math.floor(Math.random()*dirs.length)];
  TR.putt={L,slope,dirDeg,stimp:effStimp()};
  const r=read({L,slope,dirDeg,stimp:TR.putt.stimp});
  TR.truth=r;
  const side = Math.sin(dirDeg*Math.PI/180)>0 ? "right":"left";   // downhill side
  const breakDir = side==="right" ? "right → left" : "left → right";
  const upDown = Math.cos(dirDeg*Math.PI/180)>0.35? " and runs away downhill" : Math.cos(dirDeg*Math.PI/180)<-0.35? " into the hill" : "";
  $("trScenario").innerHTML=
    `A <b class="mono">${fmtLen(L,S.metric?1:0)} ${uLen()}</b> putt on a <b class="mono">${slope.toFixed(1)}%</b> slope, green speed <b class="mono">${TR.putt.stimp.toFixed(1)}</b>. The green falls to your <b>${side}</b>${upDown} — it breaks <b>${breakDir}</b>. How much do you play?`;
  const maxIn=S.metric?  Math.round(40*IN2CM) : 40;
  trSetSlider();
  trRenderGuess();
  $("trIdle").style.display="none"; $("trResult").style.display="none"; $("trQuiz").style.display="block";
  TR.active=true;
}
function trRenderGuess(){
  const v=parseFloat($("trGuess").value);
  if(TRFMT==="fingers"){
    $("trGuessVal").textContent=v.toFixed(2);
    $("trGuessCups").textContent=(v*inchesPerFinger(TR.putt?TR.putt.L:10)/CUP).toFixed(1);
    document.querySelectorAll("#trQuiz .trUnit").forEach(el=>el.textContent="fingers");
  } else {
    const inch=S.metric? v/IN2CM : v;
    $("trGuessVal").textContent=v.toFixed(S.metric?0:1);
    $("trGuessCups").textContent=(inch/CUP).toFixed(1);
    document.querySelectorAll("#trQuiz .trUnit").forEach(el=>el.textContent=S.metric?"cm":"in");
  }
}
$("trGuess").addEventListener("input",trRenderGuess);
function trScore(){
  const guessIn = trGuessInches();
  const trueIn = Math.abs(TR.truth.aimFt*12);
  const err=Math.abs(guessIn-trueIn);
  const showF = TRFMT==="fingers";
  $("trYou").textContent = showF? (guessIn/inchesPerFinger(TR.putt.L)).toFixed(1)+" f" : fmtBr(guessIn)+" "+uBr();
  $("trTrue").textContent= showF? fingersFor(trueIn,TR.putt.L).toFixed(1)+" f" : fmtBr(trueIn)+" "+uBr();
  let verdict, good=false;
  if(err<=1.5){ verdict="🎯 Tour-level read."; good=true; }
  else if(err<=CUP){ verdict="✅ Inside a cup — that one drops."; good=true; }
  else if(err<=CUP*2){ verdict="Close — lip-out territory."; }
  else if(guessIn<trueIn){ verdict="Under-read — the classic amateur miss (low side)."; }
  else { verdict="Over-read — you gave it too much."; }
  $("trVerdict").textContent=verdict;
  $("trVerdict").className="callout"+(good?"":" warn");
  const plays=TR.truth.Leff;
  $("trDetail").textContent=`Pace: plays like ${fmtLen(plays)} ${uLen()}${TR.truth.grade>0.008?" (uphill — firm)":TR.truth.grade<-0.008?" (downhill — soft)":""}.`;
  TR.stats.n++; TR.stats.errSum+=err;
  TR.stats.streak = err<=CUP ? TR.stats.streak+1 : 0;
  TR.stats.best=Math.max(TR.stats.best,TR.stats.streak);
  saveStats();
  $("trQuiz").style.display="none"; $("trResult").style.display="block";
}
$("trStart").onclick=trDeal;
$("trNext").onclick=trDeal;
$("trSkip").onclick=trDeal;
$("trReveal").onclick=trScore;
$("trDone").onclick=()=>{ TR.active=false; $("trQuiz").style.display="none"; $("trResult").style.display="none"; $("trIdle").style.display="block"; trShowStats(); };

/* ---------- FINGERS (AimPoint geometry) ---------- */
const CAL = Object.assign({fw:0.80, arm:25, back:6}, store.get("giq_cal")||{});
function inchesPerFinger(Lft){ return CAL.fw * (Lft*12 + CAL.back*12) / CAL.arm; }
function fingersFor(aimIn,Lft){ return Math.abs(aimIn)/inchesPerFinger(Lft); }
function calBind(id,key,min,max){
  const el=$(id); el.value=CAL[key];
  el.addEventListener("input",()=>{ CAL[key]=clamp(parseFloat(el.value)||CAL[key],min,max); store.set("giq_cal",CAL); updateAll(true); });
}

/* ---------- COURSE NOTEBOOK ---------- */
let COURSES = store.get("giq_courses")||[];
function renderCourses(){
  const wrap=$("courseChips");
  wrap.innerHTML = COURSES.map((c,i)=>
    `<span class="chip" data-i="${i}">${c.name} <b>${c.stimp}</b>${c.grain? (c.grain>0?" ↓grain":" ↑grain"):""} <span class="x" data-x="${i}">×</span></span>`).join("");
  wrap.querySelectorAll(".chip").forEach(ch=>{
    ch.onclick=e=>{
      if(e.target.dataset.x!==undefined){ COURSES.splice(+e.target.dataset.x,1); store.set("giq_courses",COURSES); renderCourses(); return; }
      const c=COURSES[+ch.dataset.i]; S.stimp=c.stimp; $("stimp").value=c.stimp; S.grain=c.grain||0;
      document.querySelectorAll("#grainRow button").forEach(b=>b.className= parseFloat(b.dataset.grain)===S.grain?"primary":"ghost");
      toast("Loaded "+c.name); updateAll(true);
    };
  });
}
$("courseSaveBtn").onclick=()=>{ const f=$("courseForm"); f.style.display=f.style.display==="none"?"block":"none"; if(f.style.display==="block")$("courseName").focus(); };
$("courseConfirm").onclick=()=>{
  const name=($("courseName").value||"").trim(); if(!name){ toast("Name the course"); return; }
  COURSES=COURSES.filter(c=>c.name.toLowerCase()!==name.toLowerCase());
  COURSES.unshift({name, stimp:S.stimp, grain:S.grain}); COURSES=COURSES.slice(0,8);
  store.set("giq_courses",COURSES); $("courseName").value=""; $("courseForm").style.display="none";
  renderCourses(); toast("Saved "+name);
};

/* ---------- TRAINER ANSWER FORMAT ---------- */
let TRFMT="len";
document.querySelectorAll("#trFmtSeg button").forEach(b=>{
  b.onclick=()=>{ TRFMT=b.dataset.fmt;
    document.querySelectorAll("#trFmtSeg button").forEach(x=>x.className=x===b?"on":"");
    trSetSlider(); trRenderGuess(); };
});
function trSetSlider(){
  if(!TR.putt) return;
  if(TRFMT==="fingers"){ $("trGuess").min=0; $("trGuess").max=8; $("trGuess").step=0.25; $("trGuess").value=1;
    $("trGuessLabel").innerHTML="Your read — break (fingers, high side)"; }
  else { $("trGuess").min=0; $("trGuess").max=S.metric?100:40; $("trGuess").step=0.5; $("trGuess").value=S.metric?15:6;
    $("trGuessLabel").innerHTML=`Your read — break (<span class="trUnit">${S.metric?"cm":"inches"}</span>, high side)`; }
}
function trGuessInches(){
  const v=parseFloat($("trGuess").value);
  if(TRFMT==="fingers") return v*inchesPerFinger(TR.putt.L);
  return S.metric? v/IN2CM : v;
}

/* ---------- FEEL TRAINER ---------- */
const FL={stats: store.get("giq_feel")||{n:0,errSum:0,best:99}};
function flShowStats(){
  const s=FL.stats;
  $("flStats").innerHTML = s.n===0? "" :
    `<b style="color:var(--ink)">Your record:</b> ${s.n} reads · avg error <b style="color:var(--ink)">${(s.errSum/s.n).toFixed(2)}%</b> · best <b style="color:var(--ink)">${s.best.toFixed(2)}%</b>.`;
}
$("flStart").onclick=()=>{
  if(!S.live){ showTab("read"); toast("Start the sensor first (card 1)"); return; }
  S.locked=false; $("lockBtn").textContent="Lock"; $("lockBtn").className="ghost";
  $("slopeNum").parentElement.classList.add("blurred"); $("level").classList.add("blurred"); $("dirLabel").classList.add("blurred"); $("slopeManual").classList.add("blurred");
  $("flIdle").style.display="none"; $("flResult").style.display="none"; $("flQuiz").style.display="block";
};
$("flGuess").addEventListener("input",()=>$("flGuessVal").textContent=parseFloat($("flGuess").value).toFixed(2));
function flUnblur(){ ["slopeNum","level","dirLabel","slopeManual"].forEach(id=>{const el=$(id); (id==="slopeNum"?el.parentElement:el).classList.remove("blurred");}); }
$("flReveal").onclick=()=>{
  const truth=S.slope, guess=parseFloat($("flGuess").value), err=Math.abs(truth-guess);
  flUnblur();
  $("flYou").textContent=guess.toFixed(2)+"%"; $("flTrue").textContent=truth.toFixed(2)+"%";
  let v;
  if(err<=0.25) v="🎯 Elite feet — tour caddies read like this.";
  else if(err<=0.5) v="✅ Within half a percent — green-reading money.";
  else if(err<=1.0) v="Solid — keep calibrating.";
  else v=(guess<truth? "You under-felt it — slopes are sneakier than they look." : "You over-felt it — trust the subtle read.");
  $("flVerdict").textContent=v; $("flVerdict").className="callout"+(err<=0.5?"":" warn");
  FL.stats.n++; FL.stats.errSum+=err; FL.stats.best=Math.min(FL.stats.best,err); store.set("giq_feel",FL.stats);
  $("flQuiz").style.display="none"; $("flResult").style.display="block";
};
$("flNext").onclick=()=>$("flStart").onclick();
$("flCancel").onclick=$("flDone").onclick=()=>{ flUnblur(); $("flQuiz").style.display="none"; $("flResult").style.display="none"; $("flIdle").style.display="block"; flShowStats(); };

/* ---------- TABS ---------- */
function showTab(name){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on", p.id==="page-"+name));
  document.querySelectorAll("#tabbar button").forEach(b=>b.classList.toggle("on", b.dataset.page===name));
  window.scrollTo({top:0});
}
document.querySelectorAll("#tabbar button").forEach(b=>{ b.onclick=()=>showTab(b.dataset.page); });


/* ---------- PUTT LOG & PATTERNS ---------- */
let PLOG = store.get("giq_log")||[];
document.querySelectorAll("[data-log]").forEach(b=>{
  b.onclick=()=>{
    PLOG.push({t:Date.now(), L:Math.round(S.length*10)/10, slope:S.slope, dir:S.dirDeg, res:b.dataset.log});
    if(PLOG.length>800) PLOG=PLOG.slice(-800);
    store.set("giq_log",PLOG);
    const msgs={made:"Putt logged — made it 🎯", high:"Logged: missed high", low:"Logged: missed low", short:"Logged: short", long:"Logged: long"};
    toast(msgs[b.dataset.log]||"Logged");
    renderInsights();
  };
});
function bucketOf(L){ return L<6?0 : L<12?1 : L<25?2 : 3; }
const BUCKET_LBL=["< 6 ft","6–12 ft","12–25 ft","25+ ft"];
function renderInsights(){
  const el=$("insightsBody"); if(!el) return;
  const n=PLOG.length;
  if(n<5){ el.innerHTML=`Log real putts from the Read tab (Made / Miss high / Miss low / Short / Long) and your make rates and miss bias show up here.${n?` <b style="color:var(--ink)">${n}/5 logged</b> — keep going.`:""}`; return; }
  const made=PLOG.filter(p=>p.res==="made").length;
  // per-bucket
  let rows="";
  for(let b=0;b<4;b++){
    const inB=PLOG.filter(p=>bucketOf(p.L)===b);
    if(!inB.length) continue;
    const mk=inB.filter(p=>p.res==="made").length;
    const pct=Math.round(100*mk/inB.length);
    rows+=`<div class="insight-line"><span>${BUCKET_LBL[b]}</span><b>${pct}% · ${mk}/${inB.length}</b></div>
           <div class="bar"><i style="width:${pct}%"></i></div>`;
  }
  // direction bias
  const hi=PLOG.filter(p=>p.res==="high").length, lo=PLOG.filter(p=>p.res==="low").length;
  const sh=PLOG.filter(p=>p.res==="short").length, lg=PLOG.filter(p=>p.res==="long").length;
  let verdicts="";
  if(hi+lo>=6){
    const loPct=Math.round(100*lo/(hi+lo));
    if(loPct>=65) verdicts+=`<div class="verdict"><b>${loPct}% of your line misses are low</b> — the classic under-read. Add roughly half a cup to a full cup to your instinct reads, or trust the app number even when it looks like too much.</div>`;
    else if(loPct<=35) verdicts+=`<div class="verdict"><b>${100-loPct}% of your line misses are high</b> — you're over-reading. Take a little break off, or firm up your pace so the ball holds its line.</div>`;
    else verdicts+=`<div class="verdict">Your line misses are balanced (${loPct}% low / ${100-loPct}% high) — your reads are honest. Keep sharpening pace.</div>`;
  }
  if(sh+lg>=6){
    const shPct=Math.round(100*sh/(sh+lg));
    if(shPct>=65) verdicts+=`<div class="verdict"><b>${shPct}% of your pace misses are short</b> — dying putts at the front edge never go in. Practice rolling everything 1–2 ft past.</div>`;
    else if(shPct<=35) verdicts+=`<div class="verdict"><b>${100-shPct}% of your pace misses are long</b> — ease off and let the read work; hot putts take the break out and lip out.</div>`;
  }
  el.innerHTML=`
    <div class="insight-line" style="margin-top:0"><span>Overall</span><b>${Math.round(100*made/n)}% made · ${made}/${n}</b></div>
    <div class="bar"><i style="width:${Math.round(100*made/n)}%"></i></div>
    ${rows}${verdicts}
    <div class="btnrow"><button class="ghost" id="logResetBtn" style="font-size:11px">Clear log</button></div>`;
  const rb=$("logResetBtn"); if(rb) rb.onclick=()=>{ if(PLOG.length){ PLOG=[]; store.set("giq_log",PLOG); renderInsights(); toast("Log cleared"); } };
}

/* ---------- SERVICE WORKER ---------- */
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}

/* init */
$("length").value=S.length; $("stimp").value=S.stimp; $("slopeManual").value=S.slope;
if(TR.stats.metric){ S.metric=true; $("unitsBtn").textContent="m / cm"; document.querySelectorAll(".trUnit").forEach(el=>el.textContent="cm"); }
trShowStats();
calBind("calfw","fw",0.5,1.2); calBind("calarm","arm",15,36); calBind("calback","back",0,15);
renderCourses(); flShowStats(); renderInsights();
updateAll(true);
