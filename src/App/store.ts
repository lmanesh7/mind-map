import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  MarkerType,
} from 'reactflow';
import create from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid/non-secure';

import { NodeData } from './MindMapNode';

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 2), 16);
  const b = parseInt(hexcolor.substring(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

export type RFState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  updateNodeTextColor: (nodeId: string, textColor: string) => void;
  updateEdgeArrowType: (edgeId: string, type: 'none' | 'start' | 'end' | 'both') => void;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  deleteNode: (nodeId: string) => void;
};

const savedNodes = sessionStorage.getItem('mindmap-nodes');
const savedEdges = sessionStorage.getItem('mindmap-edges');

const initialNodes = savedNodes ? JSON.parse(savedNodes) : [
  {
    id: 'root',
    type: 'mindmap',
    data: { label: 'React Flow Mind Map' },
    position: { x: 0, y: 0 },
    dragHandle: '.dragHandle',
  },
];

const initialEdges = savedEdges ? JSON.parse(savedEdges) : [];

const useStore = create<RFState>()(
  temporal(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, label };
        }
        return node;
      }),
    });
  },
  updateNodeColor: (nodeId: string, color: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, color };
        }
        return node;
      }),
    });
  },
  updateNodeTextColor: (nodeId: string, textColor: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, textColor };
        }
        return node;
      }),
    });
  },
  updateEdgeArrowType: (edgeId: string, type: 'none' | 'start' | 'end' | 'both') => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          const newEdge = { ...edge };
          const marker = { type: MarkerType.ArrowClosed, color: '#F6AD55' };
          
          if (type === 'end' || type === 'both') {
            newEdge.markerEnd = marker;
          } else {
            newEdge.markerEnd = undefined;
          }
          
          if (type === 'start' || type === 'both') {
            newEdge.markerStart = marker;
          } else {
            newEdge.markerStart = undefined;
          }

          // We store the user's choice in edge.data so we can select the correct option in the UI dropdown
          newEdge.data = { ...newEdge.data, arrowType: type };
          
          return newEdge;
        }
        return edge;
      }),
    });
  },
  addChildNode: (parentNode: Node, position: XYPosition) => {
    let color = parentNode.data.color;
    let textColor = parentNode.data.textColor;

    if (parentNode.id === 'root') {
      let isUnique = false;
      while (!isUnique) {
        color = getRandomColor();
        isUnique = !get().nodes.some((n) => n.data.color === color);
      }
      textColor = getContrastYIQ(color);
    }

    const newNode = {
      id: nanoid(),
      type: 'mindmap',
      data: { label: 'New Node', color, textColor },
      position,
      dragHandle: '.dragHandle',
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
      data: { arrowType: 'none' },
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });


  },
  deleteNode: (nodeId: string) => {
    if (nodeId === 'root') return;
    
    const nodes = get().nodes;
    const edges = get().edges;
    
    const nodesToDelete = new Set<string>();
    nodesToDelete.add(nodeId);

    let currentSize = 0;
    while (nodesToDelete.size !== currentSize) {
      currentSize = nodesToDelete.size;
      nodes.forEach((node) => {
        if (node.parentNode && nodesToDelete.has(node.parentNode)) {
          nodesToDelete.add(node.id);
        }
      });
    }

    const childCount = nodesToDelete.size - 1;
    if (childCount > 0) {
      const proceed = window.confirm(`This node has ${childCount} child nodes. Deleting this node will delete it's children. Proceed?`);
      if (!proceed) {
        return;
      }
    }

    const remainingNodes = nodes.filter((node) => !nodesToDelete.has(node.id));
    const remainingEdges = edges.filter(
      (edge) => !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
    );

    set({
      nodes: remainingNodes,
      edges: remainingEdges,
    });
  },
}),
{
  partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
}
  )
);

useStore.subscribe((state) => {
  sessionStorage.setItem('mindmap-nodes', JSON.stringify(state.nodes));
  sessionStorage.setItem('mindmap-edges', JSON.stringify(state.edges));
});

export default useStore;
