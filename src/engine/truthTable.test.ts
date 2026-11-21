import { readFileSync } from 'node:fs';
import type { Edge, Node } from 'reactflow';
import { describe, expect, it } from 'vitest';
import type { EdgeData, GateNodeData } from '../types/circuit';
import { generateTruthTable } from './truthTable';
import { node, wire } from './testFixtures';

describe('truth tables', () => {
  it('computes the included half adder with sorted columns and the current state highlighted', () => {
    const circuit: { nodes: Node<GateNodeData>[]; edges: Edge<EdgeData>[] } = JSON.parse(
      readFileSync(new URL('../../examples/half-adder.logiclab.json', import.meta.url), 'utf8'),
    );
    const before = structuredClone(circuit);
    const table = generateTruthTable(circuit.nodes, circuit.edges);
    expect(table.inputLabels).toEqual(['A', 'B']);
    expect(table.outputLabels).toEqual(['Carry', 'Sum']);
    expect(table.rows).toEqual([
      { inputs: [0, 0], outputs: [0, 0], isCurrentState: true },
      { inputs: [0, 1], outputs: [0, 1], isCurrentState: false },
      { inputs: [1, 0], outputs: [0, 1], isCurrentState: false },
      { inputs: [1, 1], outputs: [1, 0], isCurrentState: false },
    ]);
    expect(table.hasSequential).toBe(false);
    expect(table.tooLarge).toBe(false);
    expect(circuit).toEqual(before);
  });

  it('sorts inputs by label, not node order', () => {
    const nodes = [
      node('INPUT', 'B', { value: 1 }),
      node('INPUT', 'A', { value: 0 }),
      node('OUTPUT', 'out'),
    ];
    const table = generateTruthTable(nodes, [wire('B', 'out')]);
    expect(table.inputIds).toEqual(['A', 'B']);
    expect(table.rows.filter(row => row.isCurrentState)).toEqual([
      { inputs: [0, 1], outputs: [1], isCurrentState: true },
    ]);
  });

  it.each(['INPUT', 'OUTPUT'] as const)('requires an %s node', type => {
    const otherType = type === 'INPUT' ? 'OUTPUT' : 'INPUT';
    expect(generateTruthTable([node(otherType, 'only')], []).rows).toEqual([]);
  });

  it.each(['SR_LATCH', 'D_FLIPFLOP'] as const)('rejects circuits containing %s', type => {
    const table = generateTruthTable(
      [node('INPUT', 'in'), node('OUTPUT', 'out'), node(type, 'sequential')],
      [],
    );
    expect(table.hasSequential).toBe(true);
    expect(table.rows).toEqual([]);
  });

  it('accepts exactly 10 inputs and produces all 1024 combinations', () => {
    const inputs = Array.from({ length: 10 }, (_, i) => node('INPUT', `in-${i}`));
    const table = generateTruthTable([...inputs, node('OUTPUT', 'out')], []);
    expect(table.tooLarge).toBe(false);
    expect(table.rows).toHaveLength(1024);
    expect(table.rows[0].inputs).toEqual(Array(10).fill(0));
    expect(table.rows[1023].inputs).toEqual(Array(10).fill(1));
    expect(new Set(table.rows.map(row => row.inputs.join(''))).size).toBe(1024);
    expect(table.rows.filter(row => row.isCurrentState)).toHaveLength(1);
  });

  it('rejects more than 10 inputs without generating rows', () => {
    const inputs = Array.from({ length: 11 }, (_, i) => node('INPUT', `in-${i}`));
    const table = generateTruthTable([...inputs, node('OUTPUT', 'out')], []);
    expect(table.tooLarge).toBe(true);
    expect(table.rows).toEqual([]);
  });
});
