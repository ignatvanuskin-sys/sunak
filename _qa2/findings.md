# QA-2 findings — http://127.0.0.1:8081/index.html

Scope: 8 checks. All measured via JS (getBoundingClientRect / computed styles).

IMPORTANT process note:
- The tab that was already open at run start held a STALE/cached build:
  * H1 font 89.6px → 5 lines, hero 945px (> 900), facts bar cut off
  * `#copy-phone` had NO click listener (`btn._t` undefined)
- After a hard reload (fresh assets) all checks pass. All results below are from the FRESH load.
- Mid-run the local server on :8081 stopped (ERR_CONNECTION_REFUSED). Restarted it
  (`python -m http.server 8081 --directory <workspace>`) to finish checks 7–8.

## 1) Hero one screen — OK
1440×900: H1 lines=3, fontSize=80px, hero height=900 (=innerHeight, fits=true), .hero__facts bottom=900 (<=900, fully visible).
1280×800: H1 lines=3, fontSize=77.6px, hero height=800 (=innerHeight, fits=true), facts bottom=800 (fully visible).
Screenshot: _qa2/fix-hero-1440.png

## 2) Mobile menu @390 — OK
Open: #nav computed display=flex, rect height=519px (>0), opacity=1, pointer-events=auto, burger aria-expanded=true.
Items (8): Услуги, Почему мы, Работы, Отзывы, Вопросы, Контакты + phone CTA + Записаться.
  NOTE: the phone CTA is labelled with the number "+7 775 337 57 93" (tel: link), NOT the word «Позвонить».
Re-click burger: aria-expanded=false, opacity=0, pointer-events=none (display stays flex) => closed.
Click «Услуги»: closes (aria=false, opacity=0) AND scrolls to #services (scrollY 0 -> 1891, #services top=84px).
Screenshot: _qa2/fix-mobile-menu.png

## 3) Copy phone (#copy-phone) — OK (on fresh load)
before="Копировать номер" -> click -> text="Номер скопирован" synchronously (btn._t timer set), reverts after 2600ms.

## 4) Reviews indicator (#rev-indicator) @1440 — OK
initial: "Отзыв 1 из 10" (scrollLeft 0)
click #rev-next +700ms: "Отзыв 2 из 10" (scrollLeft 366)
click #rev-next +700ms: "Отзыв 3 из 10" (scrollLeft 732)
Caveat: in a BACKGROUND tab the smooth scrollBy settle exceeded 700ms (updated ~1.1s). With tab focused => within 700ms.

## 5) Lightbox — OK
click photo -> #lightbox hidden=false, display=flex, #lightbox-img src=assets/img/opt/sunak-1.jpg
click #lb-next -> src=assets/img/opt/sunak-2.jpg (changed)
Esc -> #lightbox hidden=true, display=none

## 6) Footer vs mobilebar @390 — OK
at bottom (scrollY=16509=max). Copy/last footer line (.footer__bottom) bottom=778; last text line (P "Данные о компании…") bottom=758; .mobilebar top=779.
copyright bottom (758/778) < mobilebar top (779) => not covered.

## 7) Console & network — OK
Errors: [] (0 JS errors).
Fresh-load requests, all 200: index.html, assets/css/styles.css, assets/js/app.js,
assets/img/opt/sunak-1.jpg, sunak-1.webp, sunak-2..8.webp, assets/favicon.svg, fonts. 0 x 404/500.
Only non-complete <img> = #lightbox-img with empty src (resolves to document URL) — expected, no failed request.

## 8) Horizontal scroll — OK
320 -> scrollWidth 305 ; 360 -> 345 ; 390 -> 375 ; 430 -> 415 ; 1440 -> 1425.
All scrollWidth <= innerWidth + 1 (constant -15px scrollbar).

## Screenshots
- _qa2/fix-hero-1440.png
- _qa2/fix-mobile-menu.png
