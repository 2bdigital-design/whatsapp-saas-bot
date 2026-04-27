import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { createBullBoard } from '@bull-board/api';
import type { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { messageQueue } from './queues/messageQueue';
import './queues/worker';
import webhookRoutes from './routes/webhook';
import tenantRoutes from './routes/tenants';
import trainingRoutes from './routes/training';
import { log } from './utils/logger';

const app = Fastify({ logger: false });

app.register(cors, {
  origin: [process.env.PANEL_URL ?? '*', 'http://localhost:3001'],
  credentials: true,
});

app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

const serverAdapter = new FastifyAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(messageQueue) as unknown as BaseAdapter],
  serverAdapter,
});
app.register(serverAdapter.registerPlugin(), { basePath: '/admin/queues', prefix: '/admin/queues' });

app.register(webhookRoutes, { prefix: '/webhook' });
app.register(tenantRoutes,  { prefix: '/api/tenants' });
app.register(trainingRoutes, { prefix: '/api/training' });

app.get('/health', async () => ({ status: 'ok', ts: new Date() }));

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    log('info', `Backend rodando na porta ${port}`);
  } catch (err) {
    log('error', 'Erro ao iniciar servidor', err);
    process.exit(1);
  }
};

start();
