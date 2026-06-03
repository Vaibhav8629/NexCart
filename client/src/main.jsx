import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <App />
              <Toaster position="bottom-right" toastOptions={{ 
                duration: 3000,
                style: {
                  background: '#18181B',
                  color: '#fff',
                  border: '1px solid #27272A'
                }
              }} />
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
