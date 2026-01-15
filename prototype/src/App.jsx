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
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

function App() {
    const [user, setUser] = useState(null) // Global Auth State
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
                    const role = userDoc.exists() ? (userDoc.data().role || 'customer') : null

                    setUser(prev => {
                        // If doc doesn't exist yet but we already have a role (from SignUp/Login manual set), keep it
                        if (!role && prev && prev.role) return {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            role: prev.role
                        }
                        return {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            role: role || 'customer'
                        }
                    })
                } catch (error) {
                    console.error("Auth fetch error:", error)
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        role: 'customer'
                    })
                }
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
                        <Route path="/signup" element={<SignUp setUser={setUser} />} />
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
