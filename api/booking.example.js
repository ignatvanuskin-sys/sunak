/**
 * ПРИМЕР обработчика заявок для системы онлайн-записи СТО «Сунақ».
 *
 * Это НЕ рабочий production-файл — это заготовка, которая показывает, как
 * подключить реальный backend за один шаг. Пока файл не подключён, сайт
 * работает в WhatsApp-режиме (см. assets/js/app.js → BOOKING_CONFIG).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ЧТО ПОЛУЧАЕТ АДМИНИСТРАТОР (payload от формы):
 * {
 *   "name": "Иван",
 *   "phone": "+7 775 337 57 93",
 *   "service": "Аргонная сварка",
 *   "date": "2026-10-12",       // YYYY-MM-DD
 *   "time": "14:30",
 *   "comment": "корпус КПП, нужна сварка",
 *   "source": "website",
 *   "createdAt": "2026-10-08T09:12:00.000Z"
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * КАК ПОДКЛЮЧИТЬ (3 шага):
 *   1. Скопируйте файл в свой проект как api/booking.js (например, Vercel
 *      Functions / Netlify Functions / любой Node-хостинг).
 *   2. Задайте переменные окружения:
 *        TELEGRAM_BOT_TOKEN=123456:AA...        (бот от @BotFather)
 *        TELEGRAM_CHAT_ID=123456789             (id администратора или группы)
 *   3. В assets/js/app.js пропишите: endpoint: '/api/booking'
 *
 * Дополнительно можно раскомментировать блок записи в Google Sheets,
 * отправку e-mail через SMTP или сохранение в базу данных (Postgres/Supabase).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// --- Telegram-уведомление администратору ---
async function notifyTelegram(payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: true };

  const text =
    '🔧 Новая запись — СТО «Сунақ»\n\n' +
    `Имя: ${payload.name}\n` +
    `Телефон: ${payload.phone}\n` +
    `Услуга: ${payload.service}\n` +
    `Дата: ${payload.date}\n` +
    `Время: ${payload.time}\n` +
    `Комментарий: ${payload.comment || '—'}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
  });
  return res.json();
}

// --- Валидация на сервере (никогда не доверяйте только фронтенду) ---
function validate(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['Пустой запрос'];
  if (!payload.name || String(payload.name).trim().length < 2) errors.push('name');
  if (!/^\+?[\d\s()-]{10,20}$/.test(String(payload.phone || ''))) errors.push('phone');
  if (!payload.service) errors.push('service');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(payload.date || ''))) errors.push('date');
  if (!/^\d{2}:\d{2}$/.test(String(payload.time || ''))) errors.push('time');
  return errors;
}

/**
 * Универсальный handler: подходит для Vercel (`export default`) и Netlify.
 * Для Express используйте router.post('/api/booking', sameLogic).
 */
export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  // Разбор тела запроса (Vercel парсит JSON автоматически; Netlify — тоже)
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { payload = null; }
  }

  const errors = validate(payload);
  if (errors.length) {
    res.status(400).json({ ok: false, error: 'Validation failed', fields: errors });
    return;
  }

  const record = {
    id: 'SNK-' + Date.now().toString(36).toUpperCase(),
    name: String(payload.name).trim().slice(0, 80),
    phone: String(payload.phone).trim().slice(0, 24),
    service: String(payload.service).slice(0, 120),
    date: payload.date,
    time: payload.time,
    comment: String(payload.comment || '').slice(0, 600),
    source: payload.source || 'website',
    createdAt: new Date().toISOString()
  };

  try {
    // 1) Уведомление администратору
    await notifyTelegram(record);

    // 2) Здесь можно добавить:
    //    - сохранение в БД (Supabase / Postgres / MongoDB);
    //    - запись в Google Sheets (googleapis);
    //    - письмо администратору и подтверждение клиенту;
    //    - webhook в CRM (Bitrix24 / amoCRM).

    res.status(200).json({ ok: true, id: record.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Delivery failed' });
  }
}
