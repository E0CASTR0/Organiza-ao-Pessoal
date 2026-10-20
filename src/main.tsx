import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/600.css'
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
