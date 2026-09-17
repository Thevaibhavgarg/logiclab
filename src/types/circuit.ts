export type GateType =
  | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR'
  | 'INPUT' | 'OUTPUT'
  | 'SR_LATCH' | 'D_FLIPFLOP';

export type SignalValue = 0 | 1;

export interface GateNodeData {
  gateType: GateType;
  label: string;
  inputSignals: Record<string, SignalValue>;
  outputSignals: Record<string, SignalValue>;
  value?: SignalValue;
  sequentialState?: {
    Q: SignalValue;
    Qn: SignalValue;
    prevClk?: SignalValue;
  };
}

export interface EdgeData {
  signal: SignalValue;
}

export interface TruthTableRow {
  inputs: SignalValue[];
  outputs: SignalValue[];
  isCurrentState: boolean;
}

export interface TruthTableResult {
  inputIds: string[];
  inputLabels: string[];
  outputIds: string[];
  outputLabels: string[];
  rows: TruthTableRow[];
  hasSequential: boolean;
  tooLarge: boolean;
}

export interface SavedCircuit {
  version: '1.0';
  name: string;
  savedAt: string;
  nodes: any[];
  edges: any[];
}
