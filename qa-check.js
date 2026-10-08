(() => {
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const cs = (e)=>e?getComputedStyle(e):null;
  const w = window.innerWidth;
  const out = { w };
  out.scrollWidth = document.documentElement.scrollWidth;
  out.hScroll = document.documentElement.scrollWidth > w + 1;
  // overflow offenders (exclude known clipped marquee)
  const off = [];
  $$('body *').forEach(e=>{
    if(e.closest && e.closest('.marquee')) return;
    const r = e.getBoundingClientRect();
    if (r.right > w + 1 && r.width>0 && e.offsetWidth>0) off.push({t:e.tagName, cls:(e.className||'').toString().slice(0,40), right:Math.round(r.right)});
  });
  out.overflowCount = off.length;
  out.overflowSample = off.slice(0,8);

  const hdr = $('#header');
  if (hdr){
    const hr = hdr.getBoundingClientRect();
    out.header = {h:Math.round(hr.height)};
    // header row items overlapping horizontally?
    const row = $$('#header nav a, #header .header__phone, #header .btn, #header a').filter(e=>e.offsetWidth>0);
    out.headerRowItems = row.map(e=>{const r=e.getBoundingClientRect();return {t:e.textContent.replace(/\s+/g,' ').trim().slice(0,20), l:Math.round(r.left), r:Math.round(r.right), top:Math.round(r.top)};});
  }
  const h1 = $('.hero h1');
  if (h1) out.h1 = {sw:h1.scrollWidth, cw:h1.clientWidth, truncated: h1.scrollWidth>h1.clientWidth+1, h:Math.round(h1.getBoundingClientRect().height)};
  const callBtn = $$('.hero a, .hero button').filter(e=>/Позвонить/.test(e.textContent));
  out.heroCallCount = callBtn.length;
  if (callBtn[0]){
    const b = callBtn[0]; const s = cs(b);
    out.heroCall = {color:s.color, bg:s.backgroundColor, vis:(b.offsetWidth>0&&b.offsetHeight>0), w:Math.round(b.getBoundingClientRect().width), h:Math.round(b.getBoundingClientRect().height), right:Math.round(b.getBoundingClientRect().right)};
  }
  const bookBtn = $$('.hero a, .hero button').filter(e=>/Записаться/.test(e.textContent));
  if (bookBtn[0]){ const r=bookBtn[0].getBoundingClientRect(); out.heroBook = {w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top)}; }
  const facts = $('.hero__facts-wrap');
  if (facts){
    const kids = Array.from(facts.children);
    const rows = new Set(kids.map(e=>Math.round(e.getBoundingClientRect().top)));
    out.facts = {count:kids.length, rows:rows.size, h:Math.round(facts.getBoundingClientRect().height), texts:kids.map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,18))};
  }
  const bar = $$('.mobilebar').find(e=>cs(e).position==='fixed');
  if(bar){const r=bar.getBoundingClientRect(); out.bar={top:Math.round(r.top),h:Math.round(r.height),bottom:Math.round(r.bottom)};}
  const cp = $$('.footer *').filter(e=>/©/.test(e.textContent) && e.children.length===0);
  if(cp[0]){const r=cp[0].getBoundingClientRect(); out.copyright={text:cp[0].textContent.replace(/\s+/g,' ').trim().slice(0,60), bottom:Math.round(r.bottom), visibleWhenBottom: r.bottom<=window.innerHeight+1 && r.top>=0, blockedByBar: bar? r.bottom>bar.getBoundingClientRect().top-1 : null};}
  const mt = $('.marquee__track');
  if (mt) out.marqueeAnim = cs(mt).animationName;

  // contrast
  function lum(c){const m=c.match(/\d+(\.\d+)?/g); if(!m)return null; let [r,g,b]=m.slice(0,3).map(Number); const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);}
  function ratio(fg,bg){const L1=lum(fg),L2=lum(bg); if(L1==null||L2==null)return null; const a=Math.max(L1,L2),b=Math.min(L1,L2); return +((a+0.05)/(b+0.05)).toFixed(2);}
  function effBg(el){let n=el; while(n){const s=cs(n); if(s.backgroundColor && s.backgroundColor!=='rgba(0, 0, 0, 0)') return s.backgroundColor; n=n.parentElement;} return 'rgb(255,255,255)';}
  const cps=[];
  cps.push({name:'mainText/body', fg:cs(document.body).color, bg:'rgb(8, 9, 11)'});
  const lead=$('.lead'); if(lead) cps.push({name:'.lead', fg:cs(lead).color, bg:'rgb(8, 9, 11)'});
  const note=$('.note-line'); if(note) cps.push({name:'.note-line', fg:cs(note).color, bg:'rgb(8, 9, 11)'});
  const label=$('.label'); if(label) cps.push({name:'.label', fg:cs(label).color, bg:'rgb(8, 9, 11)'});
  const bp=$('.btn--primary'); if(bp) cps.push({name:'.btn--primary', fg:cs(bp).color, bg:cs(bp).backgroundColor});
  const wc=$('.why-card p'); if(wc) cps.push({name:'.why-card p', fg:cs(wc).color, bg:'rgb(20, 23, 27)'});
  out.contrast = cps.map(c=>({name:c.name, fg:c.fg, bg:c.bg, ratio:ratio(c.fg,c.bg), pass45: ratio(c.fg,c.bg)>=4.5}));
  return JSON.stringify(out);
})()
