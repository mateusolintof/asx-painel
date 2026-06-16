#!/usr/bin/env python3
"""
Remove TODOS os dados mock criados por seed-mock-data.py.
Apaga na ordem correta de FK. Le credenciais de .env.local.
"""
import json, urllib.request, urllib.error

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
URL = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
KEY = env['SUPABASE_SERVICE_ROLE_KEY']

def api(method, path, prefer='return=representation'):
    r = urllib.request.Request(URL + path, method=method)
    r.add_header('apikey', KEY)
    r.add_header('Authorization', 'Bearer ' + KEY)
    r.add_header('Content-Type', 'application/json')
    if prefer:
        r.add_header('Prefer', prefer)
    try:
        with urllib.request.urlopen(r) as resp:
            txt = resp.read().decode()
            return resp.status, json.loads(txt) if txt.strip().startswith(('[', '{')) else txt
    except urllib.error.HTTPError as e:
        raise SystemExit('API %s %s -> %d: %s' % (method, path, e.code, e.read().decode()[:400]))

def get_ids(table, where, col='id'):
    _, rows = api('GET', '/rest/v1/%s?select=%s&%s' % (table, col, where), prefer=None)
    return [r[col] for r in rows]

# coletar ids dos mocks
mock_fb_ids = get_ids('fb_leads', 'form_id=eq.MOCK_SEED')
mock_phones = get_ids('fb_leads', 'form_id=eq.MOCK_SEED', col='telefone')
mock_lead_ids = get_ids('leads', 'source=eq.mock_seed')
print('Mock encontrados: fb_leads=%d leads=%d' % (len(mock_fb_ids), len(mock_lead_ids)))

def del_in(table, col, ids):
    if not ids:
        return 0
    total = 0
    for i in range(0, len(ids), 50):
        chunk = ids[i:i+50]
        vals = ','.join('"%s"' % x if isinstance(x, str) else str(x) for x in chunk)
        _, rep = api('DELETE', '/rest/v1/%s?%s=in.(%s)' % (table, col, vals))
        total += len(rep) if isinstance(rep, list) else 0
    return total

# ordem FK-safe
n_rec = del_in('distributor_recommendations', 'fb_lead_id', mock_fb_ids)
n_asg = del_in('assignments', 'lead_id', mock_lead_ids)
_, msg = api('DELETE', '/rest/v1/ia_messages?session_id=eq.mock_seed')
n_msg = len(msg) if isinstance(msg, list) else 0
n_lead = del_in('leads', 'id', mock_lead_ids)
n_ct = del_in('contacts', 'phone', mock_phones)
_, comp = api('DELETE', '/rest/v1/companies?size=eq.MOCK_SEED')
n_comp = len(comp) if isinstance(comp, list) else 0
n_fb = del_in('fb_leads', 'id', mock_fb_ids)

print('Removido: recs=%d assignments=%d messages=%d leads=%d contacts=%d companies=%d fb_leads=%d'
      % (n_rec, n_asg, n_msg, n_lead, n_ct, n_comp, n_fb))
