import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import useStore from '../store';

function MindMapEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, markerEnd, markerStart, data, selected } = props;
  const updateEdgeArrowType = useStore((state) => state.updateEdgeArrowType);

  // Calculate vector from source to target
  const sX = sourceX;
  const sY = sourceY + 18;
  const tX = targetX;
  const tY = targetY;

  const dx = tX - sX;
  const dy = tY - sY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / length;
  const ny = dy / length;

  // Shorten the line by ~25 pixels at each end so arrows aren't hidden under the nodes
  const offsetStart = markerStart ? 25 : 0;
  const offsetEnd = markerEnd ? 25 : 0;

  const adjustedSourceX = sX + nx * offsetStart;
  const adjustedSourceY = sY + ny * offsetStart;
  const adjustedTargetX = tX - nx * offsetEnd;
  const adjustedTargetY = tY - ny * offsetEnd;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  const arrowType = data?.arrowType || 'none';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={props.style} />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="edgeDropdownWrapper"
          >
            <select
              className="edgeArrowSelect"
              value={arrowType}
              onChange={(e) => updateEdgeArrowType(id, e.target.value as any)}
              title="Arrow Type"
            >
              <option value="none">--</option>
              <option value="end">&rarr;</option>
              <option value="start">&larr;</option>
              <option value="both">&harr;</option>
            </select>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default MindMapEdge;
