import { useRef, useCallback, useState } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap,
} from 'reactflow';
import type { NodeTypes, EdgeTypes, ReactFlowInstance } from 'reactflow';
import type { GateType } from '../../types/circuit';
import { useCircuitStore } from '../../store/circuitStore';
import GateNode from './nodes/GateNode';
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import SRLatchNode from './nodes/SRLatchNode';
import DFlipFlopNode from './nodes/DFlipFlopNode';
import SignalEdge from './edges/SignalEdge';

// Defined outside component — critical for stable references
const nodeTypes: NodeTypes = {
  gateNode: GateNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  srLatchNode: SRLatchNode,
  dFlipFlopNode: DFlipFlopNode,
};

const edgeTypes: EdgeTypes = {
  signalEdge: SignalEdge,
};

function miniMapNodeColor(node: { data: { outputSignals?: Record<string, number> } }) {
  const isHigh = (node.data?.outputSignals?.['output-0'] ?? 0) === 1 ||
                 (node.data?.outputSignals?.['output-q'] ?? 0) === 1;
  return isHigh ? '#39ff14' : '#374151';
}

export default function CircuitCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const nodes = useCircuitStore(s => s.nodes);
  const edges = useCircuitStore(s => s.edges);
  const onNodesChange = useCircuitStore(s => s.onNodesChange);
  const onEdgesChange = useCircuitStore(s => s.onEdgesChange);
  const onConnect = useCircuitStore(s => s.onConnect);
  const addNode = useCircuitStore(s => s.addNode);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/logiclab-gate') as GateType;
      if (!type || !rfInstance || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      addNode(type, position);
    },
    [rfInstance, addNode],
  );

  return (
    <div
      ref={wrapperRef}
      className="flex-1 relative"
      style={{ background: '#0f0f0f' }}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center text-gray-600 select-none">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-lg font-medium">Drag gates from the left panel</div>
            <div className="text-sm mt-1">to start building your circuit</div>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setRfInstance}
        deleteKeyCode={['Delete', 'Backspace']}
        snapToGrid
        snapGrid={[16, 16]}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: 'signalEdge', data: { signal: 0 } }}
      >
        <Background variant={BackgroundVariant.Dots} color="#2a2a2a" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={miniMapNodeColor} maskColor="#0f0f0f88" />
      </ReactFlow>
    </div>
  );
}
