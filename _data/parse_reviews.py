# -*- coding: utf-8 -*-
import json, io, os

revs = []
for f in ['_data/reviews_p1.json', '_data/reviews_p2.json']:
    with io.open(f, encoding='utf-8') as fh:
        d = json.load(fh)
    for r in d.get('reviews', []):
        revs.append({
            'rating': r.get('rating'),
            'name': (r.get('user') or {}).get('name'),
            'date': (r.get('date_created') or '')[:10],
            'text': (r.get('text') or '').strip(),
            'answer': r.get('official_answer'),
        })

# dedupe by (name, text)
seen = set()
uniq = []
for r in revs:
    k = (r['name'], r['text'])
    if k in seen:
        continue
    seen.add(k)
    uniq.append(r)

uniq.sort(key=lambda x: (-(x['rating'] or 0), x['date']))

out = []
out.append('TOTAL_RAW=%d UNIQUE=%d' % (len(revs), len(uniq)))
from collections import Counter
out.append('RATING_DIST=' + str(sorted(Counter(r['rating'] for r in uniq).items())))
out.append('')
for r in uniq:
    out.append('---')
    out.append('RATING: %s | NAME: %s | DATE: %s' % (r['rating'], r['name'], r['date']))
    out.append(r['text'])
    if r['answer']:
        out.append('ANSWER: ' + str(r['answer'])[:300])

with io.open('_data/reviews_readable.txt', 'w', encoding='utf-8') as fh:
    fh.write('\n'.join(out))

print(out[0])
print(out[1])
