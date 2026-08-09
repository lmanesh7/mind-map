import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ConnectionLineType,
  NodeOrigin,
  Node,
  OnConnectEnd,
  OnConnectStart,
  useReactFlow,
  useStoreApi,
  Controls,
  Panel,
  Edge,
} from 'reactflow';
import shallow from 'zustand/shallow';
import { useStore as useZustandStore } from 'zustand';
import useStore, { RFState, getInitialNodeLabel } from './store';
import MindMapNode, { NodeData } from './MindMapNode';
import MindMapEdge from './MindMapEdge';
import { toPng } from 'html-to-image';

import 'reactflow/dist/style.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LoginForm from '../homePage';

const API_URL = import.meta.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3000}`;

const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);
const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.06-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);
const PdfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
  </svg>
);

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
});

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

function Flow() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mindmaps, setMindmaps] = useState<any[]>([]);
  const [currentMindmapId, setCurrentMindmapId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState(`New Mind Map - ${new Date().toLocaleString()}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsub = useStore.subscribe((state, prevState) => {
      if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
        setHasUnsavedChanges(true);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchMindmaps('', token);
    }
    
    // Clear history on initial mount to avoid tracking React Flow's dimension calculations
    const timer = setTimeout(() => {
      useStore.temporal.getState().clear();
      setHasUnsavedChanges(false);
    }, 150);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useStore.temporal.getState().redo();
        } else {
          useStore.temporal.getState().undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        useStore.temporal.getState().redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchMindmaps = async (search = '', tokenOverride = '') => {
    const token = tokenOverride || localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/mindmaps?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMindmaps(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMindmap = async (id: string) => {
    if (id === currentMindmapId) return;
    
    if (hasUnsavedChanges) {
      const wantsToSave = window.confirm("Do you want to save your current mind map before proceeding?\n\nClick OK to save.\nClick Cancel to discard changes and proceed.");
      if (wantsToSave) {
        await handleSave(true);
      }
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/mindmaps/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Failed to parse server response.');
      }

      if (res.ok && data.success) {
        setCurrentMindmapId(data.data._id);
        setCurrentTitle(data.data.title);
        useStore.setState({ nodes: data.data.nodes, edges: data.data.edges });
        // Clear undo history when loading a new map
        setTimeout(() => {
          useStore.temporal.getState().clear();
          setHasUnsavedChanges(false);
        }, 150);
      } else {
        alert(`Error loading mind map: ${data.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
  };

  const deleteMindmap = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this mind map?")) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/mindmaps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Failed to parse server response.');
      }

      if (res.ok && data.success) {
        if (id === currentMindmapId) {
          handleNewMap();
        }
        fetchMindmaps(searchQuery);
      } else {
        alert(`Error deleting mind map: ${data.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
  };

  const handleSave = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!silent) setShowLoginModal(true);
      return;
    }
    const { nodes, edges } = useStore.getState();
    const payload = { title: currentTitle, nodes, edges };
    
    try {
      let url = `${API_URL}/api/mindmaps`;
      let method = 'POST';
      if (currentMindmapId) {
        url = `${url}/${currentMindmapId}`;
        method = 'PUT';
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Failed to parse server response.');
      }

      if (res.ok && data.success) {
        setCurrentMindmapId(data.data._id);
        fetchMindmaps(searchQuery);
        setHasUnsavedChanges(false);
        if (!silent) alert('Mind map saved successfully!');
      } else {
        if (!silent) alert(`Error saving mind map: ${data?.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      console.error(e);
      if (!silent) alert(`Error: ${e.message}`);
    }
  };

  const handleNewMap = async () => {
    if (hasUnsavedChanges) {
      const wantsToSave = window.confirm("Do you want to save your current mind map before proceeding?\n\nClick OK to save.\nClick Cancel to discard changes and proceed.");
      if (wantsToSave) {
        await handleSave(true);
      }
    }
    
    setCurrentMindmapId(null);
    setCurrentTitle(`New Mind Map - ${new Date().toLocaleString()}`);
    // We could clear the store nodes/edges here if desired, or reset to a single root node.
    useStore.setState({
      nodes: [
        {
          id: 'root',
          type: 'mindmap',
          data: { label: getInitialNodeLabel(), color: '#1A192B', textColor: '#ffffff' },
          position: { x: 0, y: 0 },
        }
      ],
      edges: []
    });
    // Clear undo history when creating a new map
    setTimeout(() => {
      useStore.temporal.getState().clear();
      setHasUnsavedChanges(false);
    }, 150);
  };

  const store = useStoreApi();
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode } = useStore(
    selector,
    shallow
  );
  const { project, fitView } = useReactFlow();

  const handleExport = (format: 'png' | 'pdf') => {
    fitView({ padding: 0.2, duration: 200 });
    setTimeout(() => {
      const element = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!element) return;
      toPng(element, { backgroundColor: '#ffffff' })
        .then((dataUrl) => {
          const safeTitle = currentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          
          if (format === 'png') {
            const a = document.createElement('a');
            a.setAttribute('download', `${safeTitle}.png`);
            a.setAttribute('href', dataUrl);
            a.click();
          } else if (format === 'pdf') {
            import('jspdf').then(({ jsPDF }) => {
              const pdf = new jsPDF({
                orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [element.offsetWidth, element.offsetHeight]
              });
              pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
              pdf.save(`${safeTitle}.pdf`);
            });
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to export.');
        });
    }, 250);
  };

  const connectingNodeId = useRef<string | null>(null);

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();
    if (
      !domNode ||
      !parentNode?.positionAbsolute ||
      !parentNode?.width ||
      !parentNode?.height
    ) {
      return;
    }
    const { top, left } = domNode.getBoundingClientRect();
    const panePosition = project({
      x: event.clientX - left,
      y: event.clientY - top,
    });
    return {
      x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
      y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      const node = (event.target as Element).closest('.react-flow__node');
      if (node) {
        node.querySelector('input')?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);
        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition]
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={nodeOrigin}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={ConnectionLineType.Straight}
        fitView
      >
        <Controls showInteractive={false} />
        
        {isLoggedIn && (
          <Panel position="top-left" className="sidebarPanel">
            <h3>My Mind Maps</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); fetchMindmaps(e.target.value); }}
                className="mapInput"
              />
              <Button variant="outlined" size="small" onClick={() => handleNewMap()}>New</Button>
            </div>
            <ul className="mindmapList">
              {mindmaps.map(mm => (
                <li key={mm._id} className={mm._id === currentMindmapId ? 'active' : ''} onClick={() => loadMindmap(mm._id)}>
                  <span className="mindmapTitle">{mm.title}</span>
                  <button className="deleteMapBtn" onClick={(e) => { e.stopPropagation(); deleteMindmap(mm._id); }} title="Delete Map">✕</button>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel position="top-right">
          <div className="savePanel">
            <IconButton 
              onClick={() => useStore.temporal.getState().undo()} 
              disabled={useZustandStore(useStore.temporal, (state: any) => state.pastStates.length === 0)}
              style={{ marginRight: '5px' }}
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon />
            </IconButton>
            <IconButton 
              onClick={() => useStore.temporal.getState().redo()} 
              disabled={useZustandStore(useStore.temporal, (state: any) => state.futureStates.length === 0)}
              style={{ marginRight: '10px' }}
              title="Redo (Ctrl+Y)"
            >
              <RedoIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleExport('png')} 
              style={{ marginRight: '5px' }}
              title="Export as Image"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleExport('pdf')} 
              style={{ marginRight: '10px' }}
              title="Export as PDF"
            >
              <PdfIcon />
            </IconButton>
            <input 
              type="text" 
              value={currentTitle} 
              onChange={(e) => {
                setCurrentTitle(e.target.value);
                setHasUnsavedChanges(true);
              }} 
              className="mapInput"
            />
            <Button variant="contained" onClick={() => handleSave(false)}>Save</Button>
            {!isLoggedIn && (
              <Button variant="outlined" style={{ marginLeft: '10px' }} onClick={() => setShowLoginModal(true)}>
                Login
              </Button>
            )}
            {isLoggedIn && (
              <Button variant="text" style={{ marginLeft: '10px' }} onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setIsLoggedIn(false);
                setMindmaps([]);
                handleNewMap();
              }}>
                Logout
              </Button>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {showLoginModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button className="closeButton" onClick={() => setShowLoginModal(false)}>×</button>
            <LoginForm onLoginSuccess={() => {
              setIsLoggedIn(true);
              setShowLoginModal(false);
              fetchMindmaps();
              
              const nodes = useStore.getState().nodes;
              const rootNode = nodes.find((n: Node) => n.id === 'root');
              if (rootNode && rootNode.data.label === "Laxmana's Mind Map") {
                 useStore.getState().updateNodeLabel('root', getInitialNodeLabel());
              }
            }} />
          </div>
        </div>
      )}
    </>
  );
}

export default Flow;
