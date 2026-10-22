import { useCircuitStore } from '../../store/circuitStore';

export default function Notification() {
  const notification = useCircuitStore(s => s.notification);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none select-none
        ${notification.type === 'success'
          ? 'bg-green-950 text-neon border border-neon/30 shadow-[0_0_10px_#39ff1422]'
          : 'bg-red-950 text-red-300 border border-red-800'
        }`}
      style={{ transition: 'all 200ms ease' }}
    >
      {notification.message}
    </div>
  );
}
