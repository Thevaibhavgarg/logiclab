import { describe, expect, it } from 'vitest';
import type { SignalValue } from '../types/circuit';
import { simulateCircuit } from './simulator';
import { node, wire } from './testFixtures';

describe('SR latch', () => {
  const cases: {
    name: string; s: SignalValue; r: SignalValue;
    previous: { Q: SignalValue; Qn: SignalValue };
    expected: { Q: SignalValue; Qn: SignalValue };
  }[] = [
    { name: 'sets Q', s: 1, r: 0, previous: { Q: 0, Qn: 1 }, expected: { Q: 1, Qn: 0 } },
    { name: 'resets Q', s: 0, r: 1, previous: { Q: 1, Qn: 0 }, expected: { Q: 0, Qn: 1 } },
    { name: 'holds high', s: 0, r: 0, previous: { Q: 1, Qn: 0 }, expected: { Q: 1, Qn: 0 } },
    { name: 'holds low', s: 0, r: 0, previous: { Q: 0, Qn: 1 }, expected: { Q: 0, Qn: 1 } },
    { name: 'exposes the forbidden state', s: 1, r: 1, previous: { Q: 1, Qn: 0 }, expected: { Q: 0, Qn: 0 } },
  ];

  it.each(cases)('$name', ({ s, r, previous, expected }) => {
    const nodes = [
      node('INPUT', 's', { value: s }),
      node('INPUT', 'r', { value: r }),
      node('SR_LATCH', 'latch', { sequentialState: previous }),
    ];
    const { signalMap, sequentialStates } = simulateCircuit(
      nodes,
      [wire('s', 'latch', 'input-s'), wire('r', 'latch', 'input-r')],
    );
    expect(sequentialStates.get('latch')).toEqual(expected);
    expect(signalMap.get('latch')).toEqual({ 'output-q': expected.Q, 'output-nq': expected.Qn });
    expect(nodes[2].data.sequentialState).toEqual(previous);
  });
});

describe('D flip-flop', () => {
  it('captures only on rising clock edges and remembers the clock between calls', () => {
    const flipFlop = node('D_FLIPFLOP', 'ff');
    const edges = [wire('d', 'ff', 'input-d'), wire('clk', 'ff', 'input-clk')];
    const steps: { d: SignalValue; clk: SignalValue; q: SignalValue }[] = [
      { d: 1, clk: 0, q: 0 },
      { d: 1, clk: 1, q: 1 },
      { d: 0, clk: 1, q: 1 },
      { d: 0, clk: 0, q: 1 },
      { d: 0, clk: 1, q: 0 },
    ];
    for (const { d, clk, q } of steps) {
      const { sequentialStates } = simulateCircuit(
        [node('INPUT', 'd', { value: d }), node('INPUT', 'clk', { value: clk }), flipFlop],
        edges,
      );
      const nextState = sequentialStates.get('ff');
      expect(nextState).toEqual({ Q: q, Qn: q === 0 ? 1 : 0, prevClk: clk });
      flipFlop.data.sequentialState = nextState;
    }
  });
});

describe('sequential output propagation', () => {
  it.each(['SR_LATCH', 'D_FLIPFLOP'] as const)(
    '%s updates downstream gates and outputs in the same simulation',
    type => {
      const nodes = [
        node('OUTPUT', 'out'),
        node('AND', 'and'),
        node('NOT', 'not'),
        node('OUTPUT', 'q'),
        node('OUTPUT', 'qn'),
        node(type, 'seq'),
        node('INPUT', 'high', { value: 1 }),
        node('INPUT', 'control', { value: type === 'SR_LATCH' ? 0 : 1 }),
      ];
      const edges = [
        wire('high', 'seq', type === 'SR_LATCH' ? 'input-s' : 'input-d'),
        wire('control', 'seq', type === 'SR_LATCH' ? 'input-r' : 'input-clk'),
        wire('seq', 'q', 'input-0', 'output-q'),
        wire('seq', 'qn', 'input-0', 'output-nq'),
        wire('seq', 'not', 'input-0', 'output-q'),
        wire('not', 'and'),
        wire('not', 'and', 'input-1'),
        wire('and', 'out'),
      ];
      const before = structuredClone({ nodes, edges });
      const { signalMap } = simulateCircuit(nodes, edges);
      expect(signalMap.get('seq')).toEqual({ 'output-q': 1, 'output-nq': 0 });
      expect(signalMap.get('q')).toEqual({ 'output-0': 1 });
      expect(signalMap.get('qn')).toEqual({ 'output-0': 0 });
      expect(signalMap.get('not')).toEqual({ 'output-0': 0 });
      expect(signalMap.get('and')).toEqual({ 'output-0': 0 });
      expect(signalMap.get('out')).toEqual({ 'output-0': 0 });
      expect({ nodes, edges }).toEqual(before);
    },
  );

  it('samples chained flip-flops from the previous state, without capturing twice', () => {
    const first = node('D_FLIPFLOP', 'first');
    const second = node('D_FLIPFLOP', 'second');
    const edges = [
      wire('d', 'first', 'input-d'),
      wire('clk', 'first', 'input-clk'),
      wire('clk', 'second', 'input-clk'),
      wire('first', 'second', 'input-d', 'output-q'),
      wire('first', 'first-out', 'input-0', 'output-q'),
      wire('second', 'second-out', 'input-0', 'output-q'),
    ];
    const steps: { clk: SignalValue; firstQ: SignalValue; secondQ: SignalValue }[] = [
      { clk: 1, firstQ: 1, secondQ: 0 },
      { clk: 1, firstQ: 1, secondQ: 0 },
      { clk: 0, firstQ: 1, secondQ: 0 },
      { clk: 1, firstQ: 1, secondQ: 1 },
    ];
    for (const { clk, firstQ, secondQ } of steps) {
      const { signalMap, sequentialStates } = simulateCircuit(
        [
          second, first,
          node('INPUT', 'd', { value: 1 }),
          node('INPUT', 'clk', { value: clk }),
          node('OUTPUT', 'first-out'), node('OUTPUT', 'second-out'),
        ],
        edges,
      );
      expect(sequentialStates.get('first')?.Q).toBe(firstQ);
      expect(sequentialStates.get('second')?.Q).toBe(secondQ);
      expect(signalMap.get('first-out')).toEqual({ 'output-0': firstQ });
      expect(signalMap.get('second-out')).toEqual({ 'output-0': secondQ });
      first.data.sequentialState = sequentialStates.get('first');
      second.data.sequentialState = sequentialStates.get('second');
    }
  });
});
