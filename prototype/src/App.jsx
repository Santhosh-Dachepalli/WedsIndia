import React, { useState, useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import CustomerApp from './pages/CustomerApp'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminPanel from './pages/AdminPanel'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import DataSeeder from './components/DataSeeder'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

function App() {
    const [user, setUser] = useState(null) // Global Auth State
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // In a real app, you'd fetch the role from Firestore here.
                // For this prototype, we'll try to keep the existing role if set, 
                // or default to 'customer' if it's a fresh load.
                setUser({
                    ...currentUser,
                    role: 'customer' // Defaulting to customer for now
                })
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
    }

    // Protected Route Wrapper
    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!user) return <Navigate to="/" replace />
        if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />
        return children
    }

    return (
        <BrowserRouter>
            <div className="app-container">
                <ErrorBoundary>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Login setUser={setUser} />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/seed-db" element={<DataSeeder />} />

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
                        {/* Protected Routes */}{/* ... (end of routes) ... */}
                    </Routes>
                </ErrorBoundary>
            </div>
        </BrowserRouter>
    )
}

export default App
