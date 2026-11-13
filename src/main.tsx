import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './styles/global.css'

registerSW({ immediate: true })

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found: expected an element with id="root" in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
