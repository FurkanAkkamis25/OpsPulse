import { useEffect, useState } from 'react';
import client from '../api/client';

export interface Agent {
  id: string;
  name: string;
  apiKey: string;
  lastSeen: string | null;
  createdAt: string;
  _count: { servers: number };
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await client.get<Agent[]>('/agents');
      setAgents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const createAgent = async (name: string): Promise<Agent> => {
    const { data } = await client.post<Agent>('/agents', { name });
    setAgents((prev) => [data, ...prev]);
    return data;
  };

  const deleteAgent = async (id: string) => {
    await client.delete(`/agents/${id}`);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return { agents, loading, createAgent, deleteAgent, refresh: fetch };
}
