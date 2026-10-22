import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { GateNodeData } from '../../../types/circuit';
import { useCircuitStore } from '../../../store/circuitStore';

const OutputNode = ({ data, selected, id }: NodeProps<GateNodeData>) => {
  const deleteNode = useCircuitStore(s => s.deleteNode);
  const isHigh = (data.inputSignals?.['input-0'] ?? 0) === 1;

  return (
    <div
      className={`group relative flex flex-col items-center justify-center rounded border transition-all ${
        selected ? 'border-neon' : 'border-gray-600'
      } bg-surface`}
      style={{ width: 72, height: 64 }}
    >
      {/* Delete button */}
      <button
        className="nodrag absolute -top-2 -right-2 w-5 h-5 bg-red-700 hover:bg-red-500 text-white rounded-full flex items-center justify-center z-50 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); deleteNode(id); }}
        title="Delete node"
      >
        <svg viewBox="0 0 10 10" width="8" height="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
        </svg>
      </button>
      {/* LED circle */}
      <svg width="36" height="36" viewBox="0 0 36 36">
        {/* Outer ring */}
        <circle
          cx="18"
          cy="18"
          r="14"
          fill={isHigh ? '#0d2e0d' : '#111827'}
          stroke={isHigh ? '#39ff14' : '#374151'}
          strokeWidth="2"
          className={isHigh ? 'output-led-high' : ''}
          style={{ transition: 'all 150ms ease' }}
        />
        {/* Inner glow */}
        <circle
          cx="18"
          cy="18"
          r="10"
          fill={isHigh ? '#39ff1422' : 'transparent'}
          style={{ transition: 'all 150ms ease' }}
        />
        {/* Highlight */}
        {isHigh && (
          <circle cx="13" cy="12" r="3" fill="#39ff1466" />
        )}
        {/* Center dot */}
        <circle
          cx="18"
          cy="18"
          r="4"
          fill={isHigh ? '#39ff14' : '#374151'}
          style={{ transition: 'all 150ms ease' }}
        />
      </svg>

      {/* Label */}
      <div className="text-gray-400 mt-1" style={{ fontSize: 10 }}>
        {data.label}
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-0"
        style={{ top: '44%' }}
        className={isHigh ? 'handle-high' : 'handle-low'}
      />
    </div>
  );
};

export default OutputNode;
