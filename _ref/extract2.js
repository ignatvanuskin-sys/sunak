(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const pick = (el, props) => { const s = cs(el); const o = {}; if (!s) return null; props.forEach(p => o[p] = s[p]); return o; };
  const out = {};
  out.viewport = { w: innerWidth, h: innerHeight };

  // CSS custom properties on :root
  const root = getComputedStyle(document.documentElement);
  const vars = {};
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    if (n.startsWith('--')) vars[n] = root.getPropertyValue(n).trim();
  }
  out.cssVars = vars;

  // Typography
  const typ = (sel, label) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = cs(el);
    const r = el.getBoundingClientRect();
    return {
      label, sel,
      text: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,70),
      fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
      letterSpacing: s.letterSpacing, lineHeight: s.lineHeight,
      color: s.color, textTransform: s.textTransform,
      sizePx: Math.round(parseFloat(s.fontSize)*100)/100,
      lhPx: Math.round(parseFloat(s.lineHeight)*100)/100,
      boxW: Math.round(r.width), boxH: Math.round(r.height)
    };
  };
  out.typography = [
    typ('h1','h1'),
    typ('h2','h2'),
    typ('h3','h3'),
    typ('h3:nth-of-type(1)','h3#1'),
    typ('#services h2','services h2'),
    typ('#why h2','why h2'),
    typ('#process h2','process h2'),
    typ('#reviews h2','reviews h2'),
    typ('#faq h2','faq h2'),
    typ('#contacts h2','contacts h2'),
    typ('p','p (first)'),
    typ('#services .max-w-3xl p','section lead p'),
    typ('li p','li p'),
    typ('footer p','footer p'),
    typ('a','a first'),
    typ('button','button first')
  ].filter(Boolean);

  // eyebrow detection: small uppercase-ish texts / mono badge
  const eyebrows = [];
  document.querySelectorAll('span,p,div').forEach(el => {
    if (el.children.length) return;
    const s = cs(el);
    const t = (el.innerText||'').trim();
    if (!t || t.length > 40) return;
    const fs = parseFloat(s.fontSize);
    if (fs <= 14 && (s.textTransform === 'uppercase' || /^[А-ЯЁA-Z0-9\s«»\/·—.,-]+$/.test(t)) && t.length > 3) {
      eyebrows.push({
        text: t.slice(0, 40), fontSize: s.fontSize, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight, color: s.color, textTransform: s.textTransform,
        fontFamily: s.fontFamily.slice(0,40), bg: s.backgroundColor, radius: s.borderRadius,
        padding: s.padding, border: s.border, cls: (typeof el.className==='string'?el.className:'').slice(0,90)
      });
    }
  });
  out.eyebrows = eyebrows.slice(0, 22);

  // Buttons: collect distinct
  const btnMap = new Map();
  document.querySelectorAll('a,button').forEach(el => {
    const s = cs(el);
    const r = el.getBoundingClientRect();
    if (r.height < 20 || r.height > 90 || r.width < 40) return;
    const key = [s.backgroundColor, s.color, s.borderRadius, s.borderWidth, s.fontSize, s.fontWeight, s.padding, s.height].join('|');
    if (btnMap.has(key)) return;
    btnMap.set(key, {
      text: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,40),
      tag: el.tagName.toLowerCase(),
      bg: s.backgroundColor, color: s.color, radius: s.borderRadius,
      border: s.border, borderColor: s.borderColor, borderWidth: s.borderWidth,
      padding: s.padding, height: Math.round(r.height), width: Math.round(r.width),
      fontSize: s.fontSize, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing,
      textTransform: s.textTransform, boxShadow: s.boxShadow, backdrop: s.backdropFilter,
      fontFamily: s.fontFamily.slice(0,30),
      hasSvg: !!el.querySelector('svg'), transition: s.transition,
      cls: (typeof el.className==='string'?el.className:'').slice(0,150)
    });
  });
  out.buttons = [...btnMap.values()];

  // Cards: common rounded containers
  const cardMap = new Map();
  document.querySelectorAll('div,li,article').forEach(el => {
    const s = cs(el);
    const r = el.getBoundingClientRect();
    if (parseFloat(s.borderRadius) < 4) return;
    if (r.width < 120 || r.height < 60 || r.height > 900) return;
    if (s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.backgroundImage === 'none' && s.borderWidth === '0px') return;
    const key = [s.backgroundColor, s.borderRadius, s.borderWidth, s.borderColor, s.padding, s.boxShadow].join('|');
    if (cardMap.has(key)) return;
    cardMap.set(key, {
      bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0,80), radius: s.borderRadius,
      border: s.border, padding: s.padding, boxShadow: s.boxShadow,
      w: Math.round(r.width), h: Math.round(r.height),
      display: s.display, gap: s.gap,
      text: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,50),
      cls: (typeof el.className==='string'?el.className:'').slice(0,140)
    });
  });
  out.cards = [...cardMap.values()];

  // border colors/opacity helpers: sample uses
  out.borders = {
    line: vars['--line'] , lineSoft: vars['--line-soft']
  };
  return out;
})()