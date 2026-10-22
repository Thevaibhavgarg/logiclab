import { useRef } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

export default function Toolbar() {
  const circuitName = useCircuitStore(s => s.circuitName);
  const isDirty = useCircuitStore(s => s.isDirty);
  const setCircuitName = useCircuitStore(s => s.setCircuitName);
  const clearCircuit = useCircuitStore(s => s.clearCircuit);
  const saveCircuit = useCircuitStore(s => s.saveCircuit);
  const exportCircuit = useCircuitStore(s => s.exportCircuit);
  const importCircuit = useCircuitStore(s => s.importCircuit);
  const setActiveTab = useCircuitStore(s => s.setActiveTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) importCircuit(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNew = () => {
    if (window.confirm('Start a new circuit? Unsaved changes will be lost.')) {
      clearCircuit();
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 border-b border-gray-700 bg-gray-900"
         style={{ height: 48, flexShrink: 0 }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-neon text-lg">⚡</span>
        <span className="font-bold text-gray-100 text-sm tracking-wide">LogicLab</span>
      </div>

      <div className="h-4 w-px bg-gray-700" />

      {/* Circuit name */}
      <div className="flex items-center gap-1">
        <input
          value={circuitName}
          onChange={e => setCircuitName(e.target.value)}
          className="bg-transparent border-b border-gray-600 focus:border-neon outline-none text-gray-200 text-sm px-1 py-0.5 transition-colors"
          style={{ width: 160 }}
        />
        {isDirty && <span className="text-gray-500 text-xs">●</span>}
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={handleNew}
        className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        New
      </button>
      <button
        onClick={saveCircuit}
        className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Save
      </button>
      <button
        onClick={() => setActiveTab('saves')}
        className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Load
      </button>
      <button
        onClick={exportCircuit}
        className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Import
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  );
}
