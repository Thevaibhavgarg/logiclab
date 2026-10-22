import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { GateNodeData } from '../../../types/circuit';
import { useCircuitStore } from '../../../store/circuitStore';

const InputNode = ({ data, id, selected }: NodeProps<GateNodeData>) => {
  const toggleInput = useCircuitStore(s => s.toggleInput);
  const deleteNode = useCircuitStore(s => s.deleteNode);
  const isHigh = data.value === 1;

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
      {/* Toggle button */}
      <button
        className={`nodrag w-12 h-9 rounded-md border-2 font-mono font-bold text-xl transition-all cursor-pointer select-none ${
          isHigh
            ? 'bg-green-950 border-neon text-neon shadow-[0_0_12px_#39ff1466]'
            : 'bg-gray-800 border-gray-600 text-gray-500 hover:border-gray-500'
        }`}
        onClick={() => toggleInput(id)}
      >
        {isHigh ? '1' : '0'}
      </button>

      {/* Label */}
      <div className="text-gray-400 mt-1" style={{ fontSize: 10 }}>
        {data.label}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-0"
        style={{ top: '44%' }}
        className={isHigh ? 'handle-high' : 'handle-low'}
      />
    </div>
  );
};

export default InputNode;
