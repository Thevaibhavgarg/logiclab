import { useState } from 'react';
import type { EdgeProps } from 'reactflow';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import type { EdgeData } from '../../../types/circuit';
import { useCircuitStore } from '../../../store/circuitStore';

const SignalEdge = ({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<EdgeData>) => {
  const [hovered, setHovered] = useState(false);
  const deleteEdge = useCircuitStore(s => s.deleteEdge);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isHigh = data?.signal === 1;
  const showDelete = hovered || selected;

  return (
    <>
      {/* Wide transparent hit area — makes the thin wire easy to hover/click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Visible wire */}
      <path
        id={`ep-${id}`}
        d={edgePath}
        className={`wire ${isHigh ? 'wire-high wire-animated' : 'wire-low'} ${selected ? 'wire-selected' : ''}`}
        markerEnd={markerEnd}
        style={{ pointerEvents: 'none' }}
      />

      {/* Signal pulse dot */}
      {isHigh && (
        <circle r="4" className="signal-pulse">
          <animateMotion dur="0.55s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#ep-${id}`} />
          </animateMotion>
        </circle>
      )}

      {/* Delete button at wire midpoint */}
      {showDelete && (
        <EdgeLabelRenderer>
          <button
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan w-5 h-5 bg-red-700 hover:bg-red-500 text-white rounded-full flex items-center justify-center z-50 shadow"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => deleteEdge(id)}
            title="Delete wire"
          >
            <svg viewBox="0 0 10 10" width="8" height="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
            </svg>
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default SignalEdge;
