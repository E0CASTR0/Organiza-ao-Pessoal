import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist/wght.css'
import './index.css'
import App from './App.tsx'

// O iOS só aplica o estado :active (o "afundar" dos botões e cartões) em elementos que não
// são link/botão se existir algum ouvinte de toque no documento — este vazio resolve.
document.body.addEventListener('touchstart', () => {}, { passive: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
