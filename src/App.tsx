import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Tabs, Tab, Container, Alert } from 'react-bootstrap'
import './App.css'
import { useAppContext } from './context/AppContext'
import { useBackground } from './context/BackgroundContext'
import DataManager from './components/common/DataManager'
import Settings from './components/common/Settings'
import LocalStorageViewer from './components/debug/LocalStorageViewer'
import LiveTournaments from './components/live-tournaments/LiveTournaments'
import Simulation from './components/simulation/Simulation'
import History from './components/history/History'

function App() {
  const [key, setKey] = useState('liveTournaments')
  const [showDebug, setShowDebug] = useState(false)
  const { state, clearAutoRestoreFlag } = useAppContext()
  const { cycleBackground } = useBackground()
  const [showRestoreNotification, setShowRestoreNotification] = useState(
    localStorage.getItem('heat-tournament-auto-restore') === 'true'
  )

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

        <div className="d-flex justify-content-between align-items-center mb-3 header-panel">
          <h1 className="mb-0" style={{ cursor: 'pointer' }} onClick={cycleBackground}>
            HEAT Tournament Manager
          </h1>
          <div className="d-flex gap-2">
            <Settings showDebug={showDebug} setShowDebug={setShowDebug} />
            <DataManager />
          </div>
        </div>

        {showDebug && <LocalStorageViewer />}

        <div className="content-panel">
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
      </div>
    </Container>
  )
}

export default App
