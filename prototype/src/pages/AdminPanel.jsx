import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Search, Users, Home } from 'lucide-react'
import { db } from '../firebase'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export default function AdminPanel() {
    const [usersList, setUsersList] = useState([])
    const [hallsList, setHallsList] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [hallSearch, setHallSearch] = useState('')
    const [loading, setLoading] = useState(true)

    // New State for Verification Loop
    const [selectedHall, setSelectedHall] = useState(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        // Real-time Users
        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setUsersList(usersData)
            setLoading(false)
        })

        // Real-time Halls
        const unsubscribeHalls = onSnapshot(collection(db, 'halls'), (snapshot) => {
            const hallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setHallsList(hallsData)
        })

        return () => {
            unsubscribeUsers()
            unsubscribeHalls()
        }
    }, [])

    const handleAction = async (id, action, reason = '') => {
        try {
            const hallRef = doc(db, 'halls', id)
            const updateData = {
                status: action === 'Approve' ? 'Approved' : 'Rejected'
            }
            if (action === 'Reject') {
                updateData.rejectionReason = reason
            }

            await updateDoc(hallRef, updateData)
            alert(`Hall ${action}d successfully!`)
            setSelectedHall(null)
            setShowRejectModal(false)
            setRejectionReason('')
        } catch (error) {
            console.error("Error updating hall status:", error)
            alert("Action failed: " + error.message)
        }
    }

    const filteredUsers = usersList.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    )

    const pendingHalls = hallsList.filter(h => h.status === 'Pending')
    const filteredHalls = pendingHalls.filter(h =>
        h.name?.toLowerCase().includes(hallSearch.toLowerCase())
    )

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Dashboard...</div>

    return (
        <div style={{ padding: '2rem', background: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#1e3a8a' }}>Admin Control Center</h1>
                <Link to="/" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 500 }}>Logout</Link>
            </header>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Platform Revenue</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₹12,45,000</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Halls</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{hallsList.length}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Registered Users</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{usersList.length}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* User Database View */}
                <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={24} color="#3b82f6" /> User Database
                        </h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', width: '250px', fontSize: '0.9rem' }}
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </div>
                    </div>

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
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name || 'N/A'}</td>
                                        <td style={{ padding: '1rem', color: '#6b7280' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'owner' ? '#e0e7ff' : '#ecfdf5',
                                                color: u.role === 'admin' ? '#b91c1c' : u.role === 'owner' ? '#4338ca' : '#047857'
                                            }}>
                                                {(u.role || 'customer').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#10b981' }}>Active</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No users found matching your search.</div>}
                    </div>
                </div>

                {/* Approval Queue */}
                <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Home size={24} color="#f59e0b" /> Pending Approvals
                    </h2>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search hall name..."
                            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            value={hallSearch}
                            onChange={(e) => setHallSearch(e.target.value)}
                        />
                    </div>

                    {filteredHalls.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>No halls matching your search.</p>
                    ) : (
                        filteredHalls.map(h => (
                            <div key={h.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', transition: 'all 0.2s hover' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <img src={h.image || 'https://via.placeholder.com/60'} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div>
                                        <h4 style={{ margin: 0, color: '#1e3a8a' }}>{h.name}</h4>
                                        <button
                                            onClick={() => setSelectedHall(h)}
                                            style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', padding: 0, cursor: 'pointer' }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleAction(h.id, 'Approve')} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => { setSelectedHall(h); setShowRejectModal(true); }} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Hall Details Modal */}
            {selectedHall && !showRejectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Hall Details</h2>
                            <button onClick={() => setSelectedHall(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <img src={selectedHall.image} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div><strong>Name:</strong> {selectedHall.name}</div>
                            <div><strong>Location:</strong> {selectedHall.location}</div>
                            <div><strong>Price:</strong> ₹{Number(selectedHall.price).toLocaleString('en-IN')}</div>
                            <div><strong>Capacity:</strong> {selectedHall.capacity} Pax</div>
                            <div>
                                <strong>Amenities:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                    {(selectedHall.amenities || []).length > 0 ? (
                                        selectedHall.amenities.map(a => (
                                            <span key={a} style={{ padding: '0.2rem 0.6rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {a}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.8rem' }}>None specified</span>
                                    )}
                                </div>
                            </div>
                            <div><strong>Description:</strong> {selectedHall.description}</div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={() => handleAction(selectedHall.id, 'Approve')} className="btn-primary" style={{ flex: 1 }}>Approve Now</button>
                            <button onClick={() => setShowRejectModal(true)} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%' }}>
                        <h2>Reason for Rejection</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Explain why this hall is being rejected so the owner can fix it.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Please provide a clearer main photo."
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '100px', marginBottom: '1.5rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f3f4f6', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={() => handleAction(selectedHall.id, 'Reject', rejectionReason)}
                                disabled={!rejectionReason.trim()}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: rejectionReason.trim() ? 1 : 0.5 }}
                            >
                                Submit Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

