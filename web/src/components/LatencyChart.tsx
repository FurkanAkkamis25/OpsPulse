import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchPingLogs, PingLog } from '../hooks/useServers';

interface Props {
  serverId: string;
  threshold: number | null;
}

export default function LatencyChart({ serverId, threshold }: Props) {
  const [logs, setLogs] = useState<PingLog[]>([]);

  useEffect(() => {
    fetchPingLogs(serverId).then((data) => setLogs([...data].reverse()));
  }, [serverId]);

  const data = logs.map((l) => ({
    time: new Date(l.checkedAt).toLocaleTimeString(),
    latency: l.latency,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} unit="ms" width={45} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#38bdf8' }}
        />
        {threshold && (
          <ReferenceLine y={threshold} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'threshold', fill: '#f59e0b', fontSize: 10 }} />
        )}
        <Line type="monotone" dataKey="latency" stroke="#38bdf8" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
