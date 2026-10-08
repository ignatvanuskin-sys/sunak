(() => {
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  window.scrollTo(0, document.documentElement.scrollHeight);
  const out = {};
  out.scrollY = Math.round(window.scrollY);
  out.docH = document.documentElement.scrollHeight;
  out.iw = window.innerWidth; out.ih = window.innerHeight;
  const bar = $$('.mobilebar').find(e=>getComputedStyle(e).position==='fixed');
  const cp = $$('.footer *').filter(e=>/©/.test(e.textContent) && e.children.length===0);
  const copy = cp[0] || null;
  if (bar){ const r=bar.getBoundingClientRect(); out.bar = {top:Math.round(r.top), h:Math.round(r.height), bottom:Math.round(r.bottom)}; }
  else out.bar = null;
  if (copy){ const r=copy.getBoundingClientRect(); out.copy = {text:copy.textContent.trim().slice(0,60), top:Math.round(r.top), bottom:Math.round(r.bottom), visible: r.bottom<=window.innerHeight+1 && r.top>=0}; 
    if (bar && out.bar) out.copyBlockedByBar = r.bottom > out.bar.top - 1;
  } else out.copy = null;
  // is any content hidden behind the bar? check elements at bottom area
  out.overlap = (bar && copy) ? (copy.getBoundingClientRect().bottom > bar.getBoundingClientRect().top) : null;
  return JSON.stringify(out);
})()
