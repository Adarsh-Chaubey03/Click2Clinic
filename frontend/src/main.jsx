import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import mainLogo from './assets/MainLogo.png'

const favicon = document.querySelector('link[rel="icon"]')
if (favicon) favicon.href = mainLogo

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppContextProvider>
    <CartProvider>
      <App/>
    </CartProvider>
  </AppContextProvider>
  </BrowserRouter>,
)
