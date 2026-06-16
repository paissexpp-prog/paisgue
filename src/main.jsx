import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { HelmetProvider } from 'react-helmet-async'

const root = document.getElementById('root')

// react-snap butuh hydrate bukan render saat halaman sudah pre-rendered
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    root,
    <React.StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
}