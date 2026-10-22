import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { GateNodeData, SignalValue } from '../../../types/circuit';
import { useCircuitStore } from '../../../store/circuitStore';

const SRLatchNode = ({ data, selected, id }: NodeProps<GateNodeData>) => {
  const deleteNode = useCircuitStore(s => s.deleteNode);
  const Q  = (data.outputSignals?.['output-q']  ?? 0) as SignalValue;
  const Qn = (data.outputSignals?.['output-nq'] ?? 0) as SignalValue;
  const inS = (data.inputSignals?.['input-s'] ?? 0) as SignalValue;
  const inR = (data.inputSignals?.['input-r'] ?? 0) as SignalValue;
  const forbidden = inS === 1 && inR === 1;

  return (
    <div
      className={`group relative flex flex-col items-center justify-center rounded border ${
        selected ? 'border-neon shadow-[0_0_8px_#39ff1444]' : forbidden ? 'border-yellow-500' : 'border-gray-600'
      } bg-surface`}
      style={{ width: 88, height: 88 }}
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
      {/* Handles */}
      <Handle type="target" position={Position.Left} id="input-s"
        style={{ top: '28%' }} className={inS ? 'handle-high' : 'handle-low'} />
      <Handle type="target" position={Position.Left} id="input-r"
        style={{ top: '68%' }} className={inR ? 'handle-high' : 'handle-low'} />
      <Handle type="source" position={Position.Right} id="output-q"
        style={{ top: '28%' }} className={Q ? 'handle-high' : 'handle-low'} />
      <Handle type="source" position={Position.Right} id="output-nq"
        style={{ top: '68%' }} className={Qn ? 'handle-high' : 'handle-low'} />

      {/* Body */}
      <div className="px-2 py-1 text-center">
        <div className="text-gray-300 font-mono text-xs font-bold mb-2">SR</div>
        <div className="flex gap-2 text-xs font-mono justify-center">
          <span className={Q ? 'text-neon' : 'text-gray-500'}>Q={Q}</span>
          <span className={Qn ? 'text-neon' : 'text-gray-500'}>Q̄={Qn}</span>
        </div>
        {forbidden && (
          <div className="text-yellow-400 text-xs mt-1">⚠</div>
        )}
      </div>

      {/* Handle labels */}
      <div className="absolute left-2 top-1/4 -translate-y-1/2 text-gray-500" style={{ fontSize: 9 }}>S</div>
      <div className="absolute left-2 top-3/4 -translate-y-1/2 text-gray-500" style={{ fontSize: 9 }}>R</div>
      <div className="absolute right-2 top-1/4 -translate-y-1/2 text-right text-gray-500" style={{ fontSize: 9 }}>Q</div>
      <div className="absolute right-2 top-3/4 -translate-y-1/2 text-right text-gray-500" style={{ fontSize: 9 }}>Q̄</div>

      {/* Bottom label */}
      <div className="absolute bottom-1 left-0 right-0 text-center text-gray-500" style={{ fontSize: 9 }}>
        {data.label}
      </div>
    </div>
  );
};

export default SRLatchNode;
