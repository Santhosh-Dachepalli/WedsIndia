import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, ShieldCheck } from 'lucide-react'

export default function Home() {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1565C0 40%, #F5F5F5 40%)' }}>
            <div className="container" style={{ padding: '4rem 1rem' }}>
                <h1 style={{ color: 'white', textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    BookMyVenue
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '1.2rem', marginBottom: '4rem' }}>
                    Select a persona to view the user flow
                </p>

                <div className="grid-3">
                    <Link to="/customer" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ textAlign: 'center', height: '100%', transition: 'transform 0.2s' }}>
                            <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                                <Users size={48} />
                            </div>
                            <h2 style={{ color: '#333' }}>Customer App</h2>
                            <p style={{ color: '#666' }}>Search halls, check availability, and book.</p>
                            <div style={{ marginTop: '1.5rem', color: 'var(--color-secondary-dark)', fontWeight: 'bold' }}>
                                View App &rarr;
                            </div>
                        </div>
                    </Link>

                    <Link to="/owner" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ textAlign: 'center', height: '100%' }}>
                            <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                                <Building2 size={48} />
                            </div>
                            <h2 style={{ color: '#333' }}>Hall Owner</h2>
                            <p style={{ color: '#666' }}>Manage listings, calendar, and bookings.</p>
                            <div style={{ marginTop: '1.5rem', color: 'var(--color-secondary-dark)', fontWeight: 'bold' }}>
                                View Dashboard &rarr;
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ textAlign: 'center', height: '100%' }}>
                            <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                                <ShieldCheck size={48} />
                            </div>
                            <h2 style={{ color: '#333' }}>Admin Panel</h2>
                            <p style={{ color: '#666' }}>Approve halls, payout commissions, and analytics.</p>
                            <div style={{ marginTop: '1.5rem', color: 'var(--color-secondary-dark)', fontWeight: 'bold' }}>
                                View Panel &rarr;
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
