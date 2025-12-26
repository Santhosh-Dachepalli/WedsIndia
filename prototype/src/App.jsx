import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CustomerApp from './pages/CustomerApp'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminPanel from './pages/AdminPanel'

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/customer/*" element={<CustomerApp />} />
                    <Route path="/owner/*" element={<OwnerDashboard />} />
                    <Route path="/admin/*" element={<AdminPanel />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
