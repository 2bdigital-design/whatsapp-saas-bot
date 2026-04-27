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
  const res = await client.post('/instance/create', {
    instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
  });
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
