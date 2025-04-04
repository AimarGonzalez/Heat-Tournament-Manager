import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import { ColorPickerProvider } from './context/ColorPickerContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <ColorPickerProvider>
        <App />
      </ColorPickerProvider>
    </AppProvider>
  </React.StrictMode>,
)
