import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Calendar, ChevronRight, Check, ShieldCheck, Zap, Users, ArrowLeft, Share2, Heart, Clock, User, Settings, LogOut, Camera, Mail, Phone } from 'lucide-react'
// import { halls, bookings } from '../data/mockData' // Commented out mock data
import { auth, storage, db } from '../firebase'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, onSnapshot } from 'firebase/firestore'
import logo from '../assets/weds_india_logo.png'

// --- 1. Main Controller ---
export default function CustomerApp() {
    return (
        <div style={{ paddingBottom: '80px' }}> {/* Space for sticky mobile nav if needed */}
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bookings" element={<MyBookings />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/hall/:id" element={<HallDetails />} />
                <Route path="/hall/:id/book" element={<BookingFlow />} />
                <Route path="/success" element={<SuccessScreen />} />
            </Routes>
        </div>
    )
}

// --- 2. Shared Components ---
const NavBar = () => (
    <nav style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f3f4f6' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
            <Link to="/customer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={logo} alt="WedsIndia" style={{ height: '40px' }} />
            </Link>

            {/* New Navigation Links */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                    <Link to="/customer?type=Wedding Hall" style={{ textDecoration: 'none', color: 'inherit' }}>Wedding Halls</Link>
                    <Link to="/customer?type=Convention Center" style={{ textDecoration: 'none', color: 'inherit' }}>Convention Centers</Link>
                    <Link to="/customer?type=Luxury Banquet" style={{ textDecoration: 'none', color: 'inherit' }}>Luxury Banquets</Link>
                </div>

                <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>

                <Link to="/customer/bookings" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
                    My Bookings
                </Link>
                <Link to="/customer/profile" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={16} /> My Profile
                </Link>
            </div>
        </div>
    </nav>
)

const HallCard = ({ hall }) => (
    <Link to={`/customer/hall/${hall.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '240px' }}>
                <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <Star size={14} fill="#f59e0b" stroke="none" /> {hall.rating}
                </div>
                {hall.price < 100000 && (
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--color-accent)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        BEST VALUE
                    </div>
                )}
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>{hall.name}</h3>
                <p style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                    <MapPin size={16} /> {hall.location}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Starting from</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{hall.price.toLocaleString()}</div>
                    </div>
                    <span style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.9rem' }}>View Details &rarr;</span>
                </div>
            </div>
        </div>
    </Link>
)

// --- 3. Home Screen ---
function Home() {
    const [halls, setHalls] = useState([]) // Data from Firestore
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch Halls from Firestore Real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'halls'), (snapshot) => {
            const hallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setHalls(hallsData)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching halls:", error)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])
    const [searchParams] = useSearchParams()
    const typeFilter = searchParams.get('type') // Get filter from URL based on NavBar click
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // City Filter State
    const [selectedCity, setSelectedCity] = useState('')
    const [detectingLoc, setDetectingLoc] = useState(false)

    // Extract Unique Cities
    const uniqueCities = [...new Set(halls.map(h => h.location.split(',')[0].trim()))].sort()

    // Filter Logic: Combine Type Filter + City Filter + Search Term
    const visibleHalls = halls.filter(hall => {
        const matchesType = typeFilter ? hall.type === typeFilter : true
        const matchesCity = selectedCity ? hall.location.includes(selectedCity) : true
        return matchesType && matchesCity
    })

    const detectLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation is not supported by your browser")

        setDetectingLoc(true)
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                const data = await response.json()
                const detectedCity = data.city || data.locality || ''

                // Find closest match in our list
                const match = uniqueCities.find(c => detectedCity.includes(c) || c.includes(detectedCity))

                if (match) {
                    setSelectedCity(match)
                } else {
                    alert(`Located you in ${detectedCity}, but we don't have venues there yet!`)
                }
            } catch (error) {
                console.error("Geo error:", error)
                alert("Failed to detect location")
            }
            setDetectingLoc(false)
        }, () => {
            alert("Unable to retrieve your location")
            setDetectingLoc(false)
        })
    }

    // Search Suggestion Logic
    useEffect(() => {
        if (searchTerm.length >= 3) {
            const matches = halls.filter(h =>
                h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredSuggestions(matches)
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }, [searchTerm])

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Venues...</div>

    return (
        <div className="animate-fade-in">
            <div style={{ background: 'linear-gradient(to bottom, #eff6ff, #fff)', padding: '4rem 0 6rem' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 1.5rem 0', color: '#1e3a8a', lineHeight: 1.1 }}>
                        Find the perfect venue for your <span style={{ color: 'var(--color-primary-light)' }}>Special Day</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', marginBottom: '3rem' }}>
                        Discover & book 1000+ trusted wedding halls, convention centers using India's most loved event platform.
                    </p>

                    <div style={{ position: 'relative', boxShadow: '0 20px 40px -10px rgba(30,58,138,0.15)', borderRadius: '50px', background: 'white', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ padding: '0 1rem', borderRight: '1px solid #eee', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '180px' }}>
                            <MapPin
                                size={20}
                                color={detectingLoc ? "#9ca3af" : "var(--color-primary)"}
                                onClick={detectLocation}
                                className={detectingLoc ? "animate-spin" : ""}
                                style={{ cursor: 'pointer' }}
                                title="Detect Current Location"
                            />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                style={{ border: 'none', outline: 'none', fontSize: '1rem', color: '#4b5563', appearance: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        <Search size={20} style={{ marginLeft: '1rem', color: '#9ca3af' }} />
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Search by name, location or vibe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1, border: 'none', outline: 'none', padding: '1rem', fontSize: '1rem', width: '100%' }}
                            />
                            {showSuggestions && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    zIndex: 50, marginTop: '10px', overflow: 'hidden', textAlign: 'left'
                                }}>
                                    {filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map(hall => (
                                            <Link
                                                key={hall.id}
                                                to={`/customer/hall/${hall.id}`}
                                                style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}
                                                onClick={() => setShowSuggestions(false)}
                                            >
                                                <div style={{ fontWeight: 600 }}>{hall.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{hall.location}</div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1rem', color: 'var(--color-text-light)' }}>No matches found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Search</button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-3rem' }}>
                {/* Removed CategoryCard Grid as per feedback */}

                <div style={{ marginTop: '3rem', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                        {typeFilter ? `${typeFilter}s` : 'Trending Venues'}
                    </h2>
                    {visibleHalls.length > 0 ? (
                        <div className="grid-auto">
                            {visibleHalls.map(hall => <HallCard key={hall.id} hall={hall} />)}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
                            <p style={{ fontSize: '1.2rem' }}>No venues found for "{typeFilter}".</p>
                            <Link to="/customer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>View All Venues</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- 3.5 My Bookings Screen ---
function MyBookings() {
    // Mock user bookings (In a real app, fetch by logged-in user ID)
    // Note: for prototype simplicity, we are using mock bookings but connecting them to the real 'halls' fetched in Home. 
    // Ideally MyBookings should also fetch 'halls' or 'bookings' from Firestore.
    // For now, let's just use static mock data for bookings for display purposes.
    const myBookings = [
        { id: 101, hall: { name: 'Grand Royal', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80', location: 'Bangalore' }, date: '2025-05-20', status: 'Confirmed', amount: 150000 },
        { id: 102, hall: { name: 'Golden Pearl', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80', location: 'Chennai' }, date: '2025-06-15', status: 'Pending', amount: 80000 }
    ]

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>My Bookings</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {myBookings.map(booking => (
                    <div key={booking.id} className="card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
                        <img src={booking.hall.image} alt="Venue" style={{ width: '120px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0 }}>{booking.hall.name}</h3>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600,
                                    background: booking.status === 'Confirmed' ? '#ecfdf5' : '#fff7ed',
                                    color: booking.status === 'Confirmed' ? '#059669' : '#ea580c'
                                }}>
                                    {booking.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={16} /> {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} /> All Day Event
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', borderLeft: '1px solid #f3f4f6', paddingLeft: '1.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Total Paid</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{booking.amount.toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link to="/customer" className="btn-primary">Book New Venue</Link>
            </div>
        </div>
    )
}

// --- 3.8 My Profile Screen ---
function MyProfile() {
    const [user, setUser] = useState(auth.currentUser || {
        displayName: 'Guest User',
        email: 'guest@example.com',
        phoneNumber: '',
        photoURL: null
    })
    const [isEditing, setIsEditing] = useState(false)
    const [newName, setNewName] = useState(user.displayName || '')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                setNewName(currentUser.displayName || '')
            }
        })
        return () => unsubscribe()
    }, [])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!auth.currentUser) return alert("Please login first")

        setUploading(true)
        try {
            const fileRef = ref(storage, `profile_images/${auth.currentUser.uid}`)
            await uploadBytes(fileRef, file)
            const photoURL = await getDownloadURL(fileRef)

            await updateProfile(auth.currentUser, { photoURL })
            setUser({ ...auth.currentUser, photoURL }) // Force re-render
            alert("Profile picture updated!")
        } catch (error) {
            console.error("Error uploading image: ", error)
            alert("Failed to upload image")
        }
        setUploading(false)
    }

    const handleSave = async () => {
        if (!auth.currentUser) return

        try {
            await updateProfile(auth.currentUser, { displayName: newName })
            setUser({ ...auth.currentUser, displayName: newName })
            setIsEditing(false)
            alert("Profile updated!")
        } catch (error) {
            console.error("Error updating profile: ", error)
            alert("Failed to update profile")
        }
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>My Profile</h1>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Profile Header */}
                <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: '#e0e7ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 700,
                            overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {uploading ? <span style={{ fontSize: '0.8rem' }}>Uploading...</span> :
                                user.photoURL ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                    (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: 0, right: 0, background: 'var(--color-primary)', color: 'white',
                            border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            <Camera size={14} />
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
                            />
                        ) : (
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user.displayName || 'User'}</h2>
                        )}
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-light)' }}>{user.email}</p>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Personal Information</h3>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setIsEditing(false)} className="btn-ghost" style={{ fontSize: '0.9rem', color: '#6b7280' }}>Cancel</button>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Save</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="btn-ghost" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Edit Name</button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><User size={20} color="#4b5563" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Full Name</div>
                                <div style={{ fontWeight: 500 }}>{user.displayName || 'Not Set'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><Mail size={20} color="#4b5563" /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Email Address</div>
                                <div style={{ fontWeight: 500 }}>{user.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><Phone size={20} color="#4b5563" /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Phone Number</div>
                                <div style={{ fontWeight: 500 }}>{user.phoneNumber || 'Not Linked'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Settings size={20} />
                            <span style={{ fontWeight: 500 }}>Account Settings</span>
                        </div>
                        <ChevronRight size={18} color="#9ca3af" />
                    </div>
                    <Link to="/" onClick={() => auth.signOut()} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#ef4444' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <LogOut size={20} />
                                <span style={{ fontWeight: 500 }}>Log Out</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// --- 4. Hall Details ---
function HallDetails() {
    const { id } = useParams()
    const [hall, setHall] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In real app, fetch specific doc: doc(db, 'halls', id)
        // For now, since we synced 'halls' in Home, we could pass it or fetch again.
        // Let's fetch the single document for best practice.
        const fetchHall = async () => {
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            try {
                const docRef = doc(db, "halls", id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setHall({ id: docSnap.id, ...docSnap.data() })
                }
            } catch (e) { console.error(e) }
            setLoading(false)
        }
        fetchHall()
    }, [id])

    if (loading) return <div>Loading...</div>
    if (!hall) return <div>Hall not found</div>

    return (
        <div className="animate-fade-in">
            {/* 4a. Image Hero */}
            <div style={{ height: '60vh', width: '100%', position: 'relative' }}>
                <img src={hall.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)' }} />

                <div className="container" style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, color: 'white' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={14} /> Verified Venue
                        </span>
                        <span style={{ background: 'rgba(245, 158, 11, 0.9)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} /> High Demand
                        </span>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', margin: 0 }}>{hall.name}</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={20} /> {hall.location}
                    </p>
                </div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                        <Share2 size={24} />
                    </button>
                    <button style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                        <Heart size={24} />
                    </button>
                </div>
            </div>

            {/* 4b. Content */}
            <div className="container" style={{ padding: '4rem 1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>About this venue</h2>
                    <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#4b5563' }}>{hall.description}</p>

                    <h3 style={{ marginTop: '3rem' }}>Amenities</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {hall.amenities.map(a => (
                            <div key={a} style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                                <Check size={18} color="var(--color-primary)" /> {a}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '2rem', background: '#f0f9ff', borderRadius: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                        <h3 style={{ margin: 0, color: '#075985' }}>Social Proof</h3>
                        <p style={{ margin: '0.5rem 0', color: '#0c4a6e' }}>
                            <strong>34 couples</strong> booked this venue in the last month. Rated <strong>4.8/5</strong> by 120+ reviews.
                        </p>
                    </div>
                </div>

                {/* Sticky Sidebar */}
                <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div className="card" style={{ padding: '2rem', border: '1px solid #dbeafe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Price per day</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{hall.price.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                                Only 2 dates left<br />in Dec!
                            </div>
                        </div>

                        <Link to={`/customer/hall/${id}/book`} className="btn-accent" style={{ width: '100%', padding: '1.25rem' }}>
                            Check Availability
                        </Link>
                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <ShieldCheck size={14} /> 100% Secure Payment
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="sticky-cta" style={{ display: 'none' }}> {/* Hidden by default, show in media query in CSS */}
                <div>
                    <div style={{ fontSize: '0.8rem' }}>Total</div>
                    <div style={{ fontWeight: 700 }}>₹{hall.price.toLocaleString()}</div>
                </div>
                <Link to={`/customer/hall/${id}/book`} className="btn-accent">Book Now</Link>
            </div>
        </div>
    )
}

// --- 5. Booking Flow ---
function BookingFlow() {
    const { id } = useParams()
    const [hall, setHall] = useState(null)

    // Quick fetch for booking flow
    useEffect(() => {
        const fetchHall = async () => {
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            const docRef = doc(db, "halls", id)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) setHall({ id: docSnap.id, ...docSnap.data() })
        }
        fetchHall()
    }, [id])

    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [date, setDate] = useState('')
    const [error, setError] = useState('')

    // Check Availability on Date Change
    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date)
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

            const isBooked = bookings.some(b =>
                b.hallId === parseInt(id) &&
                b.date === date &&
                ['Confirmed', 'Pending'].includes(b.status)
            )

            if (selectedDate < today) {
                setError('⚠️ You cannot book a date in the past. Please select a future date.')
            } else if (isBooked) {
                setError('⚠️ This date is already booked by another user. Please choose another date.')
            } else {
                setError('')
            }
        }
    }, [date, id])

    const handleNext = (e) => {
        e.preventDefault()
        if (error) return // Block progress if error exists

        if (step === 2) {
            // Processing payment...
            // In a real app, we would POST to backend here to create the booking
            // For prototype, we just navigate to success
            setTimeout(() => navigate('/customer/success'), 1500)
        } else {
            setStep(step + 1)
        }
    }

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#e5e7eb', zIndex: 0 }} />
                {[1, 2, 3].map(s => (
                    <div key={s} style={{
                        width: '40px', height: '40px', borderRadius: '50%', background: step >= s ? 'var(--color-primary)' : 'white', border: '2px solid var(--color-primary)',
                        color: step >= s ? 'white' : 'var(--color-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1
                    }}>
                        {s}
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '3rem' }}>
                <h2 style={{ marginTop: 0, textAlign: 'center', marginBottom: '2rem' }}>
                    {step === 1 ? 'Your Details' : step === 2 ? 'Secure Payment' : 'Confirmation'}
                </h2>

                <form onSubmit={handleNext}>
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Select Wedding Date</label>
                            <input
                                type="date"
                                required
                                className="card"
                                style={{ width: '100%', padding: '1rem', border: error ? '2px solid #ef4444' : '1px solid #ddd', marginBottom: '0.5rem' }}
                                onChange={e => setDate(e.target.value)}
                            />
                            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: 0, marginBottom: '2rem', fontWeight: 600 }}>{error}</p>}
                            {!error && <div style={{ marginBottom: '2rem' }}></div>}

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                            <input type="text" placeholder="e.g. Rahul & Priya" required className="card" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', marginBottom: '2rem' }} />

                            <button type="submit" className="btn-primary" style={{ width: '100%', opacity: error ? 0.5 : 1, cursor: error ? 'not-allowed' : 'pointer' }} disabled={!!error}>
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Amount</span>
                                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>₹{hall?.price?.toLocaleString()}</span>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Pay With</label>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {/* UPI Option */}
                                    <label style={{ cursor: 'pointer', border: '2px solid var(--color-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f0f9ff' }}>
                                        <input type="radio" name="payment" defaultChecked style={{ width: '20px', height: '20px' }} />
                                        <span style={{ fontWeight: 700 }}>UPI (GooglePay / PhonePe)</span>
                                        <span style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>FASTEST</span>
                                    </label>

                                    {/* COD Option */}
                                    <label style={{ cursor: 'pointer', border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white' }}>
                                        <input type="radio" name="payment" style={{ width: '20px', height: '20px' }} />
                                        <span style={{ fontWeight: 700 }}>Pay at Venue (Cash/Card)</span>
                                        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.8rem' }}>20% Advance required</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-accent" style={{ width: '100%' }}>Confirm Booking</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

function SuccessScreen() {
    return (
        <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }}>
            <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--color-primary)' }}>Booking Confirmed!</h1>
            <p style={{ fontSize: '1.5rem', color: '#6b7280', maxWidth: '600px', margin: '1rem auto 3rem' }}>
                Congratulations! Your venue for <strong>{new Date().toDateString()}</strong> is officially secured.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/customer" className="btn-primary">Go to My Bookings</Link>
                <button className="btn-secondary" style={{ background: 'white', border: '1px solid #ccc', padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer' }}>Download Invoice</button>
            </div>
        </div>
    )
}
