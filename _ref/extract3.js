(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const R = el => { const r = el.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}; };
  const info = (el, extra=[]) => {
    if (!el) return null;
    const s = cs(el); const o = {rect: R(el), tag: el.tagName.toLowerCase(),
      cls: (typeof el.className==='string'?el.className:'').slice(0,150),
      bg: s.backgroundColor, color: s.color, pad: s.padding, margin: s.margin,
      radius: s.borderRadius, border: s.border, shadow: s.boxShadow,
      display: s.display, grid: s.gridTemplateColumns, gap: s.gap,
      position: s.position, top: s.top, zIndex: s.zIndex, backdrop: s.backdropFilter,
      font: s.fontFamily.slice(0,25), fs: s.fontSize, fw: s.fontWeight,
      align: s.alignItems, justify: s.justifyContent};
    extra.forEach(p => o[p] = s[p]);
    return o;
  };
  const findByText = (txt, tag='*') => [...document.querySelectorAll(tag)].find(e => (e.textContent||'').trim().startsWith(txt) && e.children.length < 4);
  const out = {};

  // HEADER
  const hdr = document.querySelector('header');
  out.header = info(hdr);
  if (hdr) {
    out.headerInner = info(hdr.firstElementChild);
    out.headerTexts = (hdr.innerText||'').replace(/\s+/g,' ').trim().slice(0,200);
    out.headerRect = R(hdr);
    out.headerKids = [...hdr.querySelectorAll(':scope > * > * > *')].slice(0,14).map(e => ({
      tag: e.tagName.toLowerCase(), txt: (e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
      rect: R(e), cls: (typeof e.className==='string'?e.className:'').slice(0,90)
    }));
  }

  // HERO
  const hero = document.querySelector('#top');
  out.hero = info(hero);
  if (hero) {
    out.heroChildren = [...hero.children].map(e => ({tag:e.tagName.toLowerCase(), cls:(typeof e.className==='string'?e.className:'').slice(0,120), rect:R(e), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)}));
    const h1 = hero.querySelector('h1');
    out.heroH1 = info(h1);
    out.heroH1Text = h1 && h1.innerText.replace(/\s+/g,' ').trim();
    // fact grid: container of labels ГОРОД etc
    const lbl = [...hero.querySelectorAll('*')].filter(e => e.children.length===0 && /^(ГОРОД|ПРОФИЛЬ|АДРЕС|СВЯЗЬ)$/.test((e.textContent||'').trim()));
    if (lbl.length) {
      let p = lbl[0].closest('ul,div,dl');
      out.factGridLabels = lbl.map(e => e.textContent.trim());
      // ascend to grid container
      let node = lbl[0];
      let gridEl = null;
      for (let i=0;i<6 && node;i++) { node = node.parentElement; if (node && cs(node).display.includes('grid')) { gridEl = node; break; } }
      out.factGrid = info(gridEl);
      if (gridEl) {
        out.factItems = [...gridEl.children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,110), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, pad:cs(c).padding}));
        out.factItemDetail = [...gridEl.children].slice(0,1).map(c => ({
          innerText: (c.innerText||'').replace(/\s+/g,' ').trim(),
          html: c.outerHTML.slice(0,600)
        }));
      }
    }
    // rating row in hero
    const rateEl = [...hero.querySelectorAll('*')].find(e => /^\d,\d/.test((e.textContent||'').trim()) && e.children.length<4);
    out.heroRating = rateEl ? {txt: rateEl.textContent.trim().slice(0,80), el: info(rateEl)} : null;
    // eyebrow in hero
    const eb = [...hero.querySelectorAll('span,p,div')].filter(e=>!e.children.length && /ЛЕГКОВОЙ АВТОСЕРВИС/.test(e.textContent||''));
    out.heroEyebrow = eb.length ? {txt: eb[0].textContent.trim(), el: info(eb[0])} : null;
    out.heroLead = info([...hero.querySelectorAll('p')].find(p => (p.innerText||'').length > 60));
    out.heroBtns = [...hero.querySelectorAll('a,button')].map(b => ({txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,32), rect:R(b), bg:cs(b).backgroundColor, color:cs(b).color, radius:cs(b).borderRadius, border:cs(b).border}));
    out.heroImgs = [...hero.querySelectorAll('img')].map(i => ({src:i.currentSrc||i.src, rect:R(i), objectFit:cs(i).objectFit, objectPos:cs(i).objectPosition, alt:i.alt}));
  }

  // MARQUEE
  const mrq = [...document.querySelectorAll('*')].filter(e => {
    const s = cs(e); return s.animationName && s.animationName !== 'none' && s.animationIterationCount === 'infinite';
  });
  out.animations = mrq.slice(0,12).map(e => ({
    tag: e.tagName.toLowerCase(), cls:(typeof e.className==='string'?e.className:'').slice(0,140),
    animation: cs(e).animation, transform: cs(e).transform,
    rect: R(e), txt: (e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)
  }));
  // keyframes
  const kf = [];
  for (const s of document.styleSheets) { try { for (const r of s.cssRules) if (r.constructor.name==='CSSKeyframesRule') kf.push(r.cssText.slice(0,300)); } catch(e){} }
  out.keyframes = kf;
  // marquee container
  const mq = document.querySelector('[class*="marquee"],[class*="ticker"]');
  out.marquee = mq ? {cls: (typeof mq.className==='string'?mq.className:'').slice(0,200), html: mq.outerHTML.slice(0,900), rect:R(mq)} : null;

  // SECTIONS header rows
  out.sectionHeaders = ['#symptoms','#services','#why','#process','#gallery','#reviews','#faq','#contacts','#cta'].map(id => {
    const s = document.querySelector(id); if (!s) return null;
    const eyebrow = s.querySelector('.label');
    const h2 = s.querySelector('h2');
    const lead = [...s.querySelectorAll('p')].find(p => (p.className||'').includes('fog-400') || (p.className||'').includes('text-[15') || (p.className||'').includes('lead'));
    return {id, bg: cs(s).backgroundColor, pad: cs(s).padding, border: cs(s).borderTop + ' | ' + cs(s).borderBottom,
      eyebrow: eyebrow ? {txt: eyebrow.textContent.trim(), color: cs(eyebrow).color, fs: cs(eyebrow).fontSize, ls: cs(eyebrow).letterSpacing, font: cs(eyebrow).fontFamily.slice(0,22)} : null,
      h2: h2 ? {txt: h2.textContent.trim(), fs: cs(h2).fontSize, lh: cs(h2).lineHeight, ls: cs(h2).letterSpacing, color: cs(h2).color, mt: cs(h2).marginTop} : null,
      lead: lead ? {txt: lead.innerText.slice(0,120), fs: cs(lead).fontSize, color: cs(lead).color, lh: cs(lead).lineHeight} : null,
      headerWrap: (() => { const w = h2 ? h2.closest('div') : null; return w ? {cls:(typeof w.className==='string'?w.className:'').slice(0,90), display:cs(w).display, maxW:cs(w).maxWidth} : null; })()
    };
  }).filter(Boolean);

  // SYMPTOMS grid
  const sym = document.querySelector('#symptoms');
  if (sym) {
    const btns = [...sym.querySelectorAll('a')].filter(a => (a.className||'').includes('rounded-chip'));
    out.symptoms = {
      cardBg: cs(sym.querySelector('.rounded-card')).backgroundColor,
      cardPad: cs(sym.querySelector('.rounded-card')).padding,
      cardRadius: cs(sym.querySelector('.rounded-card')).borderRadius,
      count: btns.length,
      firstBtn: info(btns[0], ['minHeight','whiteSpace']),
      btnTexts: btns.map(b => b.innerText.replace(/\s+/g,' ').trim()),
      btnIcons: btns.slice(0,2).map(b => b.querySelector('svg') ? b.querySelector('svg').outerHTML.slice(0,300) : null),
      container: (() => { const p = btns[0] && btns[0].parentElement; return p ? {cls:(typeof p.className==='string'?p.className:'').slice(0,140), display:cs(p).display, grid:cs(p).gridTemplateColumns, gap:cs(p).gap, rect:R(p)} : null; })(),
      altBtns: [...sym.querySelectorAll('a')].filter(a=>!((a.className||'').includes('rounded-chip'))).map(a=>({txt:(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), bg:cs(a).backgroundColor, color:cs(a).color, radius:cs(a).borderRadius, h:R(a).h}))
    };
    // rating card in symptoms
    const rc = [...sym.querySelectorAll('div')].find(d => (d.innerText||'').includes('478 оценок') && (d.className||'').includes('rounded-card'));
    out.symptoms.ratingCard = rc ? info(rc) : null;
  }

  // SERVICES list
  const svc = document.querySelector('#services');
  if (svc) {
    const ul = svc.querySelector('ul');
    const lis = [...ul.children];
    out.services = {
      ulCls: (typeof ul.className==='string'?ul.className:'').slice(0,160),
      ulBorder: cs(ul).border, count: lis.length,
      grid: cs(ul).display, gap: cs(ul).gap,
      items: lis.map(li => ({rect:R(li), cls:(typeof li.className==='string'?li.className:'').slice(0,140), border: cs(li).borderTop+' / '+cs(li).borderBottom, bg: cs(li).backgroundColor, pad: cs(li).padding, radius: cs(li).borderRadius, inner: cs(li).display, cols: cs(li).gridTemplateColumns, gap:cs(li).gap, txt:(li.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)})),
      thirdLevel: lis.length ? lis[0].outerHTML.slice(0,1500) : null
    };
    // sub-tag chips
    const chips = svc.querySelectorAll('.rounded-chip');
    out.services.chips = [...chips].slice(0,4).map(c => ({txt:c.textContent.trim().slice(0,40), cls:(typeof c.className==='string'?c.className:'').slice(0,110), rect:R(c), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, color:cs(c).color, pad:cs(c).padding}));
    const links = [...svc.querySelectorAll('a')].filter(a => (a.innerText||'').includes('WhatsApp'));
    out.services.waLink = links.length ? info(links[0]) : null;
  }

  // WHY cards + badge
  const why = document.querySelector('#why');
  if (why) {
    const grid = why.querySelector('.mt-10');
    out.why = {grid: info(grid), items: grid ? [...grid.children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,120), bg:cs(c).backgroundColor, border:cs(c).border, radius:cs(c).borderRadius, pad:cs(c).padding, txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,80), html:c.outerHTML.slice(0,400)}))};
  }
  const badge = [...document.querySelectorAll('div')].find(d => (d.className||'').includes('2GIS') || ((d.innerText||'').startsWith('2GIS Awards') && (d.className||'').includes('rounded-card')));
  out.badge = badge ? {info: info(badge), html: badge.outerHTML.slice(0,1400)} : null;
  const badge2 = [...document.querySelectorAll('*')].find(e => (e.textContent||'').trim().startsWith('2GIS Awards'));
  out.badgeText = badge2 ? badge2.textContent.replace(/\s+/g,' ').trim().slice(0,200) : null;

  // PROCESS steps
  const pr = document.querySelector('#process');
  if (pr) {
    const wrap = pr.querySelector('.mt-11');
    out.process = {
      wrap: info(wrap),
      numbers: [...pr.querySelectorAll('*')].filter(e => !e.children.length && /^0[1-4]$/.test(e.textContent.trim())).map(e => ({txt:e.textContent.trim(), el: info(e), html:(e.parentElement||{}).outerHTML ? e.parentElement.outerHTML.slice(0,400) : ''})),
      items: wrap ? [...wrap.children[0].children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,120), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)})) : null,
      html: wrap ? wrap.outerHTML.slice(0,1800) : null
    };
  }

  // GALLERY
  const gal = document.querySelector('#gallery');
  if (gal) {
    const g = gal.querySelector('ul');
    out.gallery = {
      ul: info(g),
      autoRows: cs(g).gridAutoRows,
      items: [...g.children].map(li => ({rect:R(li), cls:(typeof li.className==='string'?li.className:'').slice(0,140), ratio: (R(li).w/R(li).h).toFixed(2), img: li.querySelector('img') ? {src:(li.querySelector('img').currentSrc||li.querySelector('img').src).split('/').pop(), fit:cs(li.querySelector('img')).objectFit} : null, caption: (li.innerText||'').replace(/\s+/g,' ').trim().slice(0,80), bg: cs(li).backgroundColor, radius: cs(li).borderRadius, border: cs(li).border})),
      html: g.outerHTML.slice(0,1200)
    };
  }

  // REVIEWS
  const rv = document.querySelector('#reviews');
  if (rv) {
    const slider = rv.querySelector('ul');
    out.reviews = {
      slider: info(slider), scrollSnapType: cs(slider).scrollSnapType, overflowX: cs(slider).overflowX,
      card: info(rv.querySelector('ul > li')),
      cardBg: cs(rv.querySelector('ul > li')).backgroundColor,
      cards: [...rv.querySelectorAll('ul > li')].map(li => ({rect:R(li), w:R(li).w, h:R(li).h, snap:cs(li).scrollSnapAlign, txt:(li.innerText||'').replace(/\s+/g,' ').trim().slice(0,110), radius:cs(li).borderRadius, border:cs(li).border, pad:cs(li).padding})),
      pagination: (() => {
        const p = [...rv.querySelectorAll('*')].find(e => /Отзыв\s*\d+\s*из/.test((e.innerText||'')) && e.children.length < 6);
        return p ? {txt: p.innerText.replace(/\s+/g,' ').trim(), html: p.outerHTML.slice(0,900), el: info(p)} : null;
      })(),
      headerExtras: rv.querySelector('.mt-9') ? rv.querySelector('.mt-9').className : null
    };
    const head = rv.querySelector('.md\\:items-end');
    out.reviews.headerRight = head ? head.lastElementChild.outerHTML.slice(0,700) : null;
  }

  // CONTACTS
  const ct = document.querySelector('#contacts');
  if (ct) {
    const grid = ct.querySelector('.mt-10');
    out.contacts = {grid: info(grid), children: grid ? [...grid.children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,130), bg:cs(c).backgroundColor, radius:cs(c).borderRadius, border:cs(c).border, txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)}))};
    out.contacts.blockHtml = grid ? grid.outerHTML.slice(0,1400);
  }

  // FOOTER
  const ft = document.querySelector('footer');
  out.footer = {info: info(ft), text: (ft.innerText||'').replace(/\s+/g,' ').trim().slice(0,400)};
  if (ft) {
    const g = ft.querySelector('.grid');
    out.footer.grid = info(g);
    out.footer.cols = g ? [...g.children].map(c => ({rect:R(c), cls:(typeof c.className==='string'?c.className:'').slice(0,90), txt:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,80), html:c.outerHTML.slice(0,500)}));
    out.footer.bottom = ft.lastElementChild ? ft.lastElementChild.outerHTML.slice(0,700) : null;
    const wordmark = [...ft.querySelectorAll('*')].find(e=>!e.children.length && /YASIRA MOTORS/.test(e.textContent) && cs(e).fontFamily.includes('Georgia'));
    out.footer.wordmark = wordmark ? info(wordmark, ['fontFamily']) : null;
  }

  // CTA
  const cta = document.querySelector('#cta');
  PLACEHOLDER_CTA

  // reveal animation classes in CSS
  const revealRules = [];
  for (const s of document.styleSheets) { try { for (const r of s.cssRules) { const t = r.cssText||''; if (/is-visible|reveal|spotlight|grain/.test(t) && t.length < 900) revealRules.push(t.slice(0,600)); } } catch(e){} }
  out.revealRules = revealRules.slice(0,20);
  out.revealedCount = document.querySelectorAll('.is-visible').length;
  out.notRevealed = [...document.querySelectorAll('[class*="reveal"]')].filter(e=>!e.classList.contains('is-visible')).length;
  out.revealSample = (() => { const e = document.querySelector('[class*="reveal"]'); return e ? {cls: (typeof e.className==='string'?e.className:'').slice(0,100), opacity: cs(e).opacity, transform: cs(e).transform, transition: cs(e).transition.slice(0,200)} : null; })();
  return out;
})()
