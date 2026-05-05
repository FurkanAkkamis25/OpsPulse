import { useEffect, useState } from 'react';
import client from '../api/client';

export interface Server {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  healthScore: number | null;
  threshold: number | null;
  createdAt: string;
}

export interface PingLog {
  id: string;
  latency: number | null;
  isUp: boolean;
  checkedAt: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  sentAt: string;
}

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await client.get<Server[]>('/servers');
    setServers(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const addServer = async (name: string, url: string) => {
    const { data } = await client.post<Server>('/servers', { name, url });
    setServers((prev) => [data, ...prev]);
  };

  const deleteServer = async (id: string) => {
    await client.delete(`/servers/${id}`);
    setServers((prev) => prev.filter((s) => s.id !== id));
  };

  const updateThreshold = async (id: string, threshold: number) => {
    const { data } = await client.patch<Server>(`/servers/${id}/threshold`, { threshold });
    setServers((prev) => prev.map((s) => (s.id === id ? data : s)));
  };

  return { servers, loading, addServer, deleteServer, updateThreshold, refresh: fetch };
}

export async function fetchPingLogs(serverId: string, limit = 60): Promise<PingLog[]> {
  const { data } = await client.get<PingLog[]>(`/servers/${serverId}/logs?limit=${limit}`);
  return data;
}

export async function fetchAlerts(serverId: string): Promise<Alert[]> {
  const { data } = await client.get<Alert[]>(`/servers/${serverId}/alerts`);
  return data;
}
