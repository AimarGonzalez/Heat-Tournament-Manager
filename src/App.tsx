import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Tabs, Tab, Container } from 'react-bootstrap'
import './App.css'

// Import section components
import LiveTournaments from './components/live-tournaments/LiveTournaments'
import Simulation from './components/simulation/Simulation'
import History from './components/history/History'
import DataManager from './components/common/DataManager'
import LocalStorageViewer from './components/debug/LocalStorageViewer'

function App() {
  const [key, setKey] = useState('liveTournaments')
  const [showDebug, setShowDebug] = useState(false)

  return (
    <Container fluid className="mt-4">
      <div className="mx-auto" style={{ maxWidth: '1600px' }}>
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
            <div className="p-3 tab-container">
              <LiveTournaments />
            </div>
          </Tab>
          <Tab eventKey="simulation" title="Simulation">
            <div className="p-3 tab-container">
              <Simulation />
            </div>
          </Tab>
          <Tab eventKey="history" title="History">
            <div className="p-3 tab-container">
              <History />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  )
}

export default App
