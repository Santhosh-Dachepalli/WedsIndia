import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default function SignUp() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer' // default
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('') // clear error on type
    }

    const validatePassword = (password) => {
        // Regex: At least one letter, one number, one special char
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Basic Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
            setError('All fields are required.')
            return
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 8 chars and include letters, numbers, and special characters (@$!%*#?&).')
            return
        }

        // Firebase Sign Up
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = userCredential.user

            // Update Profile Name
            await updateProfile(user, {
                displayName: formData.fullName
            })

            setSuccess(true)
            setTimeout(() => {
                // Redirect based on role (mock logic, ideally verify role from DB)
                if (formData.role === 'owner') navigate('/owner')
                else navigate('/customer')
            }, 1500)
        } catch (err) {
            console.error(err)
            let msg = 'Failed to create account.'
            if (err.code === 'auth/email-already-in-use') msg = 'Email is already registered.'
            if (err.code === 'auth/weak-password') msg = 'Password is to weak.'
            setError(msg)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #4F46E5, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Join WedsIndia
                    </h1>
                    <p style={{ color: '#6B7280' }}>Create your account to start booking</p>
                </div>

                {error && (
                    <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{ background: '#ECFDF5', color: '#059669', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle size={18} /> Account Created! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text" name="fullName" placeholder="John Doe"
                                value={formData.fullName} onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="email" name="email" placeholder="john@example.com"
                                value={formData.email} onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="tel" name="phone" placeholder="+91 98765 43210"
                                value={formData.phone} onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="password" name="password" placeholder="••••••••"
                                value={formData.password} onChange={handleChange}
                                style={{ width: '100%', paddingLeft: '3rem' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem' }}>Must contain letters, numbers & special characters.</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>I am a...</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button"
                                onClick={() => setFormData({ ...formData, role: 'customer' })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: `2px solid ${formData.role === 'customer' ? '#4F46E5' : '#E5E7EB'}`, background: formData.role === 'customer' ? '#EEF2FF' : 'white', color: formData.role === 'customer' ? '#4F46E5' : '#6B7280', fontWeight: 600 }}>
                                Customer
                            </button>
                            <button type="button"
                                onClick={() => setFormData({ ...formData, role: 'owner' })}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: `2px solid ${formData.role === 'owner' ? '#4F46E5' : '#E5E7EB'}`, background: formData.role === 'owner' ? '#EEF2FF' : 'white', color: formData.role === 'owner' ? '#4F46E5' : '#6B7280', fontWeight: 600 }}>
                                Hall Owner
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem' }}>
                        Sign Up <ArrowRight size={20} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6B7280' }}>
                    Already have an account? <Link to="/" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    )
}
