import { useLayoutEffect, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import useStore from '../store';

import DragIcon from './DragIcon';


export type NodeData = {
  label: string;
  color?: string;
  textColor?: string;
};

function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const updateNodeColor = useStore((state) => state.updateNodeColor);
  const updateNodeTextColor = useStore((state) => state.updateNodeTextColor);
  const deleteNode = useStore((state) => state.deleteNode);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 1);
  }, []);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${data.label.length * 9}px`;
    }
  }, [data.label.length]);

  const bgColor = data.color || '#ffffff';
  const color = data.textColor || '#000000';

  return (
    <>
      <div 
        className="inputWrapper"
        style={{ backgroundColor: bgColor, borderRadius: '2px', padding: '6px 12px' }}
      >
        <div className="dragHandle">
          <DragIcon />
        </div>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
          ref={inputRef}
          style={{ color }}
        />
        
        <div className="colorPickers">
          <input
            type="color"
            value={bgColor}
            onChange={(evt) => updateNodeColor(id, evt.target.value)}
            className="colorPicker"
            title="Background Color"
          />
          <input
            type="color"
            value={color}
            onChange={(evt) => updateNodeTextColor(id, evt.target.value)}
            className="colorPicker"
            title="Text Color"
          />
        </div>

        {id !== 'root' && (
          <button
            className="deleteNodeButton"
            onClick={() => deleteNode(id)}
            title="Delete Node"
          >
            X
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Top} />
     
    </>
  
  );
}

export default MindMapNode;
