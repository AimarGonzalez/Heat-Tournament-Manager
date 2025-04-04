import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './context/AppContext'
import { ColorPickerProvider } from './context/ColorPickerContext'
import { BackgroundProvider } from './context/BackgroundContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <ColorPickerProvider>
        <BackgroundProvider>
          <App />
        </BackgroundProvider>
      </ColorPickerProvider>
    </AppProvider>
  </React.StrictMode>,
)
