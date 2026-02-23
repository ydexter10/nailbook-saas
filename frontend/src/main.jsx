import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#1f2937',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontFamily: 'Inter, sans-serif',
                },
                success: {
                    iconTheme: { primary: '#e11d48', secondary: '#fff' },
                },
                error: {
                    iconTheme: { primary: '#dc2626', secondary: '#fff' },
                },
            }}
        />
    </React.StrictMode>,
)
