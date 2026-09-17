import type { XYPosition } from 'reactflow';
import type { GateType, GateNodeData } from '../types/circuit';

const counters: Partial<Record<GateType, number>> = {};

function nextLabel(gateType: GateType): string {
  const prefixes: Record<GateType, string> = {
    AND: 'AND', OR: 'OR', NOT: 'NOT', XOR: 'XOR',
    NAND: 'NAND', NOR: 'NOR',
    INPUT: 'IN', OUTPUT: 'OUT',
    SR_LATCH: 'SR', D_FLIPFLOP: 'DFF',
  };
  counters[gateType] = (counters[gateType] ?? 0) + 1;
  return `${prefixes[gateType]}${counters[gateType]}`;
}

const rfTypes: Record<GateType, string> = {
  AND: 'gateNode', OR: 'gateNode', NOT: 'gateNode',
  XOR: 'gateNode', NAND: 'gateNode', NOR: 'gateNode',
  INPUT: 'inputNode', OUTPUT: 'outputNode',
  SR_LATCH: 'srLatchNode', D_FLIPFLOP: 'dFlipFlopNode',
};

export function createNode(type: GateType, position: XYPosition) {
  const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
  const data: GateNodeData = {
    gateType: type,
    label: nextLabel(type),
    inputSignals: {},
    outputSignals: {},
    ...(type === 'INPUT' ? { value: 0 as const } : {}),
    ...(type === 'SR_LATCH' || type === 'D_FLIPFLOP'
      ? { sequentialState: { Q: 0 as const, Qn: 1 as const, prevClk: 0 as const } }
      : {}),
  };
  return { id, type: rfTypes[type], position, data };
}

export function resetCounters() {
  Object.keys(counters).forEach(k => delete counters[k as GateType]);
}
