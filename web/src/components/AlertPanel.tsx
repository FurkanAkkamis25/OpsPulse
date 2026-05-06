import { Alert } from '../hooks/useServers';

const TYPE_STYLES: Record<string, string> = {
  DOWN: 'text-red-400 bg-red-400/10',
  RECOVERED: 'text-green-400 bg-green-400/10',
  THRESHOLD_BREACH: 'text-yellow-400 bg-yellow-400/10',
  PREDICTED_FAILURE: 'text-orange-400 bg-orange-400/10',
};

interface Props { alerts: Alert[] }

export default function AlertPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return <p className="text-xs text-gray-600 py-1">No alerts</p>;
  }

  return (
    <ul className="space-y-2 max-h-48 overflow-y-auto">
      {alerts.map((alert) => (
        <li key={alert.id} className="flex items-start gap-2">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${TYPE_STYLES[alert.type] ?? 'text-gray-400 bg-gray-400/10'}`}>
            {alert.type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-400 leading-5">{alert.message}</span>
        </li>
      ))}
    </ul>
  );
}
