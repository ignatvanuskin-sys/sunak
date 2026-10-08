(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const R = el => { if(!el) return null; const r = el.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}; };
  const kids = el => el ? [...el.children] : [];
  const info = (el, extra=[]) => {
    if (!el) return null;
    const s = cs(el); const o = {rect: R(el), tag: el.tagName.toLowerCase(),
      cls: (typeof el.className==='string'?el.className:'').slice(0,160),
      bg: s.backgroundColor, color: s.color, pad: s.padding, margin: s.margin,
      radius: s.borderRadius, border: s.border, shadow: s.boxShadow,
      display: s.display, grid: s.gridTemplateColumns, gap: s.gap,
      position: s.position, top: s.top, zIndex: s.zIndex, backdrop: s.backdropFilter,
      font: s.fontFamily.slice(0,25), fs: s.fontSize, fw: s.fontWeight,
      align: s.alignItems, justify: s.justifyContent};
    extra.forEach(p => o[p] = s[p]);
    return o;
  };
  const out = {};
  const sec = (name, fn) => { try { out[name] = fn(); } catch(e) { out[name] = 'ERR: ' + e.message; } };

  sec('header', () => {
    const hdr = document.querySelector('header');
    if (!hdr) return 'no header element';
    return {
      info: info(hdr, ['height','minHeight','borderBottom','transition']),
      klass: hdr.className,
      parentCls: hdr.parentElement.className,
      text: (hdr.innerText||'').replace(/\s+/g,' ').trim().slice(0,200),
      kids: kids(hdr.firstElementChild).map(e => ({tag:e.tagName.toLowerCase(), cls:(typeof e.className==='string'?e.className:'').slice(0,110), rect:R(e), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)})),
      navLinks: [...hdr.querySelectorAll('nav a')].map(a=>({t:a.innerText.trim(), fs:cs(a).fontSize, color:cs(a).color, pad:cs(a).padding, radius:cs(a).borderRadius, h:R(a).h}))
    };
  });

  sec('hero', () => {
    const hero = document.querySelector('#top');
    if (!hero) return 'no hero';
    const lbl = [...hero.querySelectorAll('*')].filter(e => !e.children.length && /^(ГОРОД|ПРОФИЛЬ|АДРЕС|СВЯЗЬ)$/.test((e.textContent||'').trim()));
    let gridEl = null; let node = lbl[0];
    for (let i=0;i<6 && node;i++) { node = node.parentElement; if (node && cs(node).display.includes('grid')) { gridEl = node; break; } }
    return {
      info: info(hero, ['height','minHeight']),
      children: kids(hero).map(e => ({tag:e.tagName.toLowerCase(), cls:(typeof e.className==='string'?e.className:'').slice(0,130), rect:R(e), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)})),
      h1: info(hero.querySelector('h1')),
      h1Text: (hero.querySelector('h1')||{}).textContent,
      lead: info([...hero.querySelectorAll('p')].find(p => (p.innerText||'').length > 60)),
      eyebrow: (() => { const e = [...hero.querySelectorAll('span,p,div')].find(x=>!x.children.length && /ЛЕГКОВОЙ/.test(x.textContent||'')); return e ? {txt:e.textContent.trim(), el: info(e)} : null; })(),
      factLabels: lbl.map(e=>e.textContent.trim()),
      factGrid: info(gridEl),
      factItems: kids(gridEl).map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,120), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, pad:cs(c).padding, borderTop:cs(c).borderTop})),
      factHtml: gridEl ? gridEl.outerHTML.slice(0,900) : null,
      rating: (() => { const e = [...hero.querySelectorAll('*')].find(x=>/^4,\d/.test((x.textContent||'').trim()) && x.children.length<4); return e ? {txt:e.textContent.trim().slice(0,90), el:info(e)} : null; })(),
      btns: [...hero.querySelectorAll('a,button')].map(b => ({txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,34), rect:R(b), bg:cs(b).backgroundColor, color:cs(b).color, radius:cs(b).borderRadius, border:cs(b).border, hasSvg:!!b.querySelector('svg')})),
      imgs: [...hero.querySelectorAll('img')].map(i => ({src:(i.currentSrc||i.src).split('/').pop(), rect:R(i), fit:cs(i).objectFit, pos:cs(i).objectPosition, alt:i.alt, filter:cs(i).filter, opacity:cs(i).opacity})),
      overlays: [...hero.querySelectorAll('div')].filter(d=>(d.className||'').includes('gradient')||(d.className||'').includes('spotlight')||(d.className||'').includes('grain')).map(d=>({cls:(typeof d.className==='string'?d.className:'').slice(0,160), bgImage:cs(d).backgroundImage.slice(0,220), opacity:cs(d).opacity, rect:R(d), mask:cs(d).maskImage.slice(0,120)}))
    };
  });

  sec('marquee', () => {
    const mq = [...document.querySelectorAll('*')].find(e => /marquee|ticker/i.test(typeof e.className==='string'?e.className:''));
    const anim = [...document.querySelectorAll('*')].filter(e => { const s=cs(e); return s.animationName && s.animationName!=='none' && s.animationIterationCount==='infinite'; });
    const kf = [];
    for (const s of document.styleSheets) { try { for (const r of s.cssRules) if (r.constructor.name==='CSSKeyframesRule') kf.push(r.cssText.slice(0,260)); } catch(e){} }
    return {
      containerCls: mq ? (typeof mq.className==='string'?mq.className:'').slice(0,260) : null,
      containerRect: mq ? R(mq) : null,
      containerInfo: mq ? info(mq) : null,
      html: mq ? mq.outerHTML.slice(0,700) : null,
      animated: anim.slice(0,10).map(e=>({cls:(typeof e.className==='string'?e.className:'').slice(0,150), animation:cs(e).animation, rect:R(e), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)})),
      keyframes: kf
    };
  });

  sec('sections', () => ['#symptoms','#services','#why','#process','#gallery','#reviews','#faq','#contacts','#cta'].map(id => {
    const s = document.querySelector(id); if (!s) return null;
    const lbl = s.querySelector('.label');
    const h2 = s.querySelector('h2');
    const lead = [...s.querySelectorAll('p')].find(p => parseFloat(cs(p).fontSize) >= 15 && (cs(p).color === 'rgb(164, 164, 174)' || cs(p).color === 'rgb(188, 188, 196)'));
    return {id, section: info(s, ['paddingTop','paddingBottom','borderTop','borderBottom']),
      eyebrow: lbl ? {txt:lbl.textContent.trim(), color:cs(lbl).color, fs:cs(lbl).fontSize, ls:cs(lbl).letterSpacing, font:cs(lbl).fontFamily.slice(0,18), fw:cs(lbl).fontWeight} : null,
      h2: h2 ? {txt:h2.textContent.trim().slice(0,50), fs:cs(h2).fontSize, lh:cs(h2).lineHeight, ls:cs(h2).letterSpacing, color:cs(h2).color, mt:cs(h2).marginTop, maxW:cs(h2).maxWidth} : null,
      lead: lead ? {txt:lead.innerText.slice(0,140), fs:cs(lead).fontSize, color:cs(lead).color, lh:cs(lead).lineHeight} : null,
      headerWrap: (() => { const w = h2 && h2.closest('div'); return w ? {cls:(typeof w.className==='string'?w.className:'').slice(0,80), maxW:cs(w).maxWidth} : null; })()
    };
  }).filter(Boolean));

  sec('symptoms', () => {
    const sym = document.querySelector('#symptoms'); if (!sym) return null;
    const card = sym.querySelector('.rounded-card');
    const chips = [...sym.querySelectorAll('a')].filter(a => (a.className||'').includes('rounded-chip'));
    const holder = chips.length ? chips[0].parentElement : null;
    return {
      card: info(card),
      chipCount: chips.length,
      chipTexts: chips.map(b=>b.innerText.replace(/\s+/g,' ').trim()),
      chipStyle: info(chips[0], ['minHeight','whiteSpace','fontSize','transition']),
      chipHtml: chips[0] ? chips[0].outerHTML.slice(0,700) : null,
      chipHolder: info(holder),
      otherBtns: [...sym.querySelectorAll('a,button')].filter(b=>!((b.className||'').includes('rounded-chip'))).map(b=>({txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), rect:R(b), bg:cs(b).backgroundColor, color:cs(b).color, radius:cs(b).borderRadius, border:cs(b).border})),
      ratingCard: (() => { const rc=[...sym.querySelectorAll('div')].find(d=>(d.innerText||'').includes('478 оценок') && (d.className||'').includes('rounded-card')); return rc?info(rc):null; })(),
      noteLine: (() => { const p=[...sym.querySelectorAll('p')].find(p=>/Или просто позвоните/.test(p.innerText||'')); return p?{txt:p.innerText.slice(0,150), fs:cs(p).fontSize, color:cs(p).color}:null; })()
    };
  });

  sec('services', () => {
    const svc = document.querySelector('#services'); if (!svc) return null;
    const ul = svc.querySelector('ul'); const lis = kids(ul);
    const chips = [...svc.querySelectorAll('.rounded-chip')];
    return {
      ul: info(ul, ['borderTop','borderBottom','divideColor']),
      itemCount: lis.length,
      items: lis.map(li => ({rect:R(li), cls:(typeof li.className==='string'?li.className:'').slice(0,150), borderTop:cs(li).borderTop, borderBottom:cs(li).borderBottom, bg:cs(li).backgroundColor, pad:cs(li).padding, radius:cs(li).borderRadius, display:cs(li).display, cols:cs(li).gridTemplateColumns, gap:cs(li).gap, txt:(li.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)})),
      itemHtml: lis[0] ? lis[0].outerHTML.slice(0,1600) : null,
      tagChips: chips.slice(0,5).map(c=>({txt:c.textContent.trim().slice(0,42), cls:(typeof c.className==='string'?c.className:'').slice(0,110), rect:R(c), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, color:cs(c).color, pad:cs(c).padding, fs:cs(c).fontSize})),
      waLink: (() => { const a=[...svc.querySelectorAll('a')].find(a=>/WhatsApp/.test(a.innerText||'')); return a?info(a):null; })(),
      h3s: [...svc.querySelectorAll('h3')].map(h=>({txt:h.textContent.trim().slice(0,40), fs:cs(h).fontSize, fw:cs(h).fontWeight, color:cs(h).color, ls:cs(h).letterSpacing}))
    };
  });

  sec('why', () => {
    const why = document.querySelector('#why'); if (!why) return null;
    const grid = why.querySelector('.mt-10');
    return {
      grid: info(grid),
      items: kids(grid).map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,140), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, pad:cs(c).padding, txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,90), html:c.outerHTML.slice(0,450)})),
      gridHtml: grid ? grid.outerHTML.slice(0,1000) : null
    };
  });

  sec('badge', () => {
    const b = [...document.querySelectorAll('div')].find(d => (d.innerText||'').trim().startsWith('2GIS Awards') && (d.className||'').includes('rounded-card'));
    return b ? {info: info(b), html: b.outerHTML.slice(0,1500), text: b.innerText.replace(/\s+/g,' ').trim()} : null;
  });

  sec('process', () => {
    const pr = document.querySelector('#process'); if (!pr) return null;
    const wrap = pr.querySelector('.mt-11');
    const nums = [...pr.querySelectorAll('*')].filter(e => !e.children.length && /^0[1-4]$/.test((e.textContent||'').trim()));
    return {
      wrap: info(wrap),
      nums: nums.map(e => ({txt:e.textContent.trim(), el: info(e), parentHtml:(e.parentElement||{}).outerHTML ? e.parentElement.outerHTML.slice(0,500) : null})),
      items: kids(wrap && kids(wrap)[0]).map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,130), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), borderLeft:cs(c).borderLeft, pad:cs(c).padding})),
      html: wrap ? wrap.outerHTML.slice(0,2000) : null
    };
  });

  sec('gallery', () => {
    const gal = document.querySelector('#gallery'); if (!gal) return null;
    const g = gal.querySelector('ul');
    return {
      ul: info(g, ['gridAutoRows','gridTemplateRows']),
      autoRows: cs(g).gridAutoRows,
      items: kids(g).map(li => ({rect:R(li), cls:(typeof li.className==='string'?li.className:'').slice(0,170), ratio:(R(li).w/R(li).h).toFixed(2), caption:(li.innerText||'').replace(/\s+/g,' ').trim().slice(0,90), img:li.querySelector('img')?{src:(li.querySelector('img').currentSrc||li.querySelector('img').src).split('/').pop(), fit:cs(li.querySelector('img')).objectFit, w:R(li.querySelector('img')).w, h:R(li.querySelector('img')).h}:null, bg:cs(li).backgroundColor, radius:cs(li).borderRadius, border:cs(li).border, overlay:(()=>{const o=[...li.querySelectorAll('div')].find(d=>(d.className||'').includes('gradient'));return o?cs(o).backgroundImage.slice(0,180):null;})()})),
      html: g ? g.outerHTML.slice(0,1400) : null,
      link: (()=>{const a=gal.querySelector('a');return a?info(a):null;})()
    };
  });

  sec('reviews', () => {
    const rv = document.querySelector('#reviews'); if (!rv) return null;
    const slider = rv.querySelector('ul');
    const pag = [...rv.querySelectorAll('*')].find(e => /Отзыв\s*\d+\s*из/.test(e.innerText||'') && e.children.length < 8);
    return {
      slider: info(slider, ['scrollSnapType','overflowX','scrollPadding']),
      snap: cs(slider).scrollSnapType,
      cards: kids(slider).map(li => ({rect:R(li), w:R(li).w, h:R(li).h, snap:cs(li).scrollSnapAlign, minW:cs(li).minWidth, bg:cs(li).backgroundColor, radius:cs(li).borderRadius, border:cs(li).border, pad:cs(li).padding, txt:(li.innerText||'').replace(/\s+/g,' ').trim().slice(0,130)})),
      cardHtml: kids(slider)[0] ? kids(slider)[0].outerHTML.slice(0,1500) : null,
      pagination: pag ? {txt:pag.innerText.replace(/\s+/g,' ').trim(), html:pag.outerHTML.slice(0,900), el:info(pag)} : null,
      headerRight: (() => { const h = rv.querySelector('[class*="items-end"]'); return h && h.lastElementChild ? h.lastElementChild.outerHTML.slice(0,800) : null; })(),
      arrows: [...rv.querySelectorAll('button')].map(b=>({txt:b.innerText.trim().slice(0,20), rect:R(b), bg:cs(b).backgroundColor, border:cs(b).border, radius:cs(b).borderRadius, disabled:b.disabled}))
    };
  });

  sec('contacts', () => {
    const ct = document.querySelector('#contacts'); if (!ct) return null;
    const grid = ct.querySelector('.mt-10');
    return {
      grid: info(grid),
      children: kids(grid).map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,140), bg:cs(c).backgroundColor, radius:cs(c).borderRadius, border:cs(c).border, txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,130), html:c.outerHTML.slice(0,600)})),
      html: grid ? grid.outerHTML.slice(0,1600) : null
    };
  });

  sec('footer', () => {
    const ft = document.querySelector('footer');
    if (!ft) return 'none';
    const g = ft.querySelector('div[class*="grid"]');
    return {
      info: info(ft, ['paddingTop','paddingBottom','borderTop']),
      text: (ft.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
      gridCls: g ? (typeof g.className==='string'?g.className:'') : null,
      grid: info(g),
      cols: kids(g).map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,100), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,100), html:c.outerHTML.slice(0,700)})),
      bottom: ft.lastElementChild ? ft.lastElementChild.outerHTML.slice(0,800) : null,
      wordmark: (() => { const w=[...ft.querySelectorAll('*')].find(e=>!e.children.length && /YASIRA/.test(e.textContent) && cs(e).fontFamily.includes('Georgia')); return w?info(w,['fontFamily','fontSize']):null; })()
    };
  });

  sec('cta', () => {
    const cta = document.querySelector('#cta'); if (!cta) return null;
    const card = cta.querySelector('.rounded-card');
    return {info: info(cta, ['paddingTop','paddingBottom','borderTop']), card: info(card), html: card ? card.outerHTML.slice(0,1500) : null};
  });

  sec('anim', () => {
    const rules = [];
    for (const s of document.styleSheets) { try { for (const r of s.cssRules) { const t = r.cssText||''; if (/is-visible|\.reveal|spotlight|\.grain|scroll-behavior/.test(t) && t.length < 700) rules.push(t.slice(0,500)); } } catch(e){} }
    const rev = document.querySelector('[class*="reveal"]');
    return {
      rules: rules.slice(0,25),
      revealed: document.querySelectorAll('.is-visible').length,
      revealTotal: document.querySelectorAll('[class*="reveal"]').length,
      sample: rev ? {cls:(typeof rev.className==='string'?rev.className:'').slice(0,120), opacity:cs(rev).opacity, transform:cs(rev).transform, transition:cs(rev).transition.slice(0,180)} : null,
      scrollBehavior: cs(document.documentElement).scrollBehavior,
      smoothScrollLinks: document.querySelectorAll('a[href^="#"]').length
    };
  });

  sec('misc', () => ({
    htmlHasClasses: document.documentElement.className,
    sectionCount: document.querySelectorAll('section').length,
    pageHeight: document.documentElement.scrollHeight,
    themeColor: (document.querySelector('meta[name="theme-color"]')||{}).content || null,
    bgImageBody: cs(document.body).backgroundImage.slice(0,200),
    bgImageMain: cs(document.querySelector('main')).backgroundImage.slice(0,200),
    selectionColor: (()=>{ for (const s of document.styleSheets){ try{ for(const r of s.cssRules){ if(/::selection/.test(r.cssText)) return r.cssText.slice(0,200);} }catch(e){} } return null; })()
  }));

  return out;
})()