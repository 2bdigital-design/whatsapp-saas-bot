import { FastifyInstance } from 'fastify';
import { supabase } from '../services/supabase';
import { saveWaCredentials, getCredsBySlug } from '../services/wa-credentials';
import { createAssistant, buildInstructions } from '../services/openai';
import { log } from '../utils/logger';

export default async function tenantRoutes(app: FastifyInstance) {
  app.post('/create', async (req, reply) => {
    const { name, email, companyName, businessType, userId, transferKeyword } = req.body as {
      name: string;
      email: string;
      companyName: string;
      businessType: string;
      userId: string;
      transferKeyword?: string;
    };

    const slug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ name, email, slug, bot_name: `Assistente ${companyName}` })
      .select()
      .single();

    if (tenantError) {
      log('error', 'Erro ao criar tenant', { error: tenantError.message });
      return reply.status(400).send({ error: tenantError.message });
    }

    const instructions = buildInstructions({
      botName: `Assistente ${companyName}`,
      companyName,
      businessType,
      transferKeyword,
    });

    const assistantId = await createAssistant(`Bot ${companyName}`, instructions);

    await supabase.from('tenants').update({ assistant_id: assistantId }).eq('id', tenant.id);

    await supabase.from('tenant_users').insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: 'owner',
    });

    log('info', 'Tenant criado com sucesso', { slug, assistantId });
    return reply.send({ success: true, tenant: { id: tenant.id, slug } });
  });

  /**
   * Salva as credenciais WhatsApp Cloud API do tenant.
   * Body: { phoneNumberId, accessToken }
   */
  app.post('/:slug/whatsapp-credentials', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const { phoneNumberId, accessToken } = req.body as {
      phoneNumberId: string;
      accessToken: string;
    };

    if (!phoneNumberId || !accessToken) {
      return reply.status(400).send({ error: 'phoneNumberId e accessToken são obrigatórios' });
    }

    try {
      await saveWaCredentials(slug, phoneNumberId, accessToken);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log('error', 'Erro ao salvar credenciais WA', { slug, msg });
      return reply.status(500).send({ error: msg });
    }

    log('info', 'Credenciais WA Cloud API salvas', { slug });
    return reply.send({ success: true });
  });

  /**
   * Retorna status da conexão WhatsApp do tenant.
   */
  app.get('/:slug/status', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const creds = await getCredsBySlug(slug).catch(() => null);
    return reply.send({ connected: !!(creds?.phoneNumberId && creds?.accessToken) });
  });

  app.delete('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };

    await supabase.from('tenants').update({ active: false }).eq('slug', slug);

    return reply.send({ success: true });
  });

  app.get('/', async (_req, reply) => {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug, email, plan, active, created_at')
      .order('created_at', { ascending: false });

    if (error) return reply.status(500).send({ error: error.message });
    return reply.send(data);
  });
}
