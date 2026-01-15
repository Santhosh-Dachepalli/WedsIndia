import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Calendar, Settings, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react'
import { halls, bookings } from '../data/mockData'
import { auth, db } from '../firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore'

export default function OwnerDashboard() {
    const [myFirestoreHalls, setMyFirestoreHalls] = React.useState([])
    const [myFirestoreBookings, setMyFirestoreBookings] = React.useState([])
    const [uploading, setUploading] = useState(false)
    const [editingHall, setEditingHall] = useState(null)
    const [activeTab, setActiveTab] = useState('bookings')

    const AMENITIES_OPTIONS = [
        'Parking', 'Lift', 'Guest Rooms', 'AC', 'CCTV',
        'Power Backup', 'In-house Catering', 'Dining Hall', 'Audio System'
    ]

    // Form State for Adding/Editing Hall
    const [newHall, setNewHall] = useState({
        name: '', location: '', price: '', capacity: '', image: '', description: '',
        amenities: []
    })

    React.useEffect(() => {
        if (!auth.currentUser) return;

        const hallsQuery = query(collection(db, 'halls'), where('ownerId', '==', auth.currentUser.uid))
        const unsubscribeHalls = onSnapshot(hallsQuery, (snapshot) => {
            const hallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setMyFirestoreHalls(hallsData)
        })

        const bookingsQuery = query(collection(db, 'bookings'), where('ownerId', '==', auth.currentUser.uid))
        const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setMyFirestoreBookings(bookingsData)
        })

        return () => {
            unsubscribeHalls()
            unsubscribeBookings()
        }
    }, [auth.currentUser])

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Cloudinary Configuration
        const CLOUD_NAME = 'dvnqrhwuu';
        const UPLOAD_PRESET = 'BookMyVenue';

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            setNewHall(prev => ({ ...prev, image: data.secure_url }));
            alert('Image Uploaded Successfully!');
        } catch (error) {
            console.error("Cloudinary Upload failed:", error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    const handleAddHall = async (e) => {
        e.preventDefault()

        try {
            if (editingHall) {
                // Resubmission Logic
                const count = editingHall.resubmissionCount || 0
                if (count >= 3) {
                    alert("Maximum resubmission limit reached for this hall. Please create a new listing.")
                    return
                }

                const hallRef = doc(db, 'halls', editingHall.id)
                await updateDoc(hallRef, {
                    ...newHall,
                    status: 'Pending',
                    resubmissionCount: count + 1,
                    updatedAt: serverTimestamp()
                })
                alert('Hall Resubmitted for Admin Approval!')
            } else {
                // Initial Submission
                const hallData = {
                    ...newHall,
                    ownerId: auth.currentUser?.uid,
                    status: 'Pending',
                    rating: 0,
                    resubmissionCount: 0,
                    createdAt: serverTimestamp()
                }
                await addDoc(collection(db, 'halls'), hallData)
                alert('Hall Submitted for Admin Approval!')
            }

            setNewHall({ name: '', location: '', price: '', capacity: '', image: '', description: '', amenities: [] })
            setEditingHall(null)
            setActiveTab('halls')
        } catch (error) {
            console.error("Error submitting hall:", error)
            alert("Submission failed: " + error.message)
        }
    }

    const startEditing = (hall) => {
        setNewHall({
            name: hall.name,
            location: hall.location,
            price: hall.price,
            capacity: hall.capacity,
            image: hall.image,
            description: hall.description,
            amenities: hall.amenities || []
        })
        setEditingHall(hall)
        setActiveTab('add')
    }

    const toggleAmenity = (item) => {
        setNewHall(prev => ({
            ...prev,
            amenities: prev.amenities.includes(item)
                ? prev.amenities.filter(a => a !== item)
                : [...prev.amenities, item]
        }))
    }

    const handleBookingAction = async (id, action) => {
        try {
            const bookingRef = doc(db, 'bookings', id)
            await updateDoc(bookingRef, {
                status: action === 'accept' ? 'Confirmed' : 'Rejected'
            })
            alert(`Booking ${action === 'accept' ? 'Confirmed' : 'Rejected'} Successfully!`)
        } catch (error) {
            console.error("Error updating booking status:", error)
            alert("Action failed: " + error.message)
        }
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
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {myFirestoreBookings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontStyle: 'italic' }}>No booking requests found.</div>
                            ) : (
                                myFirestoreBookings.map(b => (
                                    <div key={b.id} className="card" style={{ padding: '2rem', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: b.status === 'Pending' ? '1px solid #dbeafe' : '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{b.userName || 'Guest User'}</h3>
                                                <div style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.9rem' }}>{b.hallName}</div>
                                            </div>
                                            <span style={{
                                                padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700,
                                                background: b.status === 'Confirmed' ? '#ecfdf5' : b.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                                                color: b.status === 'Confirmed' ? '#047857' : b.status === 'Rejected' ? '#b91c1c' : '#c2410c'
                                            }}>{b.status.toUpperCase()}</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Event Date</div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.date}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Attendees</div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.attendees} Pax</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Amount</div>
                                                <div style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(b.amount).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>

                                        {b.eventDetails && (
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Customer Notes</div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>{b.eventDetails}</p>
                                            </div>
                                        )}

                                        {b.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                <button onClick={() => handleBookingAction(b.id, 'accept')} className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>Accept Booking</button>
                                                <button onClick={() => handleBookingAction(b.id, 'reject')} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'halls' && (
                    <div className="animate-fade-in">
                        <h1 style={{ marginBottom: '2rem' }}>My Listed Halls</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {myFirestoreHalls.map((h) => (
                                <div key={h.id} className="card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: h.status === 'Rejected' ? '1px solid #fee2e2' : 'none' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={h.image || 'https://via.placeholder.com/400x200'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '12px', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                                            background: h.status === 'Approved' ? '#ecfdf5' : h.status === 'Rejected' ? '#fee2e2' : '#fff7ed',
                                            color: h.status === 'Approved' ? '#047857' : h.status === 'Rejected' ? '#b91c1c' : '#c2410c',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {h.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{h.name}</h3>
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{h.location}</p>

                                        {h.status === 'Rejected' && (
                                            <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', borderLeft: '4px solid #ef4444' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <XCircle size={14} /> REJECTION REASON:
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b' }}>{h.rejectionReason || "No reason provided."}</p>
                                                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '8px' }}>
                                                    Resubmissions: {h.resubmissionCount || 0} / 3
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>₹{Number(h.price).toLocaleString('en-IN')}</div>
                                            {h.status === 'Rejected' && (h.resubmissionCount || 0) < 3 && (
                                                <button
                                                    onClick={() => startEditing(h)}
                                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                    Edit & Resubmit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>{editingHall ? 'Edit & Resubmit Hall' : 'List New Hall'}</h1>
                            {editingHall && (
                                <button
                                    onClick={() => { setEditingHall(null); setNewHall({ name: '', location: '', price: '', capacity: '', image: '', description: '' }); }}
                                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
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
                                            <span style={{ color: '#2563eb', fontWeight: 600 }}>Uploading to Cloudinary... ⏳</span>
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

                            {/* Amenities Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: '#374151' }}>Select Amenities</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {AMENITIES_OPTIONS.map(item => {
                                        const isSelected = newHall.amenities.includes(item)
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleAmenity(item)}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    borderRadius: '50px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    border: '1px solid',
                                                    borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                                                    background: isSelected ? '#eff6ff' : 'white',
                                                    color: isSelected ? '#2563eb' : '#6b7280',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                {isSelected && <CheckCircle size={14} />}
                                                {item}
                                            </button>
                                        )
                                    })}
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
