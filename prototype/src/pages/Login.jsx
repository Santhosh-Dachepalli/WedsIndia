import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, LogIn } from 'lucide-react'
import { users } from '../data/mockAuth'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'

export default function Login({ setUser }) {
    const [email, setEmail] = useState('user@weds.in') // Default for demo
    const [password, setPassword] = useState('User@123')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()
        // 1. Check Mock Data
        const foundUser = users.find(u => u.email === email && u.password === password)

        if (foundUser) {
            setUser(foundUser) // Set Global Auth State
            if (foundUser.role === 'customer') navigate('/customer')
            if (foundUser.role === 'owner') navigate('/owner')
            if (foundUser.role === 'admin') navigate('/admin')
        } else {
            setError('Invalid credentials. Try user@weds.in / User@123')
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user

            // For prototype, we treat all Google logins as "Customers"
            const appUser = {
                id: user.uid,
                name: user.displayName || 'Google User',
                email: user.email,
                role: 'customer' // Default role
            }

            setUser(appUser)
            navigate('/customer')
        } catch (err) {
            console.error(err)
            setError('Google Sign-In failed. Please try again.')
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', fontFamily: 'Inter, sans-serif' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Shield size={30} color="#1e40af" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', color: '#111827', margin: 0 }}>Welcome Back</h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Login to access your wedding dashboard</p>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {error}
                </div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', transition: 'all 0.2s' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', transition: 'all 0.2s' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <LogIn size={20} /> Login with Email
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#9ca3af', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                    <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="hover-card"
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white',
                        color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
                    Sign in with Google
                </button>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Don't have an account? </span>
                    <a href="/signup" style={{ color: '#1e40af', fontWeight: 600, textDecoration: 'none' }}>Sign Up</a>
                </div>
            </div>
        </div>
    )
}
