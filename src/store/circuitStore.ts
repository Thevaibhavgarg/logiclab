import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Node, Edge, NodeChange, EdgeChange, Connection, XYPosition } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import type {
  GateType, GateNodeData, EdgeData,
  TruthTableResult, SavedCircuit, SignalValue,
} from '../types/circuit';
import { simulateCircuit } from '../engine/simulator';
import { generateTruthTable } from '../engine/truthTable';
import { createNode } from '../utils/nodeFactory';

type CNode = Node<GateNodeData>;
type CEdge = Edge<EdgeData>;

interface State {
  nodes: CNode[];
  edges: CEdge[];
  signalMap: Record<string, Record<string, SignalValue>>;
  truthTable: TruthTableResult | null;
  circuitName: string;
  isDirty: boolean;
  activeTab: 'properties' | 'truthtable' | 'saves';
  selectedNodeId: string | null;
  notification: { message: string; type: 'success' | 'error' } | null;
}

interface Actions {
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: GateType, position: XYPosition) => void;
  toggleInput: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  runSimulation: () => void;
  buildTruthTable: () => void;
  setActiveTab: (tab: State['activeTab']) => void;
  setSelectedNodeId: (id: string | null) => void;
  clearCircuit: () => void;
  saveCircuit: () => void;
  loadCircuit: (circuit: SavedCircuit) => void;
  exportCircuit: () => void;
  importCircuit: (json: string) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  setCircuitName: (name: string) => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
  serialize: () => SavedCircuit;
}

const LS_AUTOSAVE = 'logiclab:autosave';
const LS_INDEX    = 'logiclab:index';

export const useCircuitStore = create<State & Actions>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    signalMap: {},
    truthTable: null,
    circuitName: 'Untitled Circuit',
    isDirty: false,
    activeTab: 'properties',
    selectedNodeId: null,
    notification: null,

    onNodesChange: (changes) => {
      set(state => {
        state.nodes = applyNodeChanges(changes, state.nodes) as CNode[];
        const sel = changes.find(c => c.type === 'select');
        if (sel?.type === 'select') {
          state.selectedNodeId = sel.selected ? sel.id : null;
        }
      });
      if (changes.some(c => c.type === 'remove')) get().runSimulation();
    },

    onEdgesChange: (changes) => {
      set(state => {
        state.edges = applyEdgeChanges(changes, state.edges) as CEdge[];
      });
      get().runSimulation();
    },

    onConnect: (connection) => {
      const { edges } = get();
      if (edges.some(e => e.target === connection.target && e.targetHandle === connection.targetHandle)) return;
      const newEdge: CEdge = {
        ...connection,
        id: `e-${crypto.randomUUID().slice(0, 8)}`,
        type: 'signalEdge',
        data: { signal: 0 },
      } as CEdge;
      set(state => {
        state.edges = addEdge(newEdge, state.edges) as CEdge[];
        state.isDirty = true;
      });
      get().runSimulation();
    },

    addNode: (type, position) => {
      const node = createNode(type, position) as CNode;
      set(state => { state.nodes.push(node); state.isDirty = true; });
      get().runSimulation();
    },

    toggleInput: (nodeId) => {
      set(state => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (node?.data.gateType === 'INPUT') {
          node.data.value = (node.data.value === 1 ? 0 : 1) as SignalValue;
        }
      });
      get().runSimulation();
    },

    updateNodeLabel: (nodeId, label) => {
      set(state => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (node) node.data.label = label;
      });
    },

    runSimulation: () => {
      const { nodes, edges } = get();
      if (!nodes.length) return;

      const { signalMap, sequentialStates } = simulateCircuit(nodes, edges);

      set(state => {
        const sm: Record<string, Record<string, SignalValue>> = {};
        signalMap.forEach((v, k) => { sm[k] = v; });
        state.signalMap = sm;

        state.nodes.forEach(node => {
          const out = signalMap.get(node.id);
          if (out) node.data.outputSignals = { ...out };

          const incoming = state.edges.filter(e => e.target === node.id);
          const newIn: Record<string, SignalValue> = {};
          incoming.forEach(e => {
            const src = signalMap.get(e.source);
            if (src && e.sourceHandle && e.targetHandle) {
              newIn[e.targetHandle] = (src[e.sourceHandle] ?? 0) as SignalValue;
            }
          });
          node.data.inputSignals = newIn;

          const seqState = sequentialStates.get(node.id);
          if (seqState) node.data.sequentialState = seqState;
        });

        state.edges.forEach(edge => {
          const src = signalMap.get(edge.source);
          if (src && edge.sourceHandle) {
            const sig = (src[edge.sourceHandle] ?? 0) as SignalValue;
            if (edge.data) edge.data.signal = sig;
            else edge.data = { signal: sig };
          }
        });
      });

      try { localStorage.setItem(LS_AUTOSAVE, JSON.stringify(get().serialize())); } catch {}
    },

    buildTruthTable: () => {
      const { nodes, edges } = get();
      set(state => {
        state.truthTable = generateTruthTable(nodes, edges);
        state.activeTab = 'truthtable';
      });
    },

    setActiveTab: (tab) => set(state => { state.activeTab = tab; }),
    setSelectedNodeId: (id) => set(state => { state.selectedNodeId = id; }),

    clearCircuit: () => {
      set(state => {
        state.nodes = [];
        state.edges = [];
        state.signalMap = {};
        state.truthTable = null;
        state.isDirty = false;
        state.selectedNodeId = null;
        state.circuitName = 'Untitled Circuit';
      });
    },

    saveCircuit: () => {
      const circuit = get().serialize();
      try {
        localStorage.setItem(`logiclab:circuit:${circuit.name}`, JSON.stringify(circuit));
        const idx: { name: string; savedAt: string }[] = JSON.parse(localStorage.getItem(LS_INDEX) ?? '[]');
        const i = idx.findIndex(e => e.name === circuit.name);
        const entry = { name: circuit.name, savedAt: circuit.savedAt };
        if (i >= 0) idx[i] = entry; else idx.push(entry);
        localStorage.setItem(LS_INDEX, JSON.stringify(idx));
        set(state => { state.isDirty = false; });
        get().showNotification('Circuit saved!', 'success');
      } catch {
        get().showNotification('Failed to save', 'error');
      }
    },

    loadCircuit: (circuit) => {
      set(state => {
        state.nodes = circuit.nodes as CNode[];
        state.edges = circuit.edges as CEdge[];
        state.circuitName = circuit.name;
        state.isDirty = false;
        state.truthTable = null;
        state.selectedNodeId = null;
      });
      get().runSimulation();
    },

    exportCircuit: () => {
      const circuit = get().serialize();
      const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${circuit.name.replace(/\s+/g, '_')}.logiclab.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importCircuit: (json) => {
      try {
        const circuit = JSON.parse(json) as SavedCircuit;
        if (circuit.version !== '1.0') throw new Error('bad version');
        get().loadCircuit(circuit);
        get().showNotification(`Loaded "${circuit.name}"`, 'success');
      } catch {
        get().showNotification('Invalid circuit file', 'error');
      }
    },

    setCircuitName: (name) => set(state => { state.circuitName = name; }),

    deleteNode: (id) => {
      get().onNodesChange([{ type: 'remove', id }]);
    },

    deleteEdge: (id) => {
      get().onEdgesChange([{ type: 'remove', id }]);
    },

    showNotification: (message, type) => {
      set(state => { state.notification = { message, type }; });
      setTimeout(() => set(state => { state.notification = null; }), 2500);
    },

    serialize: () => ({
      version: '1.0' as const,
      name: get().circuitName,
      savedAt: new Date().toISOString(),
      nodes: get().nodes,
      edges: get().edges,
    }),
  })),
);

// Restore last auto-saved circuit
try {
  const raw = localStorage.getItem(LS_AUTOSAVE);
  if (raw) useCircuitStore.getState().loadCircuit(JSON.parse(raw) as SavedCircuit);
} catch {}
