-- =============================================================
-- SQL Views para Dashboards ASX-Agente
-- Executar no Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================

-- View 1: Funil diario agregado
CREATE OR REPLACE VIEW v_funnel_summary AS
SELECT
  DATE_TRUNC('day', fl.created_at)::date AS day,
  COUNT(*)::int AS total_leads,
  COUNT(*) FILTER (WHERE fl.path = 1)::int AS path1_disqualified,
  COUNT(*) FILTER (WHERE fl.path = 2)::int AS path2_distributor,
  COUNT(*) FILTER (WHERE fl.path = 3)::int AS path3_qualified,
  COUNT(*) FILTER (WHERE fl.status = 'contacted')::int AS contacted,
  COUNT(*) FILTER (WHERE fl.status = 'in_conversation')::int AS in_conversation,
  COUNT(*) FILTER (WHERE fl.status = 'handoff_done')::int AS handoff_done,
  COUNT(*) FILTER (WHERE fl.status = 'disqualified_cnpj')::int AS disqualified_cnpj,
  COUNT(*) FILTER (WHERE fl.status = 'disqualified_policy')::int AS disqualified_policy,
  COUNT(*) FILTER (WHERE fl.status = 'send_failed')::int AS send_failed
FROM fb_leads fl
GROUP BY DATE_TRUNC('day', fl.created_at)::date
ORDER BY day DESC;

-- View 2: Pipeline completo do Path 3
CREATE OR REPLACE VIEW v_path3_pipeline AS
SELECT
  fl.id AS fb_lead_id,
  fl.nome,
  fl.telefone,
  fl.perfil,
  fl.volume_faixa,
  fl.volume_numerico,
  fl.estado_envio,
  fl.razao_social,
  fl.nome_fantasia,
  fl.status,
  fl.created_at AS lead_created_at,
  l.id AS lead_id,
  l.score,
  l.class,
  l.priority,
  l.qualified_at,
  l.ja_compra_asx_regiao,
  l.fornecedor_asx_regiao,
  l.nfs_enviadas,
  l.empresa_recente,
  a.assignee_id,
  ag.name AS vendedor_nome,
  a.assigned_at,
  EXTRACT(EPOCH FROM (l.qualified_at - fl.created_at)) / 3600.0 AS hours_to_qualify,
  (SELECT COUNT(*)::int FROM ia_messages im WHERE im.phone = fl.telefone AND im.direction = 'user') AS user_messages,
  (SELECT COUNT(*)::int FROM ia_messages im WHERE im.phone = fl.telefone AND im.direction = 'assistant') AS agent_messages
FROM fb_leads fl
LEFT JOIN contacts c ON c.phone = fl.telefone
LEFT JOIN leads l ON l.contact_id = c.id
LEFT JOIN assignments a ON a.lead_id = l.id
LEFT JOIN agents ag ON ag.id = a.assignee_id
WHERE fl.path = 3;

-- View 3: Performance por estado/regiao
CREATE OR REPLACE VIEW v_regional_performance AS
SELECT
  fl.estado_envio AS estado,
  CASE
    WHEN fl.estado_envio IN ('AC','AM','AP','PA','RO','RR','TO') THEN 'Norte'
    WHEN fl.estado_envio IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 'Nordeste'
    ELSE 'Outros'
  END AS regiao,
  COUNT(*)::int AS total_leads,
  COUNT(*) FILTER (WHERE fl.path = 3)::int AS qualified,
  COUNT(*) FILTER (WHERE fl.status = 'handoff_done')::int AS handoff,
  ROUND(AVG(l.score) FILTER (WHERE l.score IS NOT NULL), 1) AS avg_score,
  COUNT(DISTINCT dr.distributor_id)::int AS distributors_recommended
FROM fb_leads fl
LEFT JOIN contacts c ON c.phone = fl.telefone
LEFT JOIN leads l ON l.contact_id = c.id
LEFT JOIN distributor_recommendations dr ON dr.fb_lead_id::text = fl.id::text
GROUP BY fl.estado_envio;
