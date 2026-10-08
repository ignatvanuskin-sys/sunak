(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const rgb = el => el ? getComputedStyle(el).backgroundColor : null;
  const out = {};
  out.viewport = { w: innerWidth, h: innerHeight, dpr: devicePixelRatio };
  out.url = location.href;
  out.title = document.title;
  const b = cs(document.body);
  out.body = { bg: b.backgroundColor, color: b.color, font: b.fontFamily, fontSize: b.fontSize, lineHeight: b.lineHeight, weight: b.fontWeight };

  // fonts loaded
  try {
    out.fonts = [...document.fonts].map(f => f.family + '|' + f.weight + '|' + f.style + '|' + f.status);
  } catch(e) { out.fonts = 'err'; }
  out.styleSheetsLinks = [...document.querySelectorAll('link[rel="stylesheet"],link[rel="preconnect"],link[rel="preload"]')].map(l => l.href || l.href);
  out.fontFaceSrc = [];
  for (const s of document.styleSheets) {
    try {
      for (const r of s.cssRules) {
        if (r.constructor.name === 'CSSFontFaceRule') out.fontFaceSrc.push(r.style.getPropertyValue('font-family') + ' :: ' + r.style.getPropertyValue('src') + ' :: ' + r.style.getPropertyValue('font-weight'));
      }
    } catch(e) {}
  }

  // sections: top-level structural blocks
  const seclist = [];
  const walk = (root, depth) => {
    [...root.children].forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (['script','style','link','noscript'].includes(tag)) return;
      const r = el.getBoundingClientRect();
      const s = cs(el);
      if (r.height > 120 && r.width > 300) {
        seclist.push({
          depth,
          tag,
          cls: (el.className && typeof el.className === 'string') ? el.className.slice(0,120) : '',
          id: el.id,
          top: Math.round(r.top + scrollY),
          h: Math.round(r.height),
          w: Math.round(r.width),
          bg: s.backgroundColor,
          color: s.color,
          pad: s.padding,
          maxW: s.maxWidth,
          display: s.display,
          radius: s.borderRadius,
          firstText: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)
        });
      }
      if (depth < 3) walk(el, depth + 1);
    });
  };
  walk(document.body, 0);
  out.blocks = seclist;
  return out;
})()