import { ReactFlowProvider } from 'reactflow';
import Toolbar from './components/ui/Toolbar';
import GateToolbox from './components/panels/GateToolbox';
import CircuitCanvas from './components/canvas/CircuitCanvas';
import PropertiesPanel from './components/panels/PropertiesPanel';
import StatusBar from './components/ui/StatusBar';
import Notification from './components/ui/Notification';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col" style={{ width: '100vw', height: '100vh', background: '#0f0f0f' }}>
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <GateToolbox />
          <CircuitCanvas />
          <PropertiesPanel />
        </div>
        <StatusBar />
        <Notification />
      </div>
    </ReactFlowProvider>
  );
}
