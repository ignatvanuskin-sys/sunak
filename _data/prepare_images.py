# -*- coding: utf-8 -*-
"""Готовит веб-версии фотографий: assets/img/opt/*.jpg + *.webp.

Исходники (assets/img/*.jpg, скачанные из 2ГИС) переносятся в _data/originals,
чтобы папка деплоя содержала только оптимизированные изображения.
"""
import os
import shutil
from PIL import Image, ImageOps

SRC = 'assets/img'
ORIG = os.path.join('_data', 'originals')
OUT = os.path.join('assets', 'img', 'opt')

os.makedirs(ORIG, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

MAX_W = 1200
Q_JPEG = 78
Q_WEBP = 76

report = []
for name in sorted(os.listdir(SRC)):
    if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    path = os.path.join(SRC, name)
    im = Image.open(path)
    im = ImageOps.exif_transpose(im).convert('RGB')

    # исходник — в _data/originals
    shutil.move(path, os.path.join(ORIG, name))

    w, h = im.size
    if w > MAX_W:
        im = im.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)

    base = os.path.splitext(name)[0].replace(' ', '-').lower()
    im.save(os.path.join(OUT, base + '.jpg'), 'JPEG',
            quality=Q_JPEG, optimize=True, progressive=True, subsampling='4:2:0')
    im.save(os.path.join(OUT, base + '.webp'), 'WEBP', quality=Q_WEBP, method=6)

    jpg_kb = os.path.getsize(os.path.join(OUT, base + '.jpg')) / 1024
    webp_kb = os.path.getsize(os.path.join(OUT, base + '.webp')) / 1024
    report.append('%s -> %s  %dx%d  jpg %.0f KB / webp %.0f KB' % (name, base, im.size[0], im.size[1], jpg_kb, webp_kb))

print('\n'.join(report))
total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print('TOTAL opt folder: %.0f KB' % (total / 1024))
