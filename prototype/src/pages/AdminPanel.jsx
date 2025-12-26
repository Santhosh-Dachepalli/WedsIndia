import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { halls } from '../data/mockData'
import { users } from '../data/mockAuth'

export default function AdminPanel() {
    // Simulate some pending approvals using halls with IDs > 3 (if any) or just mock some
    const pendingHalls = halls.filter(h => h.id > 3)
    const [approvalList, setApprovalList] = useState(pendingHalls)

    const handleAction = (id, action) => {
        setApprovalList(approvalList.filter(h => h.id !== id))
        alert(`Hall ${action}ed successfully`)
    }

    return (
        <div style={{ padding: '2rem', background: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#1e3a8a' }}>Admin Control Center</h1>
                <Link to="/" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 500 }}>Logout</Link>
            </header>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue (10%)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₹12,45,000</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Halls</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{halls.length}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Registered Users</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{users.length}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* User Database View */}
                <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1f2937' }}>User Database (Registered)</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Name</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Email</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Role</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                                        <td style={{ padding: '1rem', color: '#6b7280' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'owner' ? '#e0e7ff' : '#ecfdf5',
                                                color: u.role === 'admin' ? '#b91c1c' : u.role === 'owner' ? '#4338ca' : '#047857'
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#10b981' }}>Active</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Approval Queue */}
                <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1f2937' }}>Pending Approvals</h2>
                    {approvalList.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No pending approvals.</p>
                    ) : (
                        approvalList.map(h => (
                            <div key={h.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <img src={h.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div>
                                        <h4 style={{ margin: 0 }}>{h.name}</h4>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{h.location}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleAction(h.id, 'Approve')} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleAction(h.id, 'Reject')} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
