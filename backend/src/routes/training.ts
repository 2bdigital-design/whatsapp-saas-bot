import { FastifyInstance } from 'fastify';
import { supabase } from '../services/supabase';
import { addDocumentToAssistant } from '../services/openai';
import { log } from '../utils/logger';

export default async function trainingRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.INTERNAL_SECRET}`) {
      return reply.status(401).send({ error: 'Não autorizado' });
    }

    const data = await req.file();
    if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' });

    const tenantSlug = (req.headers['x-tenant-slug'] as string) || '';
    if (!tenantSlug) return reply.status(400).send({ error: 'x-tenant-slug obrigatório' });

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, assistant_id')
      .eq('slug', tenantSlug)
      .single();

    if (error || !tenant?.assistant_id) {
      return reply.status(404).send({ error: 'Tenant ou assistant não encontrado' });
    }

    const buffer = await data.toBuffer();
    const { fileId, vectorStoreId } = await addDocumentToAssistant(
      tenant.assistant_id,
      buffer,
      data.filename
    );

    log('info', 'Documento adicionado ao assistant', { tenantSlug, fileId, vectorStoreId });
    return reply.send({ success: true, fileId, vectorStoreId });
  });
}
