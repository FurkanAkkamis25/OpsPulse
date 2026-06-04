import axios from 'axios';

const OPSPULSE_URL = process.env.OPSPULSE_URL?.replace(/\/$/, '');
const AGENT_KEY = process.env.AGENT_KEY;
const INTERVAL_MS = Number(process.env.INTERVAL_MS) || 30_000;

if (!OPSPULSE_URL || !AGENT_KEY) {
  console.error('Missing required env vars: OPSPULSE_URL, AGENT_KEY');
  process.exit(1);
}

const syncClient = axios.create({
  baseURL: `${OPSPULSE_URL}/api/agent-sync`,
  headers: { 'x-agent-key': AGENT_KEY },
  timeout: 10_000,
});

interface AssignedServer {
  id: string;
  name: string;
  url: string;
  threshold: number | null;
}

async function pingServer(server: AssignedServer) {
  const start = Date.now();
  try {
    const res = await axios.get(server.url, { timeout: 10_000 });
    const latency = Date.now() - start;
    const isUp = res.status < 400;
    console.log(`[${server.name}] ${isUp ? 'UP' : 'DOWN'} — ${latency}ms`);
    return { serverId: server.id, latency, statusCode: res.status, isUp };
  } catch {
    console.log(`[${server.name}] UNREACHABLE`);
    return { serverId: server.id, latency: null, statusCode: null, isUp: false };
  }
}

async function runCycle() {
  let servers: AssignedServer[] = [];
  try {
    const { data } = await syncClient.get<AssignedServer[]>('/servers');
    servers = data;
  } catch (err: any) {
    console.error('Failed to fetch server list:', err.message);
    return;
  }

  if (servers.length === 0) return;

  const results = await Promise.all(servers.map(pingServer));

  try {
    await syncClient.post('/results', { results });
  } catch (err: any) {
    console.error('Failed to push results:', err.message);
  }
}

console.log(`OpsPulse Agent started — polling every ${INTERVAL_MS / 1000}s`);
runCycle();
setInterval(runCycle, INTERVAL_MS);
