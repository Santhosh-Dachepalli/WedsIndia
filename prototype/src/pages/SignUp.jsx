import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight, Check, CheckCircle, AlertCircle, Eye, EyeOff, Facebook, Chrome } from 'lucide-react'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import venueBg from '../assets/signup_venue_bg.png'

export default function SignUp({ setUser }) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    })

    const [status, setStatus] = useState({
        email: 'idle', // idle, loading, valid, invalid, exists
        phone: 'idle'  // idle, loading, valid, invalid, exists
    })

    const [showPassword, setShowPassword] = useState(false)
    const [globalError, setGlobalError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000)

    // Regex Patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[6-9]\d{9}$/
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1000)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        if (name === 'email' || name === 'phone') {
            setStatus(prev => ({ ...prev, [name]: 'idle' }))
        }
        setGlobalError('')
    }

    // --- Validation Logic ---
    const checkEmail = async () => {
        if (!formData.email) return
        if (!emailRegex.test(formData.email)) {
            setStatus(prev => ({ ...prev, email: 'invalid' }))
            return
        }
        setStatus(prev => ({ ...prev, email: 'loading' }))
        try {
            const q = query(collection(db, "users"), where("email", "==", formData.email))
            const querySnapshot = await getDocs(q)
            setStatus(prev => ({ ...prev, email: querySnapshot.empty ? 'valid' : 'exists' }))
        } catch (error) {
            console.error("Error checking email:", error)
        }
    }

    const checkPhone = async () => {
        if (!formData.phone) return
        if (!phoneRegex.test(formData.phone)) {
            setStatus(prev => ({ ...prev, phone: 'invalid' }))
            return
        }
        setStatus(prev => ({ ...prev, phone: 'loading' }))
        try {
            const q = query(collection(db, "users"), where("phone", "==", formData.phone))
            const querySnapshot = await getDocs(q)
            setStatus(prev => ({ ...prev, phone: querySnapshot.empty ? 'valid' : 'exists' }))
        } catch (error) {
            console.error("Error checking phone:", error)
        }
    }

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!emailRegex.test(formData.email)) return setGlobalError('Invalid Email Format')
        if (!phoneRegex.test(formData.phone)) return setGlobalError('Invalid Phone Number')
        if (status.email === 'exists') return setGlobalError('Email already registered')
        if (status.phone === 'exists') return setGlobalError('Phone number already registered')
        if (formData.password !== formData.confirmPassword) return setGlobalError('Passwords do not match')
        if (!passwordRegex.test(formData.password)) return setGlobalError('Password is too weak')

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = userCredential.user
            await updateProfile(user, { displayName: formData.fullName })
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                createdAt: new Date()
            })

            // Update local state to prevent App.jsx race condition
            if (setUser) {
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.fullName,
                    role: formData.role
                })
            }

            setSuccess(true)
            setTimeout(() => {
                if (formData.role === 'admin') navigate('/admin')
                else if (formData.role === 'owner') navigate('/owner')
                else navigate('/customer')
            }, 1000)

        } catch (err) {
            console.error(err)
            if (err.code === 'auth/email-already-in-use') setGlobalError('Email is already registered.')
            else setGlobalError(err.message)
        }
    }

    // --- Sub Components ---
    const StatusIcon = ({ type }) => {
        if (status[type] === 'loading') return <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #ccc', borderTopColor: '#4F46E5', borderRadius: '50%' }}></div>
        if (status[type] === 'valid') return <CheckCircle size={18} color="#10B981" />
        if (status[type] === 'invalid') return <AlertCircle size={18} color="#EF4444" />
        if (status[type] === 'exists') return <AlertCircle size={18} color="#EF4444" />
        return null
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>

            {/* Left Side - Form */}
            <div style={{ flex: isMobile ? '1' : '0 0 500px', display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem', overflowY: 'auto' }}>

                {/* Back Link */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748B', fontSize: '0.9rem', fontWeight: 500 }}>
                        &larr; Back
                    </Link>
                </div>

                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.2 }}>Sign Up</h1>
                            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Secure Your Events with BookMyVenue</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                            <span style={{ color: '#94A3B8', display: 'block' }}>Already member?</span>
                            <Link to="/" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </div>
                    </div>

                    {globalError && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{globalError}</div>}
                    {success && <div style={{ background: '#ECFDF5', color: '#10B981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Account created successfully!</div>}

                    {/* Role Selection Tabs */}
                    <div style={{ display: 'flex', marginBottom: '2rem', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'customer' })}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: formData.role === 'customer' ? 'white' : 'transparent', color: formData.role === 'customer' ? '#0F172A' : '#64748B', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: formData.role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                        >
                            I am a Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'owner' })}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: formData.role === 'owner' ? 'white' : 'transparent', color: formData.role === 'owner' ? '#0F172A' : '#64748B', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: formData.role === 'owner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                        >
                            I own a Hall
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Name Input */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: '10px', left: '0', color: '#9CA3AF' }} />
                                <input
                                    type="text" name="fullName" placeholder="Full Name"
                                    value={formData.fullName} onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', color: '#334155', background: 'transparent' }}
                                />
                                {formData.fullName && <CheckCircle size={16} color="#10B981" style={{ position: 'absolute', right: 0, top: '10px' }} />}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: '10px', left: '0', color: '#9CA3AF' }} />
                                <input
                                    type="email" name="email" placeholder="Email Address"
                                    value={formData.email} onChange={handleChange} onBlur={checkEmail}
                                    style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2rem', border: 'none', borderBottom: `1px solid ${status.email === 'invalid' || status.email === 'exists' ? '#EF4444' : '#E2E8F0'}`, outline: 'none', fontSize: '0.95rem', color: '#334155', background: 'transparent' }}
                                />
                                <div style={{ position: 'absolute', right: 0, top: '10px' }}>
                                    <StatusIcon type="email" />
                                </div>
                            </div>
                            {status.email === 'exists' && <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#EF4444' }}>Email already used</span>}
                        </div>

                        {/* Phone Input */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', top: '10px', left: '0', color: '#9CA3AF' }} />
                                <input
                                    type="tel" name="phone" placeholder="Mobile Number"
                                    value={formData.phone} onChange={handleChange} onBlur={checkPhone}
                                    maxLength={10}
                                    style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2rem', border: 'none', borderBottom: `1px solid ${status.phone === 'invalid' || status.phone === 'exists' ? '#EF4444' : '#E2E8F0'}`, outline: 'none', fontSize: '0.95rem', color: '#334155', background: 'transparent' }}
                                />
                                <div style={{ position: 'absolute', right: 0, top: '10px' }}>
                                    <StatusIcon type="phone" />
                                </div>
                            </div>
                            {status.phone === 'exists' && <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#EF4444' }}>Number already used</span>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '10px', left: '0', color: '#9CA3AF' }} />
                                <input
                                    type={showPassword ? "text" : "password"} name="password" placeholder="Password"
                                    value={formData.password} onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 2rem', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', color: '#334155', background: 'transparent' }}
                                />
                                <div style={{ position: 'absolute', right: 0, top: '10px', cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '10px', left: '0', color: '#9CA3AF' }} />
                                <input
                                    type="password" name="confirmPassword" placeholder="Re-Type Password"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', color: '#334155', background: 'transparent' }}
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <CheckCircle size={16} color="#10B981" style={{ position: 'absolute', right: 0, top: '10px' }} />
                                )}
                            </div>
                        </div>

                        {/* Validation Hints */}
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: formData.password.length >= 8 ? '#10B981' : 'inherit' }}>• At least 8 characters</span>
                            <span style={{ color: /\d/.test(formData.password) ? '#10B981' : 'inherit' }}>• Least one number (0-9) or a symbol</span>
                            <span style={{ color: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? '#10B981' : 'inherit' }}>• Lowercase (a-z) and uppercase (A-Z)</span>
                        </div>

                        <button
                            type="submit"
                            style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', transition: 'transform 0.1s' }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Sign Up
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ height: '1px', background: '#E2E8F0', flex: 1 }}></div>
                            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Or</span>
                            <div style={{ height: '1px', background: '#E2E8F0', flex: 1 }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                            <button type="button" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Facebook size={20} color="#1877F2" fill="#1877F2" />
                            </button>
                            <button type="button" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Chrome size={20} color="#EA4335" />
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Right Side - Graphics - Fixed Layout */}
            {!isMobile && (
                <div style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url(${venueBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))'
                    }}>
                        <div style={{ position: 'absolute', bottom: '4rem', left: '3rem', color: 'white', paddingRight: '2rem' }}>
                            <h2 style={{ fontSize: '3rem', fontWeight: 700, margin: '0 0 1rem 0', lineHeight: 1.1 }}>Plan Your Perfect <br />Event Today</h2>
                            <p style={{ fontSize: '1.25rem', opacity: 0.95, maxWidth: '500px', fontWeight: 500 }}>Join thousands of satisfied customers who found their dream venue with BookMyVenue.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
