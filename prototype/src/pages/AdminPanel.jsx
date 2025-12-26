import React, { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { BarChart3, Users, Building, Shield, Check, X } from 'lucide-react'

export default function AdminPanel() {
    const [pendingHalls, setPendingHalls] = useState([
        { id: 1, name: 'Diamond Convention Hall', location: 'Hyderabad, TS', owner: 'Rajesh Kumar' },
        { id: 2, name: 'Royal Palace', location: 'Mysore, KA', owner: 'Suresh Reddy' }
    ]);

    const handleApprove = (id) => {
        // API Call would go here
        setPendingHalls(prev => prev.filter(h => h.id !== id));
        alert('Hall Approved Successfully');
    };

    const handleReject = (id) => {
        // API Call would go here
        setPendingHalls(prev => prev.filter(h => h.id !== id));
        alert('Hall Rejected');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white' }}>
            <nav style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    <Shield color="#818CF8" /> Admin Space
                </div>
                <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Logout</Link>
            </nav>

            <div className="container" style={{ padding: '2rem' }}>
                <h1 style={{ background: 'linear-gradient(to right, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 2rem 0' }}>
                    Platform Overview
                </h1>

                <div className="grid-3" style={{ marginBottom: '3rem' }}>
                    <StatCard title="Total Revenue (10%)" value="₹1.25L" icon={<BarChart3 />} color="#10B981" />
                    <StatCard title="Active Users" value="1,240" icon={<Users />} color="#3B82F6" />
                    <StatCard title="Partner Halls" value="45" icon={<Building />} color="#F59E0B" />
                </div>

                <h2 style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', margin: '0 0 1.5rem 0' }}>
                    Pending Hall Approvals
                </h2>

                <div style={{ background: '#1E293B', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {pendingHalls.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                            <Check size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>All clean! No pending approvals.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#E2E8F0' }}>
                            <thead>
                                <tr style={{ background: '#334155', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '1.5rem' }}>Hall Name</th>
                                    <th style={{ padding: '1.5rem' }}>Location</th>
                                    <th style={{ padding: '1.5rem' }}>Owner</th>
                                    <th style={{ padding: '1.5rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingHalls.map(hall => (
                                    <tr key={hall.id} style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 500 }}>{hall.name}</td>
                                        <td style={{ padding: '1.5rem', color: '#94A3B8' }}>{hall.location}</td>
                                        <td style={{ padding: '1.5rem', color: '#94A3B8' }}>{hall.owner}</td>
                                        <td style={{ padding: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                                            <button onClick={() => handleApprove(hall.id)} className="btn-primary" style={{ padding: '0.5rem 1.25rem', background: '#10B981', fontSize: '0.9rem', boxShadow: 'none' }}>
                                                Approve
                                            </button>
                                            <button onClick={() => handleReject(hall.id)} className="btn-secondary" style={{ padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '0.9rem' }}>
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: '1rem', background: `${color}20`, borderRadius: '12px', color: color }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }}>{title}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
            </div>
        </div>
    )
}
