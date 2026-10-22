import { useState, useCallback, useRef } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { GateNodeData, GateType } from '../../../types/circuit';
import { useCircuitStore } from '../../../store/circuitStore';

function GateSVGBody({ gateType, isHigh }: { gateType: GateType; isHigh: boolean }) {
  const stroke = isHigh ? '#39ff14' : '#9ca3af';
  const fill = '#1a1a2e';
  const bubble = '#0f0f0f';
  const sw = 1.5;

  switch (gateType) {
    case 'AND':
      return <path d="M5,10 L28,10 C54,10 54,34 28,34 L5,34 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case 'NAND':
      return <>
        <path d="M5,10 L26,10 C52,10 52,34 26,34 L5,34 Z"
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="56" cy="22" r="4" fill={bubble} stroke={stroke} strokeWidth={sw} />
      </>;
    case 'OR':
      return <path d="M5,10 Q20,10 46,22 Q20,34 5,34 Q18,22 5,10 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case 'NOR':
      return <>
        <path d="M5,10 Q20,10 42,22 Q20,34 5,34 Q18,22 5,10 Z"
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="48" cy="22" r="4" fill={bubble} stroke={stroke} strokeWidth={sw} />
      </>;
    case 'XOR':
      return <>
        <path d="M10,10 Q25,10 46,22 Q25,34 10,34 Q23,22 10,10 Z"
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M3,10 Q16,22 3,34" fill="none" stroke={stroke} strokeWidth={sw} />
      </>;
    case 'NOT':
      return <>
        <path d="M5,10 L46,22 L5,34 Z"
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="50" cy="22" r="4" fill={bubble} stroke={stroke} strokeWidth={sw} />
      </>;
    default:
      return null;
  }
}

const input1Handles: GateType[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

const GateNode = ({ data, selected, id }: NodeProps<GateNodeData>) => {
  const [editing, setEditing] = useState(false);
  const [labelVal, setLabelVal] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useCircuitStore(s => s.updateNodeLabel);
  const deleteNode = useCircuitStore(s => s.deleteNode);

  const isHigh = (data.outputSignals?.['output-0'] ?? 0) === 1;
  const in0High = (data.inputSignals?.['input-0'] ?? 0) === 1;
  const in1High = (data.inputSignals?.['input-1'] ?? 0) === 1;
  const hasTwoInputs = input1Handles.includes(data.gateType);

  const commitLabel = useCallback(() => {
    setEditing(false);
    if (labelVal.trim() && labelVal !== data.label) {
      updateNodeLabel(id, labelVal.trim());
    } else {
      setLabelVal(data.label);
    }
  }, [labelVal, data.label, id, updateNodeLabel]);

  return (
    <div
      className={`group relative rounded border transition-colors ${
        selected ? 'border-neon shadow-[0_0_8px_#39ff1444]' : 'border-gray-600'
      } bg-surface`}
      style={{ width: 80, height: 64 }}
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
      {/* Input handle 0 */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-0"
        style={{ top: hasTwoInputs ? '28%' : '45%' }}
        className={in0High ? 'handle-high' : 'handle-low'}
      />
      {/* Input handle 1 (binary gates only) */}
      {hasTwoInputs && (
        <Handle
          type="target"
          position={Position.Left}
          id="input-1"
          style={{ top: '68%' }}
          className={in1High ? 'handle-high' : 'handle-low'}
        />
      )}

      {/* Gate SVG */}
      <div className="flex justify-center items-center" style={{ paddingTop: 6, paddingBottom: 2 }}>
        <svg
          viewBox="0 0 60 44"
          width="60"
          height="40"
          className={isHigh ? 'gate-svg-high' : ''}
        >
          <GateSVGBody gateType={data.gateType} isHigh={isHigh} />
        </svg>
      </div>

      {/* Label */}
      <div
        className="text-center"
        style={{ fontSize: 10, lineHeight: '14px' }}
        onDoubleClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 0); }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={labelVal}
            onChange={e => setLabelVal(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={e => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') { setEditing(false); setLabelVal(data.label); } }}
            className="nodrag w-full text-center bg-gray-800 text-gray-200 border border-neon rounded outline-none text-xs"
            style={{ fontSize: 10 }}
          />
        ) : (
          <span className="text-gray-400 cursor-default">{data.label}</span>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-0"
        style={{ top: '45%' }}
        className={isHigh ? 'handle-high' : 'handle-low'}
      />
    </div>
  );
};

export default GateNode;
