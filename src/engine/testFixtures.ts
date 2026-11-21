import type { Edge, Node } from 'reactflow';
import type { EdgeData, GateNodeData, GateType } from '../types/circuit';
import { createNode } from '../utils/nodeFactory';

export function node(type: GateType, id: string, data: Partial<GateNodeData> = {}): Node<GateNodeData> {
  const created = createNode(type, { x: 0, y: 0 });
  return { ...created, id, data: { ...created.data, label: id, ...data } };
}

export function wire(
  source: string,
  target: string,
  targetHandle = 'input-0',
  sourceHandle = 'output-0',
): Edge<EdgeData> {
  return {
    id: `${source}:${sourceHandle}-${target}:${targetHandle}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: 'signalEdge',
    data: { signal: 0 },
  };
}
