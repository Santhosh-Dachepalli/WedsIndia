import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Calendar, Settings, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react'
import { halls, bookings } from '../data/mockData'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function OwnerDashboard() {
    const [activeTab, setActiveTab] = useState('bookings')
    const [myHalls, setMyHalls] = useState(halls.filter(h => h.id <= 2)) // Mock: Owner owns first 2 halls
    const [myBookings, setMyBookings] = useState(bookings.filter(b => b.hallId <= 2))
    const [uploading, setUploading] = useState(false)

    // Form State for Adding Hall
    const [newHall, setNewHall] = useState({
        name: '', location: '', price: '', capacity: '', image: '', description: ''
    })

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Create a Reference: halls/filename.jpg
            const storageRef = ref(storage, `halls/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            setNewHall(prev => ({ ...prev, image: url }));
            alert('Image Uploaded Successfully!');
        } catch (error) {
            console.error("Upload failed", error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    const handleAddHall = (e) => {
        e.preventDefault()
        // Simulate Adding Logic
        const hall = { ...newHall, id: Date.now(), rating: 0, amenities: ['AC', 'Parking'] }
        setMyHalls([...myHalls, hall])
        setActiveTab('halls')
        alert('Hall Submitted for Admin Approval!')
        setNewHall({ name: '', location: '', price: '', capacity: '', image: '', description: '' })
    }

    const handleBookingAction = (id, action) => {
        setMyBookings(myBookings.map(b => b.id === id ? { ...b, status: action === 'accept' ? 'Confirmed' : 'Rejected' } : b))
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '2rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '3rem', fontFamily: 'Outfit, sans-serif' }}>Partner Portal</div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={() => setActiveTab('bookings')} style={{ padding: '1rem', borderRadius: '12px', background: activeTab === 'bookings' ? '#eff6ff' : 'transparent', color: activeTab === 'bookings' ? '#1e40af' : '#4b5563', border: 'none', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <Calendar size={20} /> My Bookings
                    </button>
                    <button onClick={() => setActiveTab('halls')} style={{ padding: '1rem', borderRadius: '12px', background: activeTab === 'halls' ? '#eff6ff' : 'transparent', color: activeTab === 'halls' ? '#1e40af' : '#4b5563', border: 'none', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <LayoutDashboard size={20} /> My Halls
                    </button>
                    <button onClick={() => setActiveTab('add')} style={{ padding: '1rem', borderRadius: '12px', background: activeTab === 'add' ? '#eff6ff' : 'transparent', color: activeTab === 'add' ? '#1e40af' : '#4b5563', border: 'none', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <PlusCircle size={20} /> Add New Hall
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                    <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600, display: 'block', padding: '1rem' }}>Logout</Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem' }}>

                {activeTab === 'bookings' && (
                    <div className="animate-fade-in">
                        <h1 style={{ marginBottom: '2rem' }}>Booking Requests</h1>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {myBookings.map(b => (
                                <div key={b.id} className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{b.customer}</h3>
                                        <p style={{ margin: 0, color: '#6b7280' }}>{b.date} • ₹{b.amount.toLocaleString('en-IN')}</p>
                                        <span style={{
                                            display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                                            background: b.status === 'Confirmed' ? '#ecfdf5' : b.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                                            color: b.status === 'Confirmed' ? '#047857' : b.status === 'Rejected' ? '#b91c1c' : '#c2410c'
                                        }}>{b.status}</span>
                                    </div>
                                    {b.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => handleBookingAction(b.id, 'accept')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Accept</button>
                                            <button onClick={() => handleBookingAction(b.id, 'reject')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'halls' && (
                    <div className="animate-fade-in">
                        <h1 style={{ marginBottom: '2rem' }}>My Listed Halls</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {myHalls.map((h, i) => (
                                <div key={i} className="card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                                    <img src={h.image || 'https://via.placeholder.com/400x200'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{h.name}</h3>
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{h.location}</p>
                                        <div style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>₹{h.price.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
                        <h1 style={{ marginBottom: '2rem' }}>List New Hall</h1>
                        <form onSubmit={handleAddHall} className="card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input required placeholder="Hall Name" className="card" style={{ padding: '1rem', border: '1px solid #e5e7eb' }} value={newHall.name} onChange={e => setNewHall({ ...newHall, name: e.target.value })} />
                            <input required placeholder="Location (City, Area)" className="card" style={{ padding: '1rem', border: '1px solid #e5e7eb' }} value={newHall.location} onChange={e => setNewHall({ ...newHall, location: e.target.value })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input required type="number" placeholder="Price per Day (₹)" className="card" style={{ padding: '1rem', border: '1px solid #e5e7eb' }} value={newHall.price} onChange={e => setNewHall({ ...newHall, price: e.target.value })} />
                                <input required type="number" placeholder="Capacity (Pax)" className="card" style={{ padding: '1rem', border: '1px solid #e5e7eb' }} value={newHall.capacity} onChange={e => setNewHall({ ...newHall, capacity: e.target.value })} />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Hall Image</label>
                                <div style={{ border: '2px dashed #e5e7eb', padding: '2rem', borderRadius: '12px', textAlign: 'center', background: '#f9fafb' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        {uploading ? (
                                            <span style={{ color: '#2563eb', fontWeight: 600 }}>Uploading to Firebase... ⏳</span>
                                        ) : newHall.image ? (
                                            <>
                                                <img src={newHall.image} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                                                <span style={{ color: '#059669', fontWeight: 600 }}>Change Image</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={32} color="#9ca3af" />
                                                <span style={{ color: '#4b5563' }}>Click to Upload Hall Photo</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <textarea placeholder="Description & Amenities" className="card" style={{ padding: '1rem', border: '1px solid #e5e7eb', minHeight: '100px' }} value={newHall.description} onChange={e => setNewHall({ ...newHall, description: e.target.value })}></textarea>

                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Please Wait...' : 'Submit for Approval'}
                            </button>
                        </form>
                    </div>
                )}

            </main>
        </div>
    )
}
