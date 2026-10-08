(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const R = el => { if(!el) return null; const r = el.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}; };
  const out = {};
  const sec = (n,f)=>{ try{ out[n]=f(); }catch(e){ out[n]='ERR: '+e.message; } };

  sec('pageFooter', () => {
    const ft = [...document.querySelectorAll('footer')].find(f => (f.className||'').includes('border-t') && (f.className||'').includes('bg-night-900'));
    if (!ft) return 'not found';
    const g = ft.querySelector('div[class*="md:grid-cols"]') || ft.querySelector('div[class*="grid"]');
    const inner = ft.firstElementChild;
    return {
      cls: ft.className, bg: cs(ft).backgroundColor, pad: cs(ft).padding, borderTop: cs(ft).borderTop, rect: R(ft),
      gridCls: g ? g.className : null, gridCols: g ? cs(g).gridTemplateColumns : null, gap: g ? cs(g).gap : null,
      cols: g ? [...g.children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,100), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,140), html:c.outerHTML.slice(0,900)})) : null,
      text: ft.innerText.replace(/\s+/g,' ').trim().slice(0,700),
      html: ft.outerHTML.slice(0,2200),
      wordmark: (()=>{ const w=[...ft.querySelectorAll('*')].find(e=>!e.children.length && /YASIRA/.test(e.textContent||'') && cs(e).fontFamily.includes('Georgia')); return w?{font:cs(w).fontFamily,fs:cs(w).fontSize,fw:cs(w).fontWeight,ls:cs(w).letterSpacing,color:cs(w).color,txt:w.textContent.trim()}:null; })()
    };
  });

  sec('heroFactBar', () => {
    const bar = document.querySelector('#top > div[class*="backdrop-blur"]');
    if (!bar) return 'not found';
    const grid = bar.querySelector('div[class*="grid"]') || bar.firstElementChild;
    const items = grid ? [...grid.children] : [];
    return {
      barCls: bar.className, barBg: cs(bar).backgroundColor, barBorderTop: cs(bar).borderTop, rect: R(bar), backdrop: cs(bar).backdropFilter,
      gridCls: grid ? grid.className : null, gridCols: grid ? cs(grid).gridTemplateColumns : null, gridDisplay: grid ? cs(grid).display : null, gap: grid ? cs(grid).gap : null,
      separate: items.some(i => cs(i).borderLeftWidth !== '0px' || parseFloat(cs(i).borderLeftWidth) > 0),
      items: items.map(i => ({cls:(typeof i.className==='string'?i.className:'').slice(0,110), rect:R(i), borderLeft:cs(i).borderLeft, pad:cs(i).padding, txt:(i.innerText||'').replace(/\s+/g,' ').trim(), html:i.outerHTML.slice(0,420),
        label: (()=>{const l=i.querySelector('.label'); return l?{txt:l.textContent.trim(), fs:cs(l).fontSize, ls:cs(l).letterSpacing, color:cs(l).color, font:cs(l).fontFamily.slice(0,18)}:null;})(),
        value: (()=>{const v=[...i.querySelectorAll('span,p,div')].find(e=>!e.children.length && e.textContent.trim() && !(e.className||'').includes('label')); return v?{txt:v.textContent.trim(), fs:cs(v).fontSize, fw:cs(v).fontWeight, color:cs(v).color}:null;})()
      }))
    };
  });

  sec('heroEyebrow', () => {
    const h1 = document.querySelector('#top h1');
    const wrap = h1 ? h1.parentElement : null;
    const eyebrow = wrap && wrap.firstElementChild;
    return eyebrow ? {cls:(typeof eyebrow.className==='string'?eyebrow.className:'').slice(0,160), rect:R(eyebrow), html:eyebrow.outerHTML.slice(0,1000),
      text: eyebrow.innerText.replace(/\s+/g,' ').trim(),
      kids: [...eyebrow.querySelectorAll('*')].filter(e=>!e.children.length||e.tagName==='SPAN').slice(0,8).map(e=>({tag:e.tagName.toLowerCase(), txt:(e.innerText||'').trim().slice(0,30), fs:cs(e).fontSize, fw:cs(e).fontWeight, ls:cs(e).letterSpacing, color:cs(e).color, bg:cs(e).backgroundColor, radius:cs(e).borderRadius, pad:cs(e).padding, border:cs(e).border, font:cs(e).fontFamily.slice(0,16)}))} : 'not found';
  });

  sec('logo', () => {
    const a = document.querySelector('header a');
    return a ? {html: a.outerHTML.slice(0,1200), kids: [...a.querySelectorAll('*')].filter(e=>!e.children.length).slice(0,6).map(e=>({tag:e.tagName.toLowerCase(), txt:e.textContent.trim().slice(0,20), fs:cs(e).fontSize, fw:cs(e).fontWeight, ls:cs(e).letterSpacing, color:cs(e).color, font:cs(e).fontFamily.slice(0,20), bg:cs(e).backgroundColor, radius:cs(e).borderRadius, pad:cs(e).padding}))} : 'no logo';
  });

  sec('reviewPagination', () => {
    const rv = document.querySelector('#reviews');
    const el = [...rv.querySelectorAll('*')].find(e => /^Отзыв\s*\d+\s*из\s*\d+$/.test((e.innerText||'').trim()));
    const wrap = el ? el.parentElement : null;
    return wrap ? {wrapCls:(typeof wrap.className==='string'?wrap.className:'').slice(0,160), wrapRect:R(wrap), html:wrap.outerHTML.slice(0,900),
      kids: [...wrap.querySelectorAll('*')].slice(0,14).map(e=>({tag:e.tagName.toLowerCase(), txt:(e.innerText||'').trim().slice(0,20), fs:cs(e).fontSize, color:cs(e).color, bg:cs(e).backgroundColor, radius:cs(e).borderRadius, w:R(e)?R(e).w:0, h:R(e)?R(e).h:0, cls:(typeof e.className==='string'?e.className:'').slice(0,90)}))} : 'not found';
  });

  sec('utils', () => {
    const want = ['.label','.display','.shell','.grain','.no-scrollbar','.spotlight','.card-surface','.marquee','.marquee-track','.hero-viewport','.tracing-track','.beams','.pb-mobile-bar','[data-reveal]','.beam-path','.tracing-fill'];
    const found = {};
    for (const s of document.styleSheets) {
      try { for (const r of s.cssRules) {
        const sel = r.selectorText || '';
        if (!sel) continue;
        for (const w of want) if (sel.split(',').some(x => x.trim() === w || x.trim().startsWith(w+' ') || x.trim().endsWith(w))) {
          found[w] = (found[w]||'') + r.cssText.replace(/\s+/g,' ').slice(0,320) + '\n';
        }
      } } catch(e){}
    }
    return found;
  });

  sec('hoverStates', () => {
    const t = [...document.querySelectorAll('a,button')].filter(e=>(e.className||'').toString().includes('hover:bg-brand')).slice(0,2);
    return t.map(e=>({txt:(e.innerText||'').trim().slice(0,25), cls:(typeof e.className==='string'?e.className:'').slice(0,160)}));
  });

  sec('inputs', () => ({
    inputs: [...document.querySelectorAll('input,textarea,select')].map(i=>({tag:i.tagName.toLowerCase(), type:i.type, rect:R(i), bg:cs(i).backgroundColor, border:cs(i).border, radius:cs(i).borderRadius, h:R(i)?R(i).h:0, fs:cs(i).fontSize, color:cs(i).color})),
    forms: document.querySelectorAll('form').length,
    buttonCount: document.querySelectorAll('button').length
  }));

  return out;
})()