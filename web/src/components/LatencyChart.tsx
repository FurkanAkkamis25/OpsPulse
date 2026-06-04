import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { fetchPingLogs, PingLog } from '../hooks/useServers';

interface Props { serverId: string; threshold: number | null; }

export default function LatencyChart({ serverId, threshold }: Props) {
  const [logs, setLogs] = useState<PingLog[]>([]);

  useEffect(() => {
    fetchPingLogs(serverId).then((data) => setLogs([...data].reverse()));
  }, [serverId]);

  const data = logs.map((l) => ({
    time: new Date(l.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: l.isUp ? l.latency : null,
  }));

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-xs">
        Henüz veri yok — ilk ping bekleniyor
      </div>
    );
  }

  return (
    <div className="mt-2 -mx-1">
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id={`g-${serverId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit="ms" width={36} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            labelStyle={{ color: '#64748b', fontSize: 11 }}
            itemStyle={{ color: '#0284c7', fontWeight: 600 }}
            formatter={(v: number) => [`${v} ms`, 'Gecikme']}
          />
          {threshold && (
            <ReferenceLine y={threshold} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: `${threshold}ms`, fill: '#d97706', fontSize: 9, position: 'insideTopRight' }} />
          )}
          <Area type="monotone" dataKey="latency" stroke="#0ea5e9" strokeWidth={2}
            fill={`url(#g-${serverId})`} dot={false}
            activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
