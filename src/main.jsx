import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RAGProvider } from './contexts/RAGContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RAGProvider>
            <App />
        </RAGProvider>
    </React.StrictMode>,
)
