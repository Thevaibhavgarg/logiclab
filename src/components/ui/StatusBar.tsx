import { useCircuitStore } from '../../store/circuitStore';

export default function StatusBar() {
  const nodes = useCircuitStore(s => s.nodes);
  const edges = useCircuitStore(s => s.edges);

  const gateCount   = nodes.filter(n => !['INPUT', 'OUTPUT', 'SR_LATCH', 'D_FLIPFLOP'].includes(n.data.gateType)).length;
  const inputCount  = nodes.filter(n => n.data.gateType === 'INPUT').length;
  const outputCount = nodes.filter(n => n.data.gateType === 'OUTPUT').length;
  const seqCount    = nodes.filter(n => n.data.gateType === 'SR_LATCH' || n.data.gateType === 'D_FLIPFLOP').length;

  const highOutputs = nodes.filter(n => n.data.gateType === 'OUTPUT' && (n.data.inputSignals?.['input-0'] ?? 0) === 1).length;

  return (
    <div
      className="flex items-center gap-4 px-4 border-t border-gray-700 bg-gray-900 text-gray-500"
      style={{ height: 28, flexShrink: 0, fontSize: 11 }}
    >
      <span>{nodes.length} nodes</span>
      <span className="text-gray-700">·</span>
      <span>{edges.length} wires</span>
      <span className="text-gray-700">·</span>
      <span>{gateCount} gates</span>
      <span className="text-gray-700">·</span>
      <span>{inputCount} inputs</span>
      <span className="text-gray-700">·</span>
      <span>{outputCount} outputs</span>
      {seqCount > 0 && <><span className="text-gray-700">·</span><span>{seqCount} sequential</span></>}
      <div className="flex-1" />
      {outputCount > 0 && (
        <span className={highOutputs > 0 ? 'text-neon' : 'text-gray-600'}>
          {highOutputs}/{outputCount} outputs HIGH
        </span>
      )}
      <span className="text-gray-600">Hover node to delete · Delete/Backspace removes selected</span>
    </div>
  );
}
