import { useCircuitStore } from '../../store/circuitStore';

function SignalCell({ value }: { value: 0 | 1 }) {
  return (
    <td className={`text-center px-2 py-1 font-mono text-sm ${value ? 'text-neon font-bold' : 'text-gray-500'}`}>
      {value}
    </td>
  );
}

export default function TruthTablePanel() {
  const truthTable = useCircuitStore(s => s.truthTable);
  const buildTruthTable = useCircuitStore(s => s.buildTruthTable);
  const nodes = useCircuitStore(s => s.nodes);

  const hasInputs  = nodes.some(n => n.data.gateType === 'INPUT');
  const hasOutputs = nodes.some(n => n.data.gateType === 'OUTPUT');

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={buildTruthTable}
          disabled={!hasInputs || !hasOutputs}
          className="w-full py-2 rounded text-sm font-medium transition-colors
            bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed
            border border-gray-600 hover:border-gray-500"
        >
          Generate Truth Table
        </button>
      </div>

      {!hasInputs || !hasOutputs ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-center px-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">Add Input and Output nodes to generate a truth table</div>
          </div>
        </div>
      ) : truthTable === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-sm text-center px-4">
            Click Generate to compute the truth table for this circuit
          </div>
        </div>
      ) : truthTable.hasSequential ? (
        <div className="px-4 py-3">
          <div className="text-yellow-400 text-sm bg-yellow-950 border border-yellow-800 rounded p-3">
            Truth tables are not available for circuits with sequential components (SR Latch / D Flip-Flop).
          </div>
        </div>
      ) : truthTable.tooLarge ? (
        <div className="px-4 py-3">
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded p-3">
            Too many inputs (&gt;10). Truth table would have over 1024 rows.
          </div>
        </div>
      ) : truthTable.rows.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm">No complete paths from inputs to outputs.</div>
      ) : (
        <div className="overflow-auto flex-1 px-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                {truthTable.inputLabels.map(l => (
                  <th key={l} className="text-center px-2 py-2 text-gray-400 font-mono text-xs">{l}</th>
                ))}
                <th className="text-gray-700 px-1 text-xs">│</th>
                {truthTable.outputLabels.map(l => (
                  <th key={l} className="text-center px-2 py-2 text-gray-400 font-mono text-xs">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {truthTable.rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-800 transition-colors ${
                    row.isCurrentState ? 'bg-green-950/50 border-green-900' : 'hover:bg-gray-800/40'
                  }`}
                >
                  {row.inputs.map((v, j) => <SignalCell key={j} value={v} />)}
                  <td className="text-gray-700 text-center text-xs">│</td>
                  {row.outputs.map((v, j) => <SignalCell key={j} value={v} />)}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="py-2 px-2 text-gray-600 text-center" style={{ fontSize: 10 }}>
            {truthTable.rows.length} rows · highlighted row = current input state
          </div>
        </div>
      )}
    </div>
  );
}
