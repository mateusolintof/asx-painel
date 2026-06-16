#!/usr/bin/env python3
"""
Seed de dados mock para o painel ASX.
Cria ~30 clientes interligados (Path 1/2/3) cobrindo todas as paginas do dashboard.
Tudo marcado para limpeza facil:
  fb_leads.form_id   = 'MOCK_SEED'
  companies.size     = 'MOCK_SEED'
  leads.source       = 'mock_seed'
  ia_messages.session_id = 'mock_seed'
Cleanup: rode scripts/clean-mock-data.py
Le credenciais de .env.local (NUNCA imprime a service key).
"""
import json, random, urllib.request, urllib.error, sys, datetime as dt

random.seed(42)

# ---- carregar env ----
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

def api(method, path, data=None, prefer='return=representation'):
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(URL + path, data=body, method=method)
    r.add_header('apikey', KEY)
    r.add_header('Authorization', 'Bearer ' + KEY)
    r.add_header('Content-Type', 'application/json')
    if prefer:
        r.add_header('Prefer', prefer)
    try:
        with urllib.request.urlopen(r) as resp:
            txt = resp.read().decode() or '[]'
            return resp.status, json.loads(txt) if txt.strip().startswith(('[', '{')) else txt
    except urllib.error.HTTPError as e:
        raise SystemExit('API %s %s -> %d: %s' % (method, path, e.code, e.read().decode()[:400]))

def ins(table, obj):
    _, rep = api('POST', '/rest/v1/%s' % table, [obj])
    return rep[0]

# ---- pre-requisitos: agentes e distribuidores existentes ----
_, agents = api('GET', '/rest/v1/agents?select=id,name', None, prefer=None)
if not agents:
    raise SystemExit('Sem agentes cadastrados (tabela agents vazia).')
agent_ids = [a['id'] for a in agents]
print('Agentes:', {a['id']: a['name'] for a in agents})

_, dists = api('GET', '/rest/v1/distributors?select=id,estado_uf&limit=300', None, prefer=None)
dist_by_uf = {}
for d in dists:
    dist_by_uf.setdefault(d.get('estado_uf'), []).append(d['id'])
all_dist_ids = [d['id'] for d in dists]
print('Distribuidores disponiveis:', len(all_dist_ids))

# ---- helpers de data (ultimos 30 dias a partir de 2026-06-16) ----
TODAY = dt.datetime(2026, 6, 16, 12, 0, 0, tzinfo=dt.timezone.utc)
def days_ago(n, hour=9, minute=0):
    base = TODAY - dt.timedelta(days=n)
    return base.replace(hour=hour, minute=minute, second=0, microsecond=0)
def iso(d):
    return d.isoformat()

def fake_cnpj(seed):
    random.seed(seed)
    n = [random.randint(0, 9) for _ in range(8)]
    return "%d%d.%d%d%d.%d%d%d/0001-%02d" % (*n, random.randint(10, 99))

CITY = {
    'PA': 'Belem', 'CE': 'Fortaleza', 'BA': 'Salvador', 'AM': 'Manaus',
    'MA': 'Sao Luis', 'PE': 'Recife', 'RN': 'Natal', 'PI': 'Teresina',
    'AL': 'Maceio', 'SE': 'Aracaju', 'TO': 'Palmas', 'RO': 'Porto Velho',
    'SP': 'Sao Paulo', 'RS': 'Porto Alegre', 'SC': 'Joinville', 'PR': 'Curitiba',
    'MG': 'Belo Horizonte', 'RJ': 'Rio de Janeiro', 'GO': 'Goiania',
}
DDD = {
    'PA': '91', 'CE': '85', 'BA': '71', 'AM': '92', 'MA': '98', 'PE': '81',
    'RN': '84', 'PI': '86', 'AL': '82', 'SE': '79', 'TO': '63', 'RO': '69',
    'SP': '11', 'RS': '51', 'SC': '47', 'PR': '41', 'MG': '31', 'RJ': '21', 'GO': '62',
}
PERFIS = ['Lojista', 'Auto Center', 'Mecanica', 'Acessorios', 'Instalador']

def phone_for(uf, seq):
    return '55%s9%08d' % (DDD[uf], 10000000 + seq)

def score_to_class(s):
    if s >= 70: return 'quente', 'urgent'
    if s >= 40: return 'morno', 'high'
    return 'frio', 'medium'

created = {'companies': 0, 'contacts': 0, 'fb_leads': 0, 'leads': 0,
           'assignments': 0, 'recs': 0, 'messages': 0}
hot_count = 0
seq = 0

# =========================================================
# PATH 3 — Operacao ASX (N/NE, volume >= R$4k, qualificados)
# =========================================================
PATH3 = [
    # nome, empresa, uf, perfil, volume_faixa, volume_num, score, status, dias_atras
    ("Marcos Vinicius",   "Farois & Cia",          "PA", "Lojista",     "R$ 10.000 - R$ 20.000", 15000, 88, "handoff_done",    28),
    ("Juliana Castro",    "Auto Luz Fortaleza",    "CE", "Auto Center", "Acima de R$ 20.000",    32000, 92, "handoff_done",    25),
    ("Rafael Lima",       "Mega Acessorios BA",    "BA", "Acessorios",  "R$ 4.000 - R$ 10.000",   7000, 74, "handoff_done",    21),
    ("Patricia Souza",    "Iluminar Manaus",       "AM", "Lojista",     "R$ 10.000 - R$ 20.000", 18000, 81, "in_conversation", 18),
    ("Eduardo Fontes",    "Centro Automotivo SL",  "MA", "Mecanica",    "R$ 4.000 - R$ 10.000",   6000, 69, "in_conversation", 16),
    ("Camila Nogueira",   "LED Recife Parts",      "PE", "Lojista",     "Acima de R$ 20.000",    45000, 95, "handoff_done",    14),
    ("Bruno Carvalho",    "Natal Auto Pecas",      "RN", "Auto Center", "R$ 4.000 - R$ 10.000",   8500, 66, "in_conversation", 12),
    ("Larissa Mendes",    "Teresina Iluminacao",   "PI", "Acessorios",  "R$ 10.000 - R$ 20.000", 14000, 78, "handoff_done",    10),
    ("Gustavo Ferreira",  "Maceio Car Light",      "AL", "Instalador",  "R$ 4.000 - R$ 10.000",   5500, 52, "contacted",        8),
    ("Tatiane Ribeiro",   "Aracaju Auto Style",    "SE", "Lojista",     "R$ 10.000 - R$ 20.000", 16000, 84, "in_conversation",  6),
    ("Felipe Andrade",    "Palmas Off Road",       "TO", "Auto Center", "Acima de R$ 20.000",    28000, 90, "handoff_done",     5),
    ("Vanessa Pires",     "Belem Truck Light",     "PA", "Mecanica",    "R$ 4.000 - R$ 10.000",   9000, 71, "contacted",        3),
    ("Rodrigo Teixeira",  "Fortaleza Xenon Pro",   "CE", "Acessorios",  "R$ 10.000 - R$ 20.000", 12000, 58, "in_conversation",  2),
    ("Aline Barbosa",     "Salvador Super Farois", "BA", "Lojista",     "Acima de R$ 20.000",    38000, 97, "handoff_done",     1),
]

for nome, empresa, uf, perfil, vfaixa, vnum, score, status, dago in PATH3:
    seq += 1
    cls, prio = score_to_class(score)
    if cls == 'quente':
        hot_count += 1
    fone = phone_for(uf, seq)
    cnpj = fake_cnpj(1000 + seq)
    created_at = days_ago(dago, hour=random.randint(8, 18), minute=random.randint(0, 59))
    qualified_at = created_at + dt.timedelta(hours=random.randint(2, 8))

    company = ins('companies', {
        'cnpj': cnpj, 'legal_name': empresa + ' LTDA', 'trade_name': empresa,
        'cnae': '4520-0/01', 'city': CITY[uf], 'state': uf,
        'size': 'MOCK_SEED', 'created_at': iso(created_at),
    })
    created['companies'] += 1
    contact = ins('contacts', {
        'phone': fone, 'name': '%s - %s' % (nome, empresa), 'created_at': iso(created_at),
    })
    created['contacts'] += 1
    fb = ins('fb_leads', {
        'facebook_lead_id': 'MOCK-%03d' % seq, 'form_id': 'MOCK_SEED', 'page_id': 'MOCK_SEED',
        'nome': nome, 'email': nome.lower().replace(' ', '.') + '@example.com',
        'telefone': fone, 'telefone_raw': fone, 'perfil': perfil,
        'volume_faixa': vfaixa, 'volume_numerico': vnum,
        'cnpj': cnpj, 'cnpj_raw': cnpj, 'cnpj_valido': True,
        'razao_social': empresa + ' LTDA', 'nome_fantasia': empresa,
        'cnae': '4520-0/01', 'cnpj_city': CITY[uf], 'cnpj_state': uf,
        'estado_envio': uf, 'path': 3, 'path_reason': 'Volume>=4k + regiao N/NE',
        'status': status, 'handoff_done': status == 'handoff_done',
        'agent_type': 'sdr', 'ja_compra_asx_regiao': random.choice(['sim', 'nao', 'desconhecido']),
        'fornecedor_asx_regiao': random.choice(['N/A', 'concorrente_x', 'desconhecido']),
        'nfs_enviadas': random.choice([True, False]), 'empresa_recente': random.choice([True, False]),
        'created_at': iso(created_at), 'updated_at': iso(qualified_at),
    })
    created['fb_leads'] += 1
    lead = ins('leads', {
        'contact_id': contact['id'], 'company_id': company['id'],
        'perfil': perfil, 'regiao': uf, 'volume': str(vnum),
        'score': score, 'class': cls, 'priority': prio,
        'qualified_at': iso(qualified_at), 'created_at': iso(created_at),
        'source': 'mock_seed', 'fb_lead_id': fb['id'],
        'ja_compra_asx_regiao': 'desconhecido', 'fornecedor_asx_regiao': 'N/A',
        'nfs_enviadas': False, 'empresa_recente': False,
    })
    created['leads'] += 1
    # assignment (round-robin entre agentes)
    assignee = agent_ids[seq % len(agent_ids)]
    assigned_at = qualified_at + dt.timedelta(hours=random.randint(1, 4))
    ins('assignments', {
        'lead_id': lead['id'], 'assignee_id': assignee, 'assigned_at': iso(assigned_at),
    })
    created['assignments'] += 1
    # conversa (ia_messages)
    convo = [
        ('assistant', 'Oi %s! Aqui e a ASX Iluminacao Automotiva. Vi seu interesse, posso te fazer umas perguntas rapidas?' % nome.split()[0]),
        ('user', 'Pode sim'),
        ('assistant', 'Voce trabalha como %s, certo? Qual seu volume medio de compra mensal?' % perfil.lower()),
        ('user', 'Giro uns %s por mes' % vfaixa.lower()),
        ('assistant', 'Perfeito, voce se encaixa no nosso atendimento direto. Ja vou te conectar com um consultor ASX.'),
    ]
    if status == 'handoff_done':
        convo.append(('assistant', 'Pronto %s! Voce ja foi conectado ao consultor ASX. Ele vai te chamar para fechar o primeiro pedido.' % nome.split()[0]))
    msg_t = created_at + dt.timedelta(minutes=10)
    for direction, content in convo:
        ins('ia_messages', {
            'phone': fone, 'direction': direction, 'content': content,
            'session_id': 'mock_seed', 'created_at': iso(msg_t),
        })
        created['messages'] += 1
        msg_t += dt.timedelta(minutes=random.randint(3, 40))

print('Path 3 criados:', len(PATH3), '| quentes:', hot_count)

# =========================================================
# PATH 2 — Rede parceira (fora N/NE OU volume baixo) -> distribuidores
# =========================================================
PATH2 = [
    ("Carlos Eduardo",  "Sul Auto Parts",      "RS", "Lojista",    "Ate R$ 4.000",          2500, 20),
    ("Marina Lopes",    "SP Car Center",       "SP", "Auto Center","R$ 4.000 - R$ 10.000",  8000, 19),
    ("Thiago Moreira",  "Curitiba Pecas",      "PR", "Mecanica",   "Ate R$ 4.000",          1800, 17),
    ("Daniela Rocha",   "Joinville Light",     "SC", "Acessorios", "R$ 4.000 - R$ 10.000",  6500, 15),
    ("Anderson Silva",  "Minas Auto Eletrico", "MG", "Instalador", "Ate R$ 4.000",          3000, 13),
    ("Priscila Gomes",  "Rio Farois",          "RJ", "Lojista",    "Ate R$ 4.000",          2200, 11),
    ("Wagner Dias",     "Goiania Off Road",    "GO", "Auto Center","R$ 4.000 - R$ 10.000",  7200,  9),
    ("Renata Alves",    "Paulista Iluminacao", "SP", "Acessorios", "Ate R$ 4.000",          1500,  7),
    ("Leandro Pinto",   "Gaucho Car Light",    "RS", "Mecanica",   "Ate R$ 4.000",          2800,  4),
    ("Bianca Martins",  "Sul Acessorios",      "SC", "Lojista",    "Ate R$ 4.000",          1200,  2),
]
for nome, empresa, uf, perfil, vfaixa, vnum, dago in PATH2:
    seq += 1
    fone = phone_for(uf, seq)
    cnpj = fake_cnpj(2000 + seq)
    created_at = days_ago(dago, hour=random.randint(8, 18), minute=random.randint(0, 59))
    reason = 'Volume < R$4k' if vnum < 4000 else 'Fora do Norte/Nordeste'
    fb = ins('fb_leads', {
        'facebook_lead_id': 'MOCK-%03d' % seq, 'form_id': 'MOCK_SEED', 'page_id': 'MOCK_SEED',
        'nome': nome, 'email': nome.lower().replace(' ', '.') + '@example.com',
        'telefone': fone, 'telefone_raw': fone, 'perfil': perfil,
        'volume_faixa': vfaixa, 'volume_numerico': vnum,
        'cnpj': cnpj, 'cnpj_raw': cnpj, 'cnpj_valido': True,
        'razao_social': empresa + ' LTDA', 'nome_fantasia': empresa,
        'cnae': '4520-0/01', 'cnpj_city': CITY[uf], 'cnpj_state': uf,
        'estado_envio': uf, 'path': 2, 'path_reason': reason,
        'status': 'contacted', 'handoff_done': False, 'agent_type': 'sdr',
        'created_at': iso(created_at), 'updated_at': iso(created_at),
    })
    created['fb_leads'] += 1
    # recomendar 1-3 distribuidores (preferir mesmo estado)
    pool = dist_by_uf.get(uf) or all_dist_ids
    n = min(len(pool), random.randint(1, 3))
    for did in random.sample(pool, n):
        ins('distributor_recommendations', {
            'fb_lead_id': fb['id'], 'distributor_id': did,
            'recommended_at': iso(created_at + dt.timedelta(minutes=5)),
        })
        created['recs'] += 1
    # 1 mensagem de redirecionamento
    ins('ia_messages', {
        'phone': fone, 'direction': 'assistant',
        'content': 'Oi %s! Pelo seu perfil, o ideal e comprar com um distribuidor parceiro ASX da sua regiao. Vou te enviar os contatos.' % nome.split()[0],
        'session_id': 'mock_seed', 'created_at': iso(created_at + dt.timedelta(minutes=4)),
    })
    created['messages'] += 1

print('Path 2 criados:', len(PATH2))

# =========================================================
# PATH 1 — Fora do perfil (CNPJ invalido) -> desqualificado
# =========================================================
PATH1 = [
    ("Jose Pereira",   "SP", 27), ("Fernanda Cruz", "MG", 23),
    ("Paulo Henrique", "RJ", 20), ("Sandra Maria",  "BA", 13),
    ("Roberto Nunes",  "CE", 7),  ("Lucas Aragao",  "PA", 3),
]
for nome, uf, dago in PATH1:
    seq += 1
    fone = phone_for(uf, seq)
    created_at = days_ago(dago, hour=random.randint(8, 18), minute=random.randint(0, 59))
    ins('fb_leads', {
        'facebook_lead_id': 'MOCK-%03d' % seq, 'form_id': 'MOCK_SEED', 'page_id': 'MOCK_SEED',
        'nome': nome, 'email': nome.lower().replace(' ', '.') + '@example.com',
        'telefone': fone, 'telefone_raw': fone, 'perfil': 'Consumidor Final',
        'volume_faixa': 'Nao informado', 'volume_numerico': 0,
        'cnpj_raw': '000', 'cnpj_valido': False,
        'estado_envio': uf, 'path': 1, 'path_reason': 'CNPJ invalido',
        'status': 'disqualified_cnpj', 'handoff_done': False, 'agent_type': 'sdr',
        'created_at': iso(created_at), 'updated_at': iso(created_at),
    })
    created['fb_leads'] += 1

print('Path 1 criados:', len(PATH1))
print('\n=== RESUMO INSERIDO ===')
for k, v in created.items():
    print('  %-12s %d' % (k, v))
print('Total clientes (fb_leads novos):', created['fb_leads'])
