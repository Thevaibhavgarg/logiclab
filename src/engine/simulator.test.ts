import { describe, expect, it } from 'vitest';
import type { GateType, SignalValue } from '../types/circuit';
import { simulateCircuit } from './simulator';
import { node, wire } from './testFixtures';

const combinations: [SignalValue, SignalValue][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const binaryGates: { type: GateType; outputs: SignalValue[] }[] = [
  { type: 'AND', outputs: [0, 0, 0, 1] },
  { type: 'OR', outputs: [0, 1, 1, 1] },
  { type: 'XOR', outputs: [0, 1, 1, 0] },
  { type: 'NAND', outputs: [1, 1, 1, 0] },
  { type: 'NOR', outputs: [1, 0, 0, 0] },
];

describe('combinational simulation', () => {
  for (const { type, outputs } of binaryGates) {
    it.each(combinations)(`${type} evaluates inputs %i and %i`, (a, b) => {
      const nodes = [
        node('INPUT', 'a', { value: a }),
        node('INPUT', 'b', { value: b }),
        node(type, 'gate'),
        node('OUTPUT', 'led'),
      ];
      const edges = [wire('a', 'gate'), wire('b', 'gate', 'input-1'), wire('gate', 'led')];
      const { signalMap } = simulateCircuit(nodes, edges);
      expect(signalMap.get('gate')).toEqual({ 'output-0': outputs[a * 2 + b] });
      expect(signalMap.get('led')).toEqual(signalMap.get('gate'));
    });
  }

  it.each<SignalValue>([0, 1])('NOT inverts input %i', value => {
    const { signalMap } = simulateCircuit(
      [node('INPUT', 'in', { value }), node('NOT', 'not'), node('OUTPUT', 'out')],
      [wire('in', 'not'), wire('not', 'out')],
    );
    expect(signalMap.get('out')).toEqual({ 'output-0': value === 0 ? 1 : 0 });
  });

  it('propagates through multiple gates and fan-out regardless of node order', () => {
    const nodes = [
      node('OUTPUT', 'out'),
      node('AND', 'and'),
      node('NOT', 'not'),
      node('INPUT', 'in', { value: 0 }),
    ];
    const edges = [
      wire('in', 'not'),
      wire('not', 'and'),
      wire('not', 'and', 'input-1'),
      wire('and', 'out'),
    ];
    const { signalMap } = simulateCircuit(nodes, edges);
    expect(signalMap.get('out')).toEqual({ 'output-0': 1 });
  });

  it('treats disconnected inputs as zero', () => {
    const { signalMap } = simulateCircuit(
      [node('AND', 'and'), node('NOT', 'not'), node('OUTPUT', 'out')],
      [],
    );
    expect(signalMap.get('and')).toEqual({ 'output-0': 0 });
    expect(signalMap.get('not')).toEqual({ 'output-0': 1 });
    expect(signalMap.get('out')).toEqual({ 'output-0': 0 });
  });

  it('returns empty results for an empty circuit', () => {
    const result = simulateCircuit([], []);
    expect(result.signalMap.size).toBe(0);
    expect(result.sequentialStates.size).toBe(0);
  });

  it('does not mutate nodes or edges', () => {
    const nodes = [node('INPUT', 'in', { value: 1 }), node('OUTPUT', 'out')];
    const edges = [wire('in', 'out')];
    const original = structuredClone({ nodes, edges });
    simulateCircuit(nodes, edges);
    expect({ nodes, edges }).toEqual(original);
  });
});
