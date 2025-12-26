import React, { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, Calendar, PlusCircle, CheckCircle, XCircle } from 'lucide-react'
import { bookings, halls } from '../data/mockData'

export default function OwnerDashboard() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
            <div style={{ width: '250px', background: 'white', borderRight: '1px solid #ddd', padding: '1.5rem' }}>
                <h2 style={{ color: 'var(--color-primary)', marginTop: 0 }}>HallOwner</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                    <Link to="/owner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#333', fontWeight: 500 }}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/owner/bookings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#333', fontWeight: 500 }}>
                        <Calendar size={20} /> Bookings
                    </Link>
                    <Link to="/owner/halls" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#333', fontWeight: 500 }}>
                        <PlusCircle size={20} /> My Halls
                    </Link>
                    <Link to="/" style={{ marginTop: 'auto', color: '#666', textDecoration: 'none' }}>Log Out</Link>
                </nav>
            </div>
            <div style={{ flex: 1, padding: '2rem' }}>
                <Routes>
                    <Route path="/" element={<OwnerHome />} />
                    <Route path="/bookings" element={<OwnerBookings />} />
                    <Route path="/halls" element={<OwnerHalls />} />
                </Routes>
            </div>
        </div>
    )
}

function OwnerHome() {
    return (
        <div>
            <h1 className="heading-gold">Dashboard Overview</h1>
            <div className="grid-3">
                <div className="card">
                    <h3>Total Earnings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹2,35,000</p>
                </div>
                <div className="card">
                    <h3>Pending Bookings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>3</p>
                </div>
                <div className="card">
                    <h3>Upcoming Events</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>5</p>
                </div>
            </div>
        </div>
    )
}

function OwnerBookings() {
    const [bookingList, setBookingList] = useState(bookings)

    const handleAction = (id, status) => {
        setBookingList(prev => prev.map(b => b.id === id ? { ...b, status } : b))
        alert(`Booking #${id} has been ${status}. Notification sent to user.`)
    }

    return (
        <div>
            <h1>Manage Bookings</h1>
            <div className="card">
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Customer</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookingList.map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem' }}>#{b.id}</td>
                                <td style={{ padding: '1rem' }}>{b.customer}</td>
                                <td style={{ padding: '1rem' }}>{b.date}</td>
                                <td style={{ padding: '1rem' }}>₹{b.amount.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.85rem',
                                        background: b.status === 'Confirmed' ? '#E8F5E9' : b.status === 'Rejected' ? '#FFEBEE' : '#FFF3E0',
                                        color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Rejected' ? '#C62828' : '#EF6C00'
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {b.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleAction(b.id, 'Confirmed')} className="btn-primary" style={{ padding: '0.5rem', background: '#2E7D32' }} title="Accept">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button onClick={() => handleAction(b.id, 'Rejected')} className="btn-primary" style={{ padding: '0.5rem', background: '#C62828' }} title="Reject">
                                                <XCircle size={16} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function OwnerHalls() {
    const [myHalls, setMyHalls] = useState(halls.slice(0, 1)) // Show only one for this owner

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>My Halls</h1>
                <button className="btn-primary">
                    <PlusCircle size={20} /> Add Hall
                </button>
            </div>

            <div className="grid-3">
                {myHalls.map(hall => (
                    <div key={hall.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <div style={{ padding: '1.5rem' }}>
                            <h3>{hall.name}</h3>
                            <p style={{ color: '#666' }}>{hall.location}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{hall.price.toLocaleString('en-IN')}</p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }}>Edit</button>
                                <button className="btn-secondary" style={{ flex: 1, background: '#eee' }}>View</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
