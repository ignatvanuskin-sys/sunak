/* ==========================================================================
   СТО «Сунақ» — интерфейс сайта и система онлайн-записи
   --------------------------------------------------------------------------
   Отправка заявки:
   • BACKEND-РЕЖИМ  — укажите BOOKING_CONFIG.endpoint, и заявка уйдёт POST-запросом
     (JSON: name, phone, service, date, time, comment, createdAt, source).
     Готовый пример обработчика — api/booking.example.js
   • WHATSAPP-РЕЖИМ — если endpoint пустой, заявка аккуратно собирается и
     передаётся в WhatsApp компании готовым сообщением. Никаких «фальшивых»
     подтверждений: интерфейс честно показывает, что заявка уходит в WhatsApp.
   ========================================================================== */

(function () {
  'use strict';

  var BOOKING_CONFIG = {
    endpoint: '',                    // напр. '/api/booking' — включает backend-режим
    whatsapp: '77753375793',
    phone: '+77753375793',
    business: 'СТО «Сунақ»',
    hours: { open: 9, close: 24 }    // график компании по данным 2ГИС
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- header ---------------- */
  var header = $('#header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- статус «открыто / закрыто» ---------------- */
  (function workingStatus() {
    var h = new Date().getHours();
    var isOpen = h >= BOOKING_CONFIG.hours.open && h < BOOKING_CONFIG.hours.close;
    var text = isOpen ? 'Сейчас открыто · до 24:00' : 'Закрыто · откроем в 09:00';
    $$('[data-status-text]').forEach(function (el) { el.textContent = text; });
    $$('[data-status-dot]').forEach(function (el) {
      el.classList.toggle('is-closed', !isOpen);
      el.setAttribute('title', text);
    });
  })();

  /* ---------------- mobile nav ---------------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ---------------- reveal on scroll (с каскадом 70 мс) ---------------- */
  var revealItems = $$('[data-reveal]');
  revealItems.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var siblings = $$('[data-reveal]', parent);
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = (idx * 70) + 'ms';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- копировать номер ---------------- */
  var copyPhone = $('#copy-phone');
  if (copyPhone) {
    copyPhone.addEventListener('click', function () {
      var value = copyPhone.getAttribute('data-phone') || BOOKING_CONFIG.phone;
      var original = 'Копировать номер';
      // Подтверждение показываем сразу и синхронно — не зависим от ответа Clipboard API
      clearTimeout(copyPhone._t);
      copyPhone.textContent = 'Номер скопирован';
      copyPhone._t = setTimeout(function () { copyPhone.textContent = original; }, 2600);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).catch(function () { legacyCopy(value); });
      } else {
        legacyCopy(value);
      }
    });
    function legacyCopy(value) {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  /* ---------------- lazy map ---------------- */
  var mapFrame = $('.map-card__frame iframe[data-src]');
  if (mapFrame) {
    var loadMap = function () {
      mapFrame.setAttribute('src', mapFrame.getAttribute('data-src'));
      mapFrame.removeAttribute('data-src');
    };
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { loadMap(); mio.disconnect(); }
      }, { rootMargin: '250px' });
      mio.observe(mapFrame);
    } else { loadMap(); }
  }

  /* ---------------- слайдер отзывов ---------------- */
  var track = $('#reviews-track');
  var viewport = $('#reviews-viewport');
  var indicator = $('#rev-indicator');
  if (track && viewport) {
    var cardStep = function () {
      var first = track.querySelector('.review-card');
      if (!first) return 360;
      var gap = parseFloat(getComputedStyle(track).columnGap || '14') || 14;
      return first.getBoundingClientRect().width + gap;
    };
    var cards = $$('.review-card', track);
    var updateIndicator = function () {
      if (!indicator || !cards.length) return;
      var idx = Math.round(viewport.scrollLeft / cardStep()) + 1;
      idx = Math.max(1, Math.min(cards.length, idx));
      indicator.textContent = 'Отзыв ' + idx + ' из ' + cards.length;
    };
    var prev = $('#rev-prev'), next = $('#rev-next');
    if (next) next.addEventListener('click', function () { viewport.scrollBy({ left: cardStep(), behavior: 'smooth' }); });
    if (prev) prev.addEventListener('click', function () { viewport.scrollBy({ left: -cardStep(), behavior: 'smooth' }); });
    var t = null;
    viewport.addEventListener('scroll', function () {
      if (t) clearTimeout(t);
      t = setTimeout(updateIndicator, 60);
    }, { passive: true });
    if ('onscrollend' in window) viewport.addEventListener('scrollend', updateIndicator);
    updateIndicator();
  }

  /* ---------------- lightbox ---------------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbCap = $('#lightbox-cap');
  var galleryItems = $$('[data-lightbox]');
  var lbIndex = 0;
  var lastFocus = null;

  function openLightbox(i) {
    if (!lightbox || !galleryItems.length) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var item = galleryItems[lbIndex];
    var img = item.querySelector('img');
    var cap = item.querySelector('.bento__cap');
    lbImg.setAttribute('src', item.getAttribute('data-src'));
    lbImg.setAttribute('alt', img ? img.getAttribute('alt') : '');
    lbCap.textContent = cap ? cap.textContent : '';
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    document.body.classList.add('modal-open');
    var closeBtn = $('.lightbox__close', lightbox);
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(function () { lightbox.hidden = true; lbImg.setAttribute('src', ''); }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });
  if (lightbox) {
    $$('[data-lightbox-close]', lightbox).forEach(function (b) { b.addEventListener('click', closeLightbox); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    var lbPrev = $('#lb-prev'), lbNext = $('#lb-next');
    if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(lbIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { openLightbox(lbIndex + 1); });
  }

  /* ---------------- booking modal ---------------- */
  var modal = $('#booking');
  var modalDialog = modal ? modal.querySelector('.modal__dialog') : null;
  var modalOpenFocus = null;

  function openModal(service) {
    if (!modal) return;
    modalOpenFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.classList.add('modal-open');
    if (service) selectService(service);
    restoreDraft();
    var first = modal.querySelector('.opt input');
    var target = wizard.step === 4 ? $('#f-name') : first;
    if (target) setTimeout(function () { target.focus(); }, 320);
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(function () { modal.hidden = true; }, 300);
    if (modalOpenFocus && modalOpenFocus.focus) modalOpenFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-booking-open]');
    if (!opener) return;
    e.preventDefault();
    openModal(opener.getAttribute('data-service') || '');
  });
  if (modal) {
    $$('[data-booking-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
  }

  /* ---------------- wizard state ---------------- */
  var wizard = { step: 1, total: 4 };
  var form = $('#booking-form');
  var steps = $$('.wizard__step');
  var progress = $$('#wizard-progress li');
  var backBtn = $('#wiz-back');
  var nextBtn = $('#wiz-next');
  var submitBtn = $('#wiz-submit');
  var statusEl = $('#form-status');
  var success = $('#booking-success');

  var selected = { service: '', date: null, time: '' };

  function showStep(n) {
    wizard.step = n;
    steps.forEach(function (s) {
      var on = Number(s.getAttribute('data-step')) === n;
      s.classList.toggle('is-current', on);
      s.hidden = !on;
    });
    progress.forEach(function (li, i) {
      var idx = i + 1;
      li.classList.toggle('is-active', idx === n);
      li.classList.toggle('is-done', idx < n);
    });
    if (backBtn) backBtn.hidden = n === 1;
    if (nextBtn) nextBtn.hidden = n === 4;
    if (submitBtn) submitBtn.hidden = n !== 4;
    if (n === 4) renderSummary();
    if (modalDialog) modalDialog.scrollTop = 0;
    saveDraft();
  }

  function selectService(value) {
    var input = $$('input[name="service"]').filter(function (i) { return i.value === value; })[0];
    if (input) { input.checked = true; selected.service = value; }
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (el) el.hidden = true;
    var input = document.getElementById(id.replace('err-', 'f-'));
    if (input && input.classList) input.classList.remove('is-invalid');
  }

  function validateStep(n) {
    var ok = true;
    if (n === 1) {
      var checked = $('input[name="service"]:checked');
      if (!checked) { var e1 = $('#err-service'); if (e1) e1.hidden = false; ok = false; }
      else { clearError('err-service'); selected.service = checked.value; }
    }
    if (n === 2) {
      if (!selected.date) { var e2 = $('#err-date'); if (e2) e2.hidden = false; ok = false; }
      else clearError('err-date');
    }
    if (n === 3) {
      if (!selected.time) { var e3 = $('#err-time'); if (e3) e3.hidden = false; ok = false; }
      else clearError('err-time');
    }
    if (n === 4) {
      var name = $('#f-name'), phone = $('#f-phone'), consent = $('#f-consent');
      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('is-invalid'); $('#err-name').hidden = false; ok = false;
      } else clearError('err-name');
      if (digits(phone.value).length !== 11) {
        phone.classList.add('is-invalid'); $('#err-phone').hidden = false; ok = false;
      } else clearError('err-phone');
      if (!consent.checked) {
        consent.classList.add('is-invalid'); $('#err-consent').hidden = false; ok = false;
      } else clearError('err-consent');
    }
    return ok;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validateStep(wizard.step)) return;
      if (wizard.step < wizard.total) showStep(wizard.step + 1);
    });
  }
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (wizard.step > 1) showStep(wizard.step - 1);
    });
  }

  $$('input[name="service"]').forEach(function (input) {
    input.addEventListener('change', function () {
      selected.service = input.value;
      clearError('err-service');
      saveDraft();
      if (wizard.step === 1) setTimeout(function () { showStep(2); }, 180);
    });
  });

  /* ---------------- маска телефона ---------------- */
  function digits(v) { return (v || '').replace(/\D/g, ''); }
  function formatPhone(v) {
    var d = digits(v);
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' ' + d.slice(1, 4);
    if (d.length >= 5) out += ' ' + d.slice(4, 7);
    if (d.length >= 8) out += ' ' + d.slice(7, 9);
    if (d.length >= 10) out += ' ' + d.slice(9, 11);
    return out;
  }
  var phoneInput = $('#f-phone');
  if (phoneInput) {
    phoneInput.addEventListener('focus', function () {
      if (!phoneInput.value) phoneInput.value = '+7 ';
    });
    phoneInput.addEventListener('input', function () {
      phoneInput.value = formatPhone(phoneInput.value);
      clearError('err-phone');
      saveDraft();
    });
    phoneInput.addEventListener('blur', function () {
      if (digits(phoneInput.value).length <= 1) phoneInput.value = '';
    });
  }
  ['f-name', 'f-comment'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearError('err-' + id.slice(2)); saveDraft(); });
  });
  var consentInput = $('#f-consent');
  if (consentInput) consentInput.addEventListener('change', function () {
    consentInput.classList.remove('is-invalid');
    var e = $('#err-consent'); if (e) e.hidden = true;
  });

  /* ---------------- календарь ---------------- */
  var calGrid = $('#cal-grid');
  var calLabel = $('#cal-label');
  var calPrev = $('#cal-prev');
  var calNext = $('#cal-next');
  var view = new Date();
  view.setDate(1);

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfToday() {
    var t = new Date(); t.setHours(0, 0, 0, 0); return t;
  }
  function renderCalendar() {
    if (!calGrid) return;
    calGrid.innerHTML = '';
    calLabel.textContent = view.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');

    var firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
    var daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    var today = startOfToday();

    for (var i = 0; i < firstDow; i++) {
      var pad = document.createElement('span');
      pad.className = 'day day--empty';
      pad.style.visibility = 'hidden';
      calGrid.appendChild(pad);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      (function (day) {
        var date = new Date(view.getFullYear(), view.getMonth(), day);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day';
        btn.textContent = String(day);
        btn.setAttribute('aria-label', date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));
        if (date < today) { btn.disabled = true; }
        else {
          btn.addEventListener('click', function () {
            selected.date = new Date(date.getTime());
            clearError('err-date');
            renderCalendar();
            renderSummary();
            saveDraft();
            setTimeout(function () { showStep(3); }, 190);
          });
        }
        if (sameDay(date, today)) btn.classList.add('is-today');
        if (sameDay(date, selected.date)) btn.classList.add('is-selected');
        calGrid.appendChild(btn);
      })(d);
    }

    var canGoBack = view.getFullYear() > today.getFullYear() ||
      (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth());
    if (calPrev) {
      calPrev.disabled = !canGoBack;
      calPrev.style.opacity = canGoBack ? '' : '.4';
    }
  }
  if (calPrev) calPrev.addEventListener('click', function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCalendar();
  });
  if (calNext) calNext.addEventListener('click', function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCalendar();
  });
  renderCalendar();

  /* ---------------- слоты времени ---------------- */
  var slotsWrap = $('#slots');
  (function buildSlots() {
    if (!slotsWrap) return;
    var frag = document.createDocumentFragment();
    for (var h = BOOKING_CONFIG.hours.open; h < BOOKING_CONFIG.hours.close; h++) {
      for (var m = 0; m < 60; m += 30) {
        var label = (h < 10 ? '0' + h : h) + ':' + (m === 0 ? '00' : '30');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot';
        b.textContent = label;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', 'false');
        b.setAttribute('aria-label', 'Время ' + label);
        (function (value, btn) {
          btn.addEventListener('click', function () {
            selected.time = value;
            $$('.slot', slotsWrap).forEach(function (s) {
              s.classList.remove('is-selected');
              s.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('is-selected');
            btn.setAttribute('aria-checked', 'true');
            clearError('err-time');
            renderSummary();
            saveDraft();
            setTimeout(function () { showStep(4); }, 190);
          });
        })(label, b);
        frag.appendChild(b);
      }
    }
    slotsWrap.appendChild(frag);
  })();

  /* ---------------- сводка и черновик ---------------- */
  function formatDateRu(d) {
    if (!d) return '—';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');
  }
  function renderSummary() {
    var box = $('#summary');
    if (!box) return;
    box.hidden = false;
    box.innerHTML =
      '<div><span>Услуга</span><strong>' + esc(selected.service || '—') + '</strong></div>' +
      '<div><span>Дата</span><strong>' + esc(formatDateRu(selected.date)) + '</strong></div>' +
      '<div><span>Время</span><strong>' + esc(selected.time || '—') + '</strong></div>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var DRAFT_KEY = 'sunak-booking-draft';
  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        service: selected.service,
        date: selected.date ? selected.date.toISOString() : null,
        time: selected.time,
        name: ($('#f-name') || {}).value || '',
        phone: ($('#f-phone') || {}).value || '',
        comment: ($('#f-comment') || {}).value || ''
      }));
    } catch (e) { /* приватный режим — просто не сохраняем */ }
  }
  function restoreDraft() {
    var raw;
    try { raw = sessionStorage.getItem(DRAFT_KEY); } catch (e) { return; }
    if (!raw) return;
    try {
      var d = JSON.parse(raw);
      if (d.service && !selected.service) { selected.service = d.service; selectService(d.service); }
      if (d.date && !selected.date) selected.date = new Date(d.date);
      if (d.time && !selected.time) {
        selected.time = d.time;
        $$('.slot', slotsWrap).forEach(function (s) {
          var on = s.textContent === d.time;
          s.classList.toggle('is-selected', on);
          s.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      }
      if (d.name && $('#f-name') && !$('#f-name').value) $('#f-name').value = d.name;
      if (d.phone && $('#f-phone') && !$('#f-phone').value) $('#f-phone').value = d.phone;
      if (d.comment && $('#f-comment') && !$('#f-comment').value) $('#f-comment').value = d.comment;
      renderCalendar();
      renderSummary();
    } catch (e) { /* некорректный черновик игнорируем */ }
  }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ } }

  /* ---------------- payload ---------------- */
  function buildPayload() {
    return {
      name: $('#f-name') ? $('#f-name').value.trim() : '',
      phone: formatPhone($('#f-phone') ? $('#f-phone').value : ''),
      service: selected.service,
      date: selected.date ? selected.date.toISOString().slice(0, 10) : '',
      time: selected.time,
      comment: $('#f-comment') ? $('#f-comment').value.trim() : '',
      source: 'website',
      createdAt: new Date().toISOString()
    };
  }
  function messageText(p) {
    return 'Здравствуйте! Заявка на запись с сайта ' + BOOKING_CONFIG.business + '.\n\n' +
      'Имя: ' + p.name + '\n' +
      'Телефон: ' + p.phone + '\n' +
      'Услуга: ' + p.service + '\n' +
      'Дата: ' + formatDateRu(selected.date) + '\n' +
      'Время: ' + p.time + '\n' +
      'Комментарий: ' + (p.comment || '—');
  }
  function whatsappLink(p) {
    return 'https://wa.me/' + BOOKING_CONFIG.whatsapp + '?text=' + encodeURIComponent(messageText(p));
  }

  function renderSuccess(p, mode) {
    var dl = $('#success-summary');
    if (dl) {
      dl.innerHTML =
        '<div><dt>Имя</dt><dd>' + esc(p.name) + '</dd></div>' +
        '<div><dt>Телефон</dt><dd>' + esc(p.phone) + '</dd></div>' +
        '<div><dt>Услуга</dt><dd>' + esc(p.service) + '</dd></div>' +
        '<div><dt>Дата</dt><dd>' + esc(formatDateRu(selected.date)) + '</dd></div>' +
        '<div><dt>Время</dt><dd>' + esc(p.time) + '</dd></div>' +
        (p.comment ? '<div><dt>Комментарий</dt><dd>' + esc(p.comment) + '</dd></div>' : '');
    }
    var title = $('#success-title'), text = $('#success-text');
    if (mode === 'backend') {
      title.textContent = 'Заявка отправлена';
      text.textContent = 'Мы получили вашу заявку и свяжемся с вами для подтверждения записи. Если нужно срочно — позвоните или напишите в WhatsApp.';
    } else {
      title.textContent = 'Заявка сформирована';
      text.textContent = 'Остался один шаг: отправьте заявку в WhatsApp — мастер получит её сразу и подтвердит время. Так быстрее всего узнать и стоимость.';
    }
    var wa = $('#success-wa');
    if (wa) wa.setAttribute('href', whatsappLink(p));
    var copy = $('#success-copy');
    if (copy) {
      copy.onclick = function () {
        var txt = messageText(p);
        var done = function () {
          copy.textContent = 'Детали скопированы';
          setTimeout(function () { copy.textContent = 'Скопировать детали заявки'; }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = txt; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) { /* ignore */ }
          document.body.removeChild(ta); done();
        }
      };
    }
    if (form) form.hidden = true;
    var prog = $('#wizard-progress');
    if (prog) prog.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------------- отправка ---------------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }
      if (!validateStep(4)) return;

      var payload = buildPayload();

      if (!BOOKING_CONFIG.endpoint) {
        clearDraft();
        renderSuccess(payload, 'whatsapp');
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      nextBtn.disabled = true;
      if (statusEl) statusEl.textContent = 'Отправляем заявку…';

      fetch(BOOKING_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          clearDraft();
          if (statusEl) statusEl.textContent = '';
          renderSuccess(payload, 'backend');
        })
        .catch(function () {
          if (statusEl) {
            statusEl.className = 'form-status is-error';
            statusEl.innerHTML = 'Не удалось отправить заявку. Напишите нам в WhatsApp или позвоните — ' +
              '<a href="' + whatsappLink(payload) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">открыть WhatsApp</a>.';
          }
        })
        .then(function () {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          nextBtn.disabled = false;
        });
    });
  }

  /* ---------------- сброс под новую запись ---------------- */
  function resetBooking() {
    if (form) form.hidden = false;
    var prog = $('#wizard-progress');
    if (prog) prog.hidden = false;
    if (success) success.hidden = true;
    if (form) form.reset();
    selected = { service: '', date: null, time: '' };
    $$('.slot', slotsWrap).forEach(function (s) { s.classList.remove('is-selected'); s.setAttribute('aria-checked', 'false'); });
    $$('.field-error').forEach(function (e) { e.hidden = true; });
    $$('.is-invalid').forEach(function (e) { e.classList.remove('is-invalid'); });
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }
    var sum = $('#summary'); if (sum) sum.hidden = true;
    var today = new Date(); view = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
    showStep(1);
  }
  var successClose = $('#success-close');
  if (successClose) successClose.addEventListener('click', function () { setTimeout(resetBooking, 320); });

  /* ---------------- клавиатура ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lightbox && !lightbox.hidden) { closeLightbox(); return; }
      if (modal && !modal.hidden) { closeModal(); return; }
      closeNav();
    }
    if (lightbox && !lightbox.hidden) {
      if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
    }
    if (modal && !modal.hidden && e.key === 'Tab') {
      var focusables = $$('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- прочее ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  showStep(1);
  window.SUNAK = { config: BOOKING_CONFIG, reset: resetBooking };
})();
