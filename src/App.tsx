import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Tabs, Tab, Container, Alert, Button } from 'react-bootstrap'
import './App.css'
import { useAppContext } from './context/AppContext'

// Import the ColorPickerContext
import { useColorPickerContext } from './context/ColorPickerContext'

// Import section components
import LiveTournaments from './components/live-tournaments/LiveTournaments'
import Simulation from './components/simulation/Simulation'
import History from './components/history/History'
import DataManager from './components/common/DataManager'
import LocalStorageViewer from './components/debug/LocalStorageViewer'

function App() {
  const [key, setKey] = useState('liveTournaments')
  const [showDebug, setShowDebug] = useState(false)
  const { autoRestorePerformed, clearAutoRestoreFlag, state } = useAppContext()
  const [showRestoreNotification, setShowRestoreNotification] = useState(false)

  // Get car picker state and toggle function from context
  const { useCarPicker, toggleCarPickerStyle } = useColorPickerContext();

  // Show notification when data is auto-restored
  useEffect(() => {
    if (autoRestorePerformed) {
      setShowRestoreNotification(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowRestoreNotification(false)
        clearAutoRestoreFlag()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoRestorePerformed, clearAutoRestoreFlag])

  return (
    <Container fluid className="mt-2 px-0 px-sm-1">
      <div className="mx-auto" style={{ maxWidth: '100%' }}>
        {showRestoreNotification && (
          <Alert
            variant="success"
            className="mb-3 d-flex justify-content-between align-items-center"
            onClose={() => {
              setShowRestoreNotification(false)
              clearAutoRestoreFlag()
            }}
            dismissible
          >
            <div>
              <i className="bi bi-check-circle-fill me-2"></i>
              {state.tournaments.length} tournaments were automatically restored from backup.
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">
            HEAT Tournament Manager
            <button
              onClick={() => setShowDebug(!showDebug)}
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#6c757d'
              }}
            >
              {showDebug ? 'Hide Debug' : 'Debug'}
            </button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleCarPickerStyle}
              style={{ marginLeft: '12px', fontSize: '12px' }}
            >
              {useCarPicker ? 'Use Color Squares' : 'Use Car Icons'}
            </Button>
          </h1>
          <DataManager />
        </div>

        {showDebug && <LocalStorageViewer />}

        <Tabs
          id="main-navigation"
          activeKey={key}
          onSelect={(k) => k && setKey(k)}
          className="mb-0"
          fill
        >
          <Tab eventKey="liveTournaments" title="Live Tournaments">
            <div className="p-1 tab-container">
              <LiveTournaments />
            </div>
          </Tab>
          <Tab eventKey="simulation" title="Simulation">
            <div className="p-1 tab-container">
              <Simulation />
            </div>
          </Tab>
          <Tab eventKey="history" title="History">
            <div className="p-1 tab-container">
              <History />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  )
}

export default App
