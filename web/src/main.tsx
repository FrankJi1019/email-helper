import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import AuthProvider from "./providers/AuthProvider"
import NotificationProvider from "./providers/NotificationProvider"
import MessagesProvider from "./providers/MessagesProvider"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MessagesProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </MessagesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
