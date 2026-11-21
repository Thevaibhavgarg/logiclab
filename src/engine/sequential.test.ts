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
