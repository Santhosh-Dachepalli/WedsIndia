import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import CustomerApp from './pages/CustomerApp'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminPanel from './pages/AdminPanel'
import SignUp from './pages/SignUp'
import Login from './pages/Login'

function App() {
    const [user, setUser] = useState(null) // Global Auth State

    // Protected Route Wrapper
    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!user) return <Navigate to="/" replace />
        if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />
        return children
    }

    return (
        <BrowserRouter>
            <div className="app-container">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login setUser={setUser} />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* Protected Routes */}
                    <Route
                        path="/customer/*"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <CustomerApp />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/*"
                        element={
                            <ProtectedRoute allowedRole="owner">
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
