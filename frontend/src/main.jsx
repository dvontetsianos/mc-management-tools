import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import './index.css'
import App from './App.jsx'
import theme from './theme'
import { APP_TITLE } from "./config"
import { logout } from "./services/auth"

document.title = APP_TITLE


//if the server says this login isn't valid anymore (signed out by an admin, password changed),
//go back to the login page and show why - wherever in the app it happens
const originalFetch = window.fetch.bind(window)

window.fetch = async (...args) => {
  const response = await originalFetch(...args)
  const url = String(args[0]?.url || args[0])

  if (response.status === 401 && !url.endsWith("/login") && localStorage.getItem("token")) {
    const data = await response.clone().json().catch(() => ({}))
    logout()
    try {
      sessionStorage.setItem("signed_out_reason", data.detail || "Please log in again.")
    } catch {
      //not saved, the login page just won't say why
    }
    window.location.href = "/"
  }

  return response
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
