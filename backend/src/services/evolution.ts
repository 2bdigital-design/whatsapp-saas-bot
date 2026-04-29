import axios from 'axios';

const BASE_URL = process.env.EVOLUTION_API_URL!;
const API_KEY  = process.env.EVOLUTION_API_KEY!;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { apikey: API_KEY },
});

export async function sendTextMessage(instanceName: string, phone: string, text: string) {
  await client.post(`/message/sendText/${instanceName}`, {
    number: phone,
    text,
  });
}

export async function createInstance(instanceName: string) {
  const body: Record<string, unknown> = {
    instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
  };

  // Optional residential proxy to bypass data-center IP blocks.
  // Set PROXY_HOST, PROXY_PORT, PROXY_PROTOCOL (http|socks5),
  // and optionally PROXY_USER / PROXY_PASS in backend/.env
  if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
    body.proxy = {
      host: process.env.PROXY_HOST,
      port: Number(process.env.PROXY_PORT),
      protocol: process.env.PROXY_PROTOCOL ?? 'http',
      ...(process.env.PROXY_USER ? { username: process.env.PROXY_USER } : {}),
      ...(process.env.PROXY_PASS ? { password: process.env.PROXY_PASS } : {}),
    };
  }

  const res = await client.post('/instance/create', body);
  return res.data;
}

export async function getQRCode(instanceName: string) {
  const res = await client.get(`/instance/connect/${instanceName}`);
  return res.data;
}

export async function getInstanceStatus(instanceName: string) {
  const res = await client.get(`/instance/connectionState/${instanceName}`);
  return res.data;
}

export async function deleteInstance(instanceName: string) {
  const res = await client.delete(`/instance/delete/${instanceName}`);
  return res.data;
}
