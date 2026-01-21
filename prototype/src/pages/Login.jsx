import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import venueBg from '../assets/signup_venue_bg.png' // Utilizing the same luxury image

export default function Login({ setUser }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [savedAccounts, setSavedAccounts] = useState({})
    const [error, setError] = useState('')
    const navigate = useNavigate()

    React.useEffect(() => {
        const saved = localStorage.getItem('savedAccounts')
        if (saved) {
            try {
                setSavedAccounts(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse saved accounts", e)
            }
        }
    }, [])

    const handleEmailChange = (e) => {
        const val = e.target.value.trim()
        setEmail(val)
        if (savedAccounts[val]) {
            setPassword(savedAccounts[val])
            setRememberMe(true)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Explicitly fetch role to ensure correct navigation in this component
            const userDoc = await getDoc(doc(db, "users", user.uid))
            const role = userDoc.exists() ? (userDoc.data().role || 'customer') : 'customer'

            setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: role
            })

            if (rememberMe) {
                const newSaved = { ...savedAccounts, [email]: password }
                setSavedAccounts(newSaved)
                localStorage.setItem('savedAccounts', JSON.stringify(newSaved))
            }

            if (role === 'admin') navigate('/admin')
            else if (role === 'owner') navigate('/owner')
            else navigate('/customer')
        } catch (err) {
            console.error(err)
            setError(err.message)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user

            let role = 'customer'
            const userDoc = await getDoc(doc(db, "users", user.uid))

            if (userDoc.exists()) {
                role = userDoc.data().role || 'customer'
            } else {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: user.displayName,
                    email: user.email,
                    role: 'customer',
                    createdAt: new Date()
                })
            }

            setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: role
            })

            if (role === 'admin') navigate('/admin')
            else if (role === 'owner') navigate('/owner')
            else navigate('/customer')
        } catch (err) {
            console.error(err)
            setError('Google Sign-In failed. Please try again.')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', fontFamily: 'Inter, sans-serif', padding: '1rem' }}>

            <div className="login-card" style={{ width: '100%', maxWidth: '1200px', background: 'white', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', minHeight: '700px' }}>

                {/* Left Side - Form */}
                <div className="login-form-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000', marginBottom: '0.5rem', letterSpacing: '-1px' }}>BookMyVenue.</h2>
                    </div>

                    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

                        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', lineHeight: 1.1 }} className="login-title">Hi there!</h1>
                        <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '2rem' }}>Welcome to BookMyVenue Dashboard</p>

                        {/* Google Button - Top Priority */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E5E7EB', background: 'white',
                                color: '#1F2937', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer',
                                transition: 'all 0.2s', marginBottom: '2rem'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
                            Log in with Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 2rem 0', color: '#9CA3AF', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                            <span style={{ padding: '0 1rem' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                        </div>

                        {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>}

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            <input
                                type="email"
                                placeholder="Your email"
                                list="saved-emails"
                                value={email}
                                onChange={handleEmailChange}
                                style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', outline: 'none', background: '#F9FAFB', fontSize: '0.95rem', color: '#1F2937' }}
                            />
                            <datalist id="saved-emails">
                                {Object.keys(savedAccounts).map(acc => (
                                    <option key={acc} value={acc} />
                                ))}
                            </datalist>

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', outline: 'none', background: '#F9FAFB', fontSize: '0.95rem', color: '#1F2937' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe} 
                                        onChange={e => setRememberMe(e.target.checked)}
                                        style={{ accentColor: '#111827' }}
                                    />
                                    Save Password
                                </label>
                                <a href="#" style={{ color: '#2563EB', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                            </div>

                            <button type="submit"
                                style={{
                                    background: '#111827', color: 'white', padding: '1.25rem', borderRadius: '100px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', border: 'none', marginTop: '1rem', transition: 'transform 0.1s'
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Log In
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Don't have an account? </span>
                            <Link to="/signup" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div style={{ flex: 1, background: '#111827', position: 'relative', overflow: 'hidden', display: 'none', '@media(min-width: 1024px)': { display: 'block' } }} className="desktop-flex">
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${venueBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.8
                    }}></div>

                    {/* Dark Overlay with Gradient */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, #111827 10%, rgba(17, 24, 39, 0) 80%)'
                    }}></div>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '4rem' }}>
                        <div>
                            <div style={{ marginBottom: '2rem', fontSize: '4rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'serif' }}>“</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
                                Go anywhere you want in a <br /> Galaxy full of wonders!
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60A5FA' }}></div>
                                <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>01</span>
                                <span style={{ color: '#4B5563', fontSize: '0.9rem' }}>06</span>
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    {`
                    .login-form-container { padding: 4rem; }
                    .login-title { fontSize: 3.5rem !important; }

                    @media (min-width: 1024px) {
                        .desktop-flex { display: block !important; }
                    }
                    @media (max-width: 1023px) {
                        .desktop-flex { display: none !important; }
                        .login-card {
                            min-height: auto !important;
                            border-radius: 24px !important;
                            flex-direction: column !important;
                        }
                        .login-form-container { 
                            padding: 2.5rem 1.5rem !important; 
                        }
                        .login-title { 
                            font-size: 2.5rem !important; 
                            margin-bottom: 0.5rem !important;
                        }
                    }
                    `}
                </style>
            </div>
        </div>
    )
}
