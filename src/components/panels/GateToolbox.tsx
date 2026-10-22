import type { DragEvent } from 'react';
import type { GateType } from '../../types/circuit';

interface GateItem {
  type: GateType;
  label: string;
  shortcut?: string;
}

const GATE_GROUPS: { title: string; items: GateItem[] }[] = [
  {
    title: 'Logic Gates',
    items: [
      { type: 'AND',  label: 'AND' },
      { type: 'OR',   label: 'OR' },
      { type: 'NOT',  label: 'NOT' },
      { type: 'XOR',  label: 'XOR' },
      { type: 'NAND', label: 'NAND' },
      { type: 'NOR',  label: 'NOR' },
    ],
  },
  {
    title: 'I / O',
    items: [
      { type: 'INPUT',  label: 'Input Switch' },
      { type: 'OUTPUT', label: 'Output LED' },
    ],
  },
  {
    title: 'Sequential',
    items: [
      { type: 'SR_LATCH',  label: 'SR Latch' },
      { type: 'D_FLIPFLOP', label: 'D Flip-Flop' },
    ],
  },
];

// Tiny SVG previews for the toolbox
function GatePreview({ type }: { type: GateType }) {
  const s = '#9ca3af';
  const f = '#1a1a2e';
  switch (type) {
    case 'AND':  return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M5,10 L28,10 C54,10 54,34 28,34 L5,34 Z" fill={f} stroke={s} strokeWidth={2} /></svg>;
    case 'NAND': return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M5,10 L26,10 C52,10 52,34 26,34 L5,34 Z" fill={f} stroke={s} strokeWidth={2} /><circle cx="56" cy="22" r="4" fill="#0f0f0f" stroke={s} strokeWidth={2} /></svg>;
    case 'OR':   return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M5,10 Q20,10 46,22 Q20,34 5,34 Q18,22 5,10 Z" fill={f} stroke={s} strokeWidth={2} /></svg>;
    case 'NOR':  return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M5,10 Q20,10 42,22 Q20,34 5,34 Q18,22 5,10 Z" fill={f} stroke={s} strokeWidth={2} /><circle cx="48" cy="22" r="4" fill="#0f0f0f" stroke={s} strokeWidth={2} /></svg>;
    case 'XOR':  return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M10,10 Q25,10 46,22 Q25,34 10,34 Q23,22 10,10 Z" fill={f} stroke={s} strokeWidth={2} /><path d="M3,10 Q16,22 3,34" fill="none" stroke={s} strokeWidth={2} /></svg>;
    case 'NOT':  return <svg width="28" height="20" viewBox="0 0 60 44"><path d="M5,10 L46,22 L5,34 Z" fill={f} stroke={s} strokeWidth={2} /><circle cx="50" cy="22" r="4" fill="#0f0f0f" stroke={s} strokeWidth={2} /></svg>;
    case 'INPUT': return <div className="w-7 h-5 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-400" style={{ fontSize: 9 }}>0</div>;
    case 'OUTPUT': return <svg width="20" height="20" viewBox="0 0 36 36"><circle cx="18" cy="18" r="12" fill="#111827" stroke={s} strokeWidth={2} /></svg>;
    case 'SR_LATCH':   return <div className="w-7 h-5 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-500" style={{ fontSize: 8 }}>SR</div>;
    case 'D_FLIPFLOP': return <div className="w-7 h-5 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-500" style={{ fontSize: 8 }}>DFF</div>;
    default: return null;
  }
}

export default function GateToolbox() {
  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: GateType) => {
    e.dataTransfer.setData('application/logiclab-gate', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col border-r border-gray-700 bg-panel overflow-y-auto" style={{ width: 180 }}>
      {GATE_GROUPS.map(group => (
        <div key={group.title}>
          <div className="px-3 pt-3 pb-1">
            <span className="text-gray-500 uppercase tracking-wider" style={{ fontSize: 10, fontWeight: 600 }}>
              {group.title}
            </span>
          </div>
          {group.items.map(item => (
            <div
              key={item.type}
              draggable
              onDragStart={e => handleDragStart(e, item.type)}
              className="flex items-center gap-2 mx-2 mb-1 px-2 py-2 rounded cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-600 select-none"
            >
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 20 }}>
                <GatePreview type={item.type} />
              </div>
              <span className="text-gray-300 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="flex-1" />
      <div className="p-3 border-t border-gray-700 text-gray-600 text-center" style={{ fontSize: 10 }}>
        Drag to canvas
      </div>
    </div>
  );
}
