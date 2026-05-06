import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
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
    time: new Date(l.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: l.isUp ? l.latency : null,
    down: l.isUp ? null : 0,
  }));

  if (data.length === 0) {
    return <p className="text-xs text-gray-600 py-4 text-center">No data yet</p>;
  }

  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#4b5563' }}
            interval="preserveStartEnd"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4b5563' }}
            unit="ms"
            width={42}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#6b7280', marginBottom: 4 }}
            itemStyle={{ color: '#38bdf8' }}
            formatter={(v: number) => [`${v} ms`, 'Latency']}
          />
          {threshold && (
            <ReferenceLine
              y={threshold}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{ value: `${threshold}ms`, fill: '#f59e0b', fontSize: 10, position: 'right' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
