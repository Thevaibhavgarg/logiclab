import type { Node, Edge } from 'reactflow';
import type { GateNodeData, EdgeData, TruthTableResult, TruthTableRow, SignalValue } from '../types/circuit';
import { simulateCircuit } from './simulator';

const MAX_INPUTS = 10;

export function generateTruthTable(
  nodes: Node<GateNodeData>[],
  edges: Edge<EdgeData>[],
): TruthTableResult {
  const inputNodes = nodes
    .filter(n => n.data.gateType === 'INPUT')
    .sort((a, b) => a.data.label.localeCompare(b.data.label));

  const outputNodes = nodes
    .filter(n => n.data.gateType === 'OUTPUT')
    .sort((a, b) => a.data.label.localeCompare(b.data.label));

  const hasSequential = nodes.some(
    n => n.data.gateType === 'SR_LATCH' || n.data.gateType === 'D_FLIPFLOP',
  );

  const meta = {
    inputIds: inputNodes.map(n => n.id),
    inputLabels: inputNodes.map(n => n.data.label),
    outputIds: outputNodes.map(n => n.id),
    outputLabels: outputNodes.map(n => n.data.label),
  };

  if (hasSequential) return { ...meta, rows: [], hasSequential: true, tooLarge: false };
  if (!inputNodes.length || !outputNodes.length) return { ...meta, rows: [], hasSequential: false, tooLarge: false };
  if (inputNodes.length > MAX_INPUTS) return { ...meta, rows: [], hasSequential: false, tooLarge: true };

  const n = inputNodes.length;
  const total = 1 << n;

  let currentCombo = 0;
  inputNodes.forEach((node, i) => {
    if ((node.data.value ?? 0) === 1) currentCombo |= 1 << (n - 1 - i);
  });

  const rows: TruthTableRow[] = [];

  for (let combo = 0; combo < total; combo++) {
    const patchedNodes = nodes.map(node => {
      const idx = inputNodes.findIndex(inp => inp.id === node.id);
      if (idx === -1) return node;
      const bit = ((combo >> (n - 1 - idx)) & 1) as SignalValue;
      return { ...node, data: { ...node.data, value: bit } };
    }) as Node<GateNodeData>[];

    const { signalMap } = simulateCircuit(patchedNodes, edges);

    const inputs = inputNodes.map((_, i) => ((combo >> (n - 1 - i)) & 1) as SignalValue);
    const outputs = outputNodes.map(out => {
      const sig = signalMap.get(out.id);
      return (sig?.['output-0'] ?? 0) as SignalValue;
    });

    rows.push({ inputs, outputs, isCurrentState: combo === currentCombo });
  }

  return { ...meta, rows, hasSequential: false, tooLarge: false };
}
