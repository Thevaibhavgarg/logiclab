import type { Node, Edge } from 'reactflow';
import type { GateType, GateNodeData, EdgeData, SignalValue } from '../types/circuit';

function evalGate(type: GateType, a: SignalValue, b: SignalValue): SignalValue {
  switch (type) {
    case 'AND':  return (a & b) as SignalValue;
    case 'OR':   return (a | b) as SignalValue;
    case 'NOT':  return (a ^ 1) as SignalValue;
    case 'XOR':  return (a ^ b) as SignalValue;
    case 'NAND': return ((a & b) ^ 1) as SignalValue;
    case 'NOR':  return ((a | b) ^ 1) as SignalValue;
    default:     return 0;
  }
}

export interface SimulationResult {
  signalMap: Map<string, Record<string, SignalValue>>;
  sequentialStates: Map<string, { Q: SignalValue; Qn: SignalValue; prevClk?: SignalValue }>;
}

export function simulateCircuit(
  nodes: Node<GateNodeData>[],
  edges: Edge<EdgeData>[],
): SimulationResult {
  const signalMap = new Map<string, Record<string, SignalValue>>();
  const resolvedInputs = new Map<string, Record<string, SignalValue>>();
  const sequentialStates = new Map<string, { Q: SignalValue; Qn: SignalValue; prevClk?: SignalValue }>();

  nodes.forEach(node => {
    resolvedInputs.set(node.id, {});
    if (node.data.gateType === 'INPUT') {
      const v = node.data.value ?? 0;
      signalMap.set(node.id, { 'output-0': v });
    } else if (node.data.gateType === 'SR_LATCH' || node.data.gateType === 'D_FLIPFLOP') {
      const s = node.data.sequentialState ?? { Q: 0 as SignalValue, Qn: 1 as SignalValue };
      signalMap.set(node.id, { 'output-q': s.Q, 'output-nq': s.Qn });
    }
  });

  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, Edge<EdgeData>[]>();
  nodes.forEach(n => { inDegree.set(n.id, 0); outEdges.set(n.id, []); });

  edges.forEach(edge => {
    const t = nodes.find(n => n.id === edge.target);
    if (t && t.data.gateType !== 'SR_LATCH' && t.data.gateType !== 'D_FLIPFLOP') {
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    }
    const list = outEdges.get(edge.source) ?? [];
    list.push(edge);
    outEdges.set(edge.source, list);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    if (node.data.gateType !== 'INPUT' &&
        node.data.gateType !== 'SR_LATCH' &&
        node.data.gateType !== 'D_FLIPFLOP') {
      const inp = resolvedInputs.get(nodeId) ?? {};
      const i0 = inp['input-0'] ?? 0;
      const i1 = inp['input-1'] ?? 0;
      if (node.data.gateType === 'OUTPUT') {
        signalMap.set(nodeId, { 'output-0': i0 });
      } else {
        signalMap.set(nodeId, { 'output-0': evalGate(node.data.gateType, i0, i1) });
      }
    }

    (outEdges.get(nodeId) ?? []).forEach(edge => {
      const sig = (signalMap.get(nodeId)?.[edge.sourceHandle ?? 'output-0'] ?? 0) as SignalValue;
      const ti = resolvedInputs.get(edge.target) ?? {};
      ti[edge.targetHandle ?? 'input-0'] = sig;
      resolvedInputs.set(edge.target, ti);

      const tNode = nodes.find(n => n.id === edge.target);
      if (tNode && tNode.data.gateType !== 'SR_LATCH' && tNode.data.gateType !== 'D_FLIPFLOP') {
        const nd = (inDegree.get(edge.target) ?? 0) - 1;
        inDegree.set(edge.target, nd);
        if (nd === 0) queue.push(edge.target);
      }
    });
  }

  // Post-pass: evaluate sequential nodes
  nodes.forEach(node => {
    if (node.data.gateType === 'SR_LATCH') {
      const inp = resolvedInputs.get(node.id) ?? {};
      const S = inp['input-s'] ?? 0;
      const R = inp['input-r'] ?? 0;
      const prev = node.data.sequentialState ?? { Q: 0 as SignalValue, Qn: 1 as SignalValue };
      let Q: SignalValue, Qn: SignalValue;
      if      (S === 1 && R === 0) { Q = 1; Qn = 0; }
      else if (S === 0 && R === 1) { Q = 0; Qn = 1; }
      else if (S === 1 && R === 1) { Q = 0; Qn = 0; } // forbidden
      else                          { Q = prev.Q; Qn = prev.Qn; }
      signalMap.set(node.id, { 'output-q': Q, 'output-nq': Qn });
      sequentialStates.set(node.id, { Q, Qn });
    }

    if (node.data.gateType === 'D_FLIPFLOP') {
      const inp = resolvedInputs.get(node.id) ?? {};
      const D   = inp['input-d']   ?? 0;
      const CLK = inp['input-clk'] ?? 0;
      const prev = node.data.sequentialState ?? { Q: 0 as SignalValue, Qn: 1 as SignalValue, prevClk: 0 as SignalValue };
      let Q: SignalValue, Qn: SignalValue;
      if ((prev.prevClk ?? 0) === 0 && CLK === 1) {
        Q = D as SignalValue; Qn = (D ^ 1) as SignalValue;
      } else {
        Q = prev.Q; Qn = prev.Qn;
      }
      signalMap.set(node.id, { 'output-q': Q, 'output-nq': Qn });
      sequentialStates.set(node.id, { Q, Qn, prevClk: CLK as SignalValue });
    }
  });

  return { signalMap, sequentialStates };
}
