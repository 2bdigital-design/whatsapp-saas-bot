-- ============================================================
-- WhatsApp SaaS Bot — Schema Supabase
-- Execute no SQL Editor em app.supabase.com
-- ============================================================

-- Tabela de tenants (seus clientes)
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  plan            TEXT DEFAULT 'starter',
  active          BOOLEAN DEFAULT true,
  assistant_id    TEXT,
  bot_name        TEXT DEFAULT 'Assistente',
  bot_greeting    TEXT DEFAULT 'Olá! Como posso ajudar?',
  business_hours  JSONB DEFAULT '{"enabled": false}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conversas
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  phone       TEXT NOT NULL,
  thread_id   TEXT,
  status      TEXT DEFAULT 'bot',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

-- Tabela de mensagens
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usuários do painel (agentes humanos)
CREATE TABLE tenant_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'agent',
  UNIQUE(tenant_id, user_id)
);

-- Índices
CREATE INDEX idx_conversations_tenant    ON conversations(tenant_id);
CREATE INDEX idx_conversations_phone     ON conversations(phone);
CREATE INDEX idx_messages_conversation   ON messages(conversation_id);
CREATE INDEX idx_messages_tenant         ON messages(tenant_id);
CREATE INDEX idx_messages_created        ON messages(created_at DESC);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_conversations"
  ON conversations FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation_messages"
  ON messages FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_users_own"
  ON tenant_users FOR ALL
  USING (user_id = auth.uid());

-- Função utilitária: contar mensagens por tenant
CREATE OR REPLACE FUNCTION get_tenant_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages      BIGINT,
  active_conversations BIGINT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COUNT(DISTINCT c.id)                                          AS total_conversations,
    COUNT(m.id)                                                   AS total_messages,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'bot')         AS active_conversations
  FROM conversations c
  LEFT JOIN messages m ON m.conversation_id = c.id
  WHERE c.tenant_id = p_tenant_id;
$$;
