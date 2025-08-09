import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import DynamicJsonGenerator from './components/DynamicJsonGenerator'
import { ArchitectureProvider } from './contexts/ArchitectureContext'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DndProvider backend={HTML5Backend}>
          <ArchitectureProvider>
            <div className="app">
              <DynamicJsonGenerator />
            </div>
          </ArchitectureProvider>
        </DndProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
