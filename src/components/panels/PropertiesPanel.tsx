import { useState } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import TruthTablePanel from './TruthTablePanel';

function SavesPanel() {
  const [tick, setTick] = useState(0);
  const loadCircuit = useCircuitStore(s => s.loadCircuit);
  const saveCircuit = useCircuitStore(s => s.saveCircuit);
  const showNotification = useCircuitStore(s => s.showNotification);

  const getIndex = () => {
    try { return JSON.parse(localStorage.getItem('logiclab:index') ?? '[]') as { name: string; savedAt: string }[]; }
    catch { return []; }
  };

  const handleSave = () => {
    saveCircuit();
    setTick(t => t + 1);
  };

  const handleLoad = (name: string) => {
    try {
      const raw = localStorage.getItem(`logiclab:circuit:${name}`);
      if (!raw) { showNotification('Not found', 'error'); return; }
      loadCircuit(JSON.parse(raw));
    } catch { showNotification('Failed to load', 'error'); }
  };

  const handleDelete = (name: string) => {
    localStorage.removeItem(`logiclab:circuit:${name}`);
    const idx = getIndex().filter(e => e.name !== name);
    localStorage.setItem('logiclab:index', JSON.stringify(idx));
    showNotification('Deleted', 'success');
    setTick(t => t + 1);
  };

  void tick;

  const items = getIndex();

  return (
    <div className="p-3 flex flex-col gap-2">
      <button
        onClick={handleSave}
        className="w-full py-2 rounded text-sm font-medium bg-neon/10 hover:bg-neon/20 text-neon border border-neon/30 hover:border-neon/60 transition-colors"
      >
        Save Current Circuit
      </button>
      {items.length === 0 ? (
        <div className="text-gray-600 text-sm text-center py-4">No saved circuits yet</div>
      ) : (
        <div className="flex flex-col gap-1 mt-2">
          {items.map(item => (
            <div key={item.name} className="flex items-center gap-2 p-2 rounded bg-gray-800 border border-gray-700 hover:border-gray-600">
              <div className="flex-1 min-w-0">
                <div className="text-gray-200 text-sm truncate">{item.name}</div>
                <div className="text-gray-500 text-xs">{new Date(item.savedAt).toLocaleString()}</div>
              </div>
              <button onClick={() => handleLoad(item.name)} className="text-xs text-blue-400 hover:text-blue-300 px-2">Load</button>
              <button onClick={() => handleDelete(item.name)} className="text-xs text-red-400 hover:text-red-300 px-2">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertiesContent() {
  const selectedNodeId = useCircuitStore(s => s.selectedNodeId);
  const nodes = useCircuitStore(s => s.nodes);
  const signalMap = useCircuitStore(s => s.signalMap);
  const updateNodeLabel = useCircuitStore(s => s.updateNodeLabel);

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-600 text-center px-4">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm">Click a node to inspect its signals</div>
        </div>
      </div>
    );
  }

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const signals = signalMap[selectedNodeId] ?? {};
  const inputSigs = node.data.inputSignals ?? {};

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Label</div>
        <input
          value={node.data.label}
          onChange={e => updateNodeLabel(selectedNodeId, e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 focus:border-neon rounded px-2 py-1 text-gray-200 text-sm outline-none transition-colors"
        />
      </div>
      <div>
        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Type</div>
        <div className="text-gray-300 text-sm font-mono">{node.data.gateType}</div>
      </div>
      {Object.keys(inputSigs).length > 0 && (
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Inputs</div>
          <div className="flex flex-col gap-1">
            {Object.entries(inputSigs).map(([handle, val]) => (
              <div key={handle} className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-mono">{handle}</span>
                <span className={`text-sm font-mono font-bold ${val ? 'text-neon' : 'text-gray-500'}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {Object.keys(signals).length > 0 && (
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Outputs</div>
          <div className="flex flex-col gap-1">
            {Object.entries(signals).map(([handle, val]) => (
              <div key={handle} className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-mono">{handle}</span>
                <span className={`text-sm font-mono font-bold ${val ? 'text-neon' : 'text-gray-500'}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {node.data.sequentialState && (
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">State</div>
          <div className="flex gap-3">
            <span className={`text-sm font-mono ${node.data.sequentialState.Q ? 'text-neon' : 'text-gray-500'}`}>
              Q={node.data.sequentialState.Q}
            </span>
            <span className={`text-sm font-mono ${node.data.sequentialState.Qn ? 'text-neon' : 'text-gray-500'}`}>
              Q̄={node.data.sequentialState.Qn}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPanel() {
  const activeTab = useCircuitStore(s => s.activeTab);
  const setActiveTab = useCircuitStore(s => s.setActiveTab);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'properties', label: 'Properties' },
    { key: 'truthtable', label: 'Truth Table' },
    { key: 'saves', label: 'Saved' },
  ];

  return (
    <div className="flex flex-col border-l border-gray-700 bg-panel" style={{ width: 280 }}>
      {/* Tab bar */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'border-neon text-neon'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && <PropertiesContent />}
        {activeTab === 'truthtable' && <TruthTablePanel />}
        {activeTab === 'saves' && <SavesPanel />}
      </div>
    </div>
  );
}
