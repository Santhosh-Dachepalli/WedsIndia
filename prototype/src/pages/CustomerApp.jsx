import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Calendar, ChevronRight, Check, ShieldCheck, Zap, Users, ArrowLeft, Share2, Heart, Clock, User, Settings, LogOut, Camera, Mail, Phone, X, Locate, Trash2, Menu } from 'lucide-react'
import { bookings } from '../data/mockData' // Keeping bookings mock data for now to prevent crash
import { auth, storage, db } from '../firebase'
import { onAuthStateChanged, updateProfile, deleteUser } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, onSnapshot, addDoc, Timestamp, query, where, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import logo from '../assets/bookmyvenue_logo.png'
import icon from '../assets/bookmyvenue_icon_final.png' // User specified logo

// --- 1. Main Controller ---
export default function CustomerApp() {
    return (
        <div style={{ paddingBottom: '80px' }}> {/* Space for sticky mobile nav if needed */}
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bookings" element={<MyBookings />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/hall/:id" element={<HallDetails />} />
                <Route path="/hall/:id/book" element={<BookingFlow />} />
                <Route path="/success" element={<SuccessScreen />} />
            </Routes>
        </div>
    )
}

// --- 1.5 Custom Hooks ---
function useWishlist() {
    const [wishlist, setWishlist] = useState([])
    const [user, setUser] = useState(auth.currentUser)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribeAuth()
    }, [])

    useEffect(() => {
        if (!user) {
            setWishlist([])
            return
        }

        // Real-time listener for user's wishlist
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setWishlist(doc.data().wishlist || [])
            } else {
                setWishlist([])
            }
        })
        return () => unsubscribe()
    }, [user])

    const toggleWishlist = async (hallId) => {
        if (!user) return alert("Please login to save venues!")

        const userRef = doc(db, 'users', user.uid)
        const isWishlisted = wishlist.includes(hallId)

        try {
            await setDoc(userRef, {
                wishlist: isWishlisted ? arrayRemove(hallId) : arrayUnion(hallId)
            }, { merge: true })
        } catch (error) {
            console.error("Error updating wishlist:", error)
            alert("Failed to update wishlist")
        }
    }

    return { wishlist, toggleWishlist }
}

// --- 2. Shared Components ---


const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f3f4f6' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/customer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={icon} alt="BookMyVenue" style={{ height: '40px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e3a8a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
                            Book<span style={{ color: '#f59e0b' }}>My</span>Venue
                        </span>
                    </Link>
                </div>

                {/* DESKTOP NAVIGATION */}
                <div className="desktop-nav" style={{ gap: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                        <Link to="/customer?type=Wedding Hall" style={{ textDecoration: 'none', color: 'inherit' }}>Wedding Halls</Link>
                        <Link to="/customer?type=Convention Center" style={{ textDecoration: 'none', color: 'inherit' }}>Convention Centers</Link>
                        <Link to="/customer?type=Luxury Banquet" style={{ textDecoration: 'none', color: 'inherit' }}>Luxury Banquets</Link>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>

                    <Link to="/customer/bookings" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
                        My Bookings
                    </Link>
                    <Link to="/customer/wishlist" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={18} /> Wishlist
                    </Link>
                    <Link to="/customer/profile" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={16} /> My Profile
                    </Link>
                </div>

                {/* MOBILE HAMBURGER */}
                <div className="mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} color="#1f2937" /> : <Menu size={24} color="#1f2937" />}
                </div>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/customer?type=Wedding Hall" style={{ textDecoration: 'none', color: '#374151', padding: '0.5rem', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>
                            Wedding Halls
                        </Link>
                        <Link to="/customer?type=Convention Center" style={{ textDecoration: 'none', color: '#374151', padding: '0.5rem', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>
                            Convention Centers
                        </Link>
                        <Link to="/customer?type=Luxury Banquet" style={{ textDecoration: 'none', color: '#374151', padding: '0.5rem', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>
                            Luxury Banquets
                        </Link>

                        <div style={{ height: '1px', background: '#f3f4f6', margin: '0.5rem 0' }}></div>

                        <Link to="/customer/bookings" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600, padding: '0.5rem' }} onClick={() => setIsMenuOpen(false)}>
                            My Bookings
                        </Link>
                        <Link to="/customer/wishlist" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600, padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsMenuOpen(false)}>
                            <Heart size={18} /> Wishlist
                        </Link>
                        <Link to="/customer/profile" style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsMenuOpen(false)}>
                            <User size={18} /> My Profile
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

const HallCard = ({ hall }) => {
    const { wishlist, toggleWishlist } = useWishlist()
    const isWishlisted = wishlist.includes(hall.id)

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'relative', height: '240px' }}>
                <Link to={`/customer/hall/${hall.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                    <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                {/* Rating Badge (New Tag) -> Top Left */}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '8px' }}>
                    <div style={{ background: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Star size={14} fill="#f59e0b" stroke="none" /> {hall.rating || 'New'}
                    </div>
                </div>

                {/* Wishlist Heart -> Top Right */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(hall.id); }}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'white', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10
                    }}
                >
                    <Heart size={18} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#9ca3af"} />
                </button>

                {/* Best Value -> Bottom Right */}
                {hall.price < 100000 && (
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'var(--color-accent)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        BEST VALUE
                    </div>
                )}
            </div>
            <Link to={`/customer/hall/${hall.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
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
            </Link>
        </div>
    )
}

// --- 3. Home Screen ---
const CitySelectionModal = ({ onClose, uniqueCities, onSelectCity, onDetectLocation }) => {
    const popularCities = [
        { name: 'Mumbai', code: 'MUM' },
        { name: 'Delhi-NCR', code: 'DEL' },
        { name: 'Bengaluru', code: 'BLR' },
        { name: 'Hyderabad', code: 'HYD' },
        { name: 'Chandigarh', code: 'CHD' },
        { name: 'Ahmedabad', code: 'AMD' },
        { name: 'Pune', code: 'PUN' },
        { name: 'Chennai', code: 'CHE' },
        { name: 'Kolkata', code: 'CCU' },
        { name: 'Kochi', code: 'COK' },
    ];

    const [filter, setFilter] = useState('');

    // Close on click outside (using a transparent overlay or event listener - simplifying here with an overlay for safety)
    return (
        <React.Fragment>
            {/* Transparent overlay to handle close on click outside */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={onClose} />

            <div className="animate-fade-in city-dropdown" onClick={e => e.stopPropagation()}>

                {/* Header / Search */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                        <Search color="#9ca3af" size={16} />
                        <input
                            type="text"
                            placeholder="Type to search city..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            autoFocus
                            style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1, background: 'transparent', color: '#374151' }}
                        />
                        {filter && <X size={16} color="#9ca3af" style={{ cursor: 'pointer' }} onClick={() => setFilter('')} />}
                    </div>

                    <div
                        onClick={() => { onDetectLocation(); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', fontSize: '0.9rem', opacity: onDetectLocation.isLoading ? 0.7 : 1 }}
                    >
                        <Locate size={16} className={onDetectLocation.isLoading ? "animate-spin" : ""} />
                        <span>{onDetectLocation.isLoading ? "Detecting..." : "Detect my location"}</span>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Popular Cities */}
                    {!filter && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Popular Cities</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {popularCities.map(city => (
                                    <div key={city.name} onClick={() => { onSelectCity(city.name); onClose(); }} style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontSize: '0.8rem', fontWeight: 600, color: '#374151', transition: 'all 0.2s' }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                                        >
                                            {city.code}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{city.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Cities */}
                    <div>
                        <h3 style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{filter ? 'Results' : 'All Cities'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'left' }}>
                            {uniqueCities
                                .filter(c => c.toLowerCase().includes(filter.toLowerCase()))
                                .map(c => (
                                    <div key={c} onClick={() => { onSelectCity(c); onClose(); }} style={{ cursor: 'pointer', color: '#374151', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {c}
                                    </div>
                                ))}
                            {uniqueCities.filter(c => c.toLowerCase().includes(filter.toLowerCase())).length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '1rem', fontSize: '0.9rem' }}>
                                    No cities found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

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
    const [showCityModal, setShowCityModal] = useState(false)

    // Extract Unique Cities
    const uniqueCities = [...new Set(halls.map(h => h.location.split(',')[0].trim()))].sort()

    // Filter Logic: Combine Type Filter + City Filter + Search Term
    const visibleHalls = halls.filter(hall => {
        const matchesType = typeFilter ? hall.type === typeFilter : true
        const matchesCity = selectedCity ? hall.location.includes(selectedCity) : true
        const isApproved = hall.status === 'Approved'
        return matchesType && matchesCity && isApproved
    })

    const detectLocation = async () => {
        if (!navigator.geolocation) {
            return fallbackIPLocation()
        }

        setDetectingLoc(true)

        const handleSuccess = (detectedCity) => {
            const match = uniqueCities.find(c =>
                detectedCity.toLowerCase().includes(c.toLowerCase()) ||
                c.toLowerCase().includes(detectedCity.toLowerCase())
            )
            if (match) {
                setSelectedCity(match)
                setShowCityModal(false)
            } else {
                alert(`Located you in ${detectedCity}, but we don't have venues there yet!`)
            }
            setDetectingLoc(false)
        }

        const fallbackIPLocation = async () => {
            try {
                const response = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en')
                const data = await response.json()
                const city = data.city || data.locality || data.principalSubdivision || ''
                if (city) {
                    handleSuccess(city)
                } else {
                    alert("Could not detect location via IP either. Please select manually.")
                    setDetectingLoc(false)
                }
            } catch (err) {
                console.error("IP fallback error:", err)
                alert("Failed to detect location. Please select manually.")
                setDetectingLoc(false)
            }
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                const data = await response.json()
                const detectedCity = data.city || data.locality || data.principalSubdivision || ''

                if (detectedCity) handleSuccess(detectedCity)
                else fallbackIPLocation()
            } catch (error) {
                console.error("Geo fetch error:", error)
                fallbackIPLocation()
            }
        }, (err) => {
            console.warn("Geolocation failed, falling back to IP:", err.message)
            fallbackIPLocation()
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })
    }
    // Add property for UI to access
    detectLocation.isLoading = detectingLoc

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

                    <div className="search-bar-container">
                        <div
                            className="search-location-divider"
                            style={{ padding: '0 1rem', borderRight: '1px solid #e5e7eb', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative' }}
                            onClick={() => setShowCityModal(!showCityModal)}
                        >
                            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px' }}>
                                <MapPin size={20} color={selectedCity ? "var(--color-primary)" : "#6b7280"} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                                <div style={{ fontSize: '0.95rem', color: '#1f2937', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {selectedCity || 'All Cities'} <ChevronRight size={14} style={{ rotate: showCityModal ? '270deg' : '90deg', transition: 'all 0.2s', color: '#9ca3af' }} />
                                </div>
                            </div>

                            {/* Dropdown rendered here */}
                            {showCityModal && (
                                <div style={{ cursor: 'default' }} onClick={e => e.stopPropagation()}>
                                    <CitySelectionModal
                                        onClose={() => setShowCityModal(false)}
                                        uniqueCities={uniqueCities}
                                        onSelectCity={setSelectedCity}
                                        onDetectLocation={detectLocation}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                            <Search size={20} style={{ color: '#9ca3af' }} />
                        </div>

                        <div style={{ position: 'relative', flex: 1, marginRight: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search by name, location or vibe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1, border: 'none', outline: 'none', padding: '0.75rem', fontSize: '1rem', width: '100%', color: '#374151', background: 'transparent' }}
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


            <div className="container" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
                <div style={{ marginTop: '3rem' }}>
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
    const [myBookings, setMyBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userId = auth.currentUser?.uid
        if (!userId) {
            setLoading(false)
            return
        }

        const q = query(collection(db, 'bookings'), where('userId', '==', userId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            // Sort by latest first (client-side sort for simplicity)
            bookingsData.sort((a, b) => b.timestamp - a.timestamp)
            setMyBookings(bookingsData)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching bookings:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Bookings...</div>

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>My Bookings</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {myBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>You have no bookings yet.</div>
                ) : (
                    myBookings.map(booking => (
                        <div key={booking.id} className="card booking-card">
                            <img src={booking.hallImage} alt="Venue" style={{ width: '120px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0 }}>{booking.hallName}</h3>
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
                                        <Calendar size={16} /> {new Date(booking.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                    ))
                )}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link to="/customer" className="btn-primary">Book New Venue</Link>
            </div>
        </div>
    )
}

// --- 3.6 Wishlist Page ---
function WishlistPage() {
    const { wishlist } = useWishlist()
    const [wishlistHalls, setWishlistHalls] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchWishlist = async () => {
            // If wishlist empty, don't fetch
            if (wishlist.length === 0) {
                setWishlistHalls([])
                return
            }
            setLoading(true)
            try {
                // Fetch each hall document
                const promises = wishlist.map(id => getDoc(doc(db, 'halls', id)))
                const docs = await Promise.all(promises)
                const halls = docs.map(d => d.exists() ? { id: d.id, ...d.data() } : null).filter(h => h)
                setWishlistHalls(halls)
            } catch (err) {
                console.error("Error fetching wishlist:", err)
            }
            setLoading(false)
        }
        fetchWishlist()
    }, [wishlist])

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heart size={36} fill="#ef4444" color="#ef4444" /> My Wishlist
            </h1>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your favorites...</div>
            ) : wishlistHalls.length > 0 ? (
                <div className="grid-auto">
                    {wishlistHalls.map(hall => (
                        <HallCard key={hall.id} hall={hall} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <Heart size={48} color="#e5e7eb" fill="#f3f4f6" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
                    <p style={{ marginBottom: '2rem' }}>Save venues you like to compare fast.</p>
                    <Link to="/customer" className="btn-primary">Explore Venues</Link>
                </div>
            )}
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
    const [newPhone, setNewPhone] = useState(user.phoneNumber || '')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                setNewName(currentUser.displayName || '')
                // Try to fetch specific user data from Firestore if exists
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
                    if (userDoc.exists()) {
                        const data = userDoc.data()
                        if (data.phoneNumber) setNewPhone(data.phoneNumber)
                        // Sync local state if different
                        if (data.phoneNumber !== currentUser.phoneNumber) {
                            // We can't easily update Auth phoneNumber without SMS verification, so we use Firestore
                            setUser(prev => ({ ...prev, phoneNumber: data.phoneNumber }))
                        }
                    }
                } catch (e) { console.error("Error fetching user details", e) }
            }
        })
        return () => unsubscribe()
    }, [])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!auth.currentUser) return alert("Please login first")

        if (file.size > 5 * 1024 * 1024) return alert("File is too large. Max 5MB.")
        if (!file.type.startsWith('image/')) return alert("Invalid image file.")

        setUploading(true)
        try {
            console.log("Starting Cloudinary upload...", file.name)

            // Cloudinary Config (Same as OwnerDashboard)
            const CLOUD_NAME = 'dvnqrhwuu'
            const UPLOAD_PRESET = 'BookMyVenue'

            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', UPLOAD_PRESET)

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Upload failed')
            }

            const data = await response.json()
            const photoURL = data.secure_url
            console.log("Cloudinary Upload Success:", photoURL)

            await updateProfile(auth.currentUser, { photoURL })
            setUser({ ...auth.currentUser, photoURL })
            alert("Profile picture updated successfully via Cloud!")
        } catch (error) {
            console.error("Error uploading:", error)
            alert(`Failed to upload image. ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!auth.currentUser) return

        try {
            // Update Auth Profile (Display Name)
            if (newName !== user.displayName) {
                await updateProfile(auth.currentUser, { displayName: newName })
            }

            // Save Phone to Firestore (since Auth Phone requires intricate verification)
            // We'll also save the name there for consistency
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                displayName: newName,
                phoneNumber: newPhone,
                email: user.email,
                lastUpdated: Timestamp.now()
            }, { merge: true })

            setUser(prev => ({ ...prev, displayName: newName, phoneNumber: newPhone }))
            setIsEditing(false)
            alert("Profile updated!")
        } catch (error) {
            console.error("Error updating profile: ", error)
            alert("Failed to update profile")
        }
    }

    const handleDeleteProfile = async () => {
        if (!auth.currentUser) return

        const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")
        if (!confirmDelete) return

        try {
            // Optional: Delete user data from Firestore
            await deleteDoc(doc(db, "users", auth.currentUser.uid))
            // Delete Auth User
            await deleteUser(auth.currentUser)
            alert("Your profile has been deleted.")
            // Auth state change will handle redirect roughly, or:
            window.location.href = "/"
        } catch (error) {
            console.error("Error deleting profile:", error)
            alert("Failed to delete profile. You may need to re-login recently to perform this action.")
        }
    }

    // Helper to extract initials
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>My Profile</h1>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Profile Header (Read-Only) */}
                <div className="card profile-header" style={{ padding: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: '#e0e7ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 700,
                            overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {uploading ? <span style={{ fontSize: '0.8rem' }}>Uploading...</span> :
                                user.photoURL ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                    getInitials(user.displayName)}
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
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user.displayName || 'Guest User'}</h2>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-light)' }}>{user.email}</p>
                    </div>
                </div>

                {/* Personal Information (Editable) */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Personal Information</h3>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setIsEditing(false)} className="btn-ghost" style={{ fontSize: '0.9rem', color: '#6b7280' }}>Cancel</button>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Save Changes</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="btn-ghost" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', border: '1px solid var(--color-primary)' }}>Edit Details</button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Name Field */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><User size={20} color="#4b5563" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Full Name</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                                    />
                                ) : (
                                    <div style={{ fontWeight: 500 }}>{user.displayName || 'Not Set'}</div>
                                )}
                            </div>
                        </div>

                        {/* Email Field (Read Only) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><Mail size={20} color="#4b5563" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Email Address</div>
                                <div style={{ fontWeight: 500, color: '#6b7280' }}>{user.email} <span style={{ fontSize: '0.75rem', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Read-only</span></div>
                            </div>
                        </div>

                        {/* Phone Field (Editable) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '12px' }}><Phone size={20} color="#4b5563" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>Phone Number</div>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={newPhone}
                                        onChange={e => setNewPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                                    />
                                ) : (
                                    <div style={{ fontWeight: 500 }}>{newPhone || 'Not Linked'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Actions */}
                <div className="card" style={{ padding: '0' }}>
                    <Link to="/" onClick={() => auth.signOut()} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#4b5563' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <LogOut size={20} />
                                <span style={{ fontWeight: 500 }}>Log Out</span>
                            </div>
                            <ChevronRight size={18} color="#9ca3af" />
                        </div>
                    </Link>

                    {/* Delete Profile (Danger Zone) */}
                    <div onClick={handleDeleteProfile} style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#ef4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Trash2 size={20} />
                            <span style={{ fontWeight: 500 }}>Delete Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- 4. Hall Details ---

const ReviewSection = ({ hallId }) => {
    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(5)
    // Labels for each star
    const ratingLabels = {
        1: "Terrible",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent"
    }
    const [comment, setComment] = useState('')
    const [user, setUser] = useState(auth.currentUser)

    // Edit Mode State
    const [userReviewId, setUserReviewId] = useState(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const q = query(collection(db, 'reviews'), where('hallId', '==', hallId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            reviewsData.sort((a, b) => new Date(b.date) - new Date(a.date))
            setReviews(reviewsData)
        })
        return () => unsubscribe()
    }, [hallId])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u)
        })
        return () => unsub()
    }, [])

    // Check if user already has a review
    useEffect(() => {
        if (user && reviews.length > 0) {
            const myReview = reviews.find(r => r.userId === user.uid)
            if (myReview) {
                setUserReviewId(myReview.id)
                // If we are not currently editing, set the inputs to my existing review
                if (!isEditing) {
                    // Optional: Don't auto-fill unless editing is clicked, logic handled in handleEditClick
                }
            } else {
                setUserReviewId(null)
            }
        }
    }, [user, reviews, isEditing])

    const handleEditClick = () => {
        const myReview = reviews.find(r => r.id === userReviewId)
        if (myReview) {
            setRating(myReview.rating)
            setComment(myReview.comment)
            setIsEditing(true)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return alert("Please login to leave a review")

        try {
            if (isEditing && userReviewId) {
                // Update existing review
                const reviewRef = doc(db, 'reviews', userReviewId)
                await updateDoc(reviewRef, {
                    rating: Number(rating),
                    comment,
                    date: new Date().toISOString(), // Update date or keep original? usually update "edited at" but for now update main date
                })
                alert("Review updated!")
                setIsEditing(false)
            } else {
                // Create new review
                await addDoc(collection(db, 'reviews'), {
                    hallId,
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    rating: Number(rating),
                    comment,
                    date: new Date().toISOString()
                })
                alert("Review submitted!")
            }

            // Sync Hall Rating (Basic aggregation)
            const hallRef = doc(db, 'halls', hallId)
            const hallDoc = await getDoc(hallRef)
            if (hallDoc.exists()) {
                const data = hallDoc.data()
                // Fetch all reviews fresh to be accurate
                // (In pro app use Cloud Functions triggers)
                // We'll trust the current `reviews` state roughly, but best to query db or just increment.
                // Re-calculating average from client-side list + new one for simplicity in prototype
                // Wait a moment for snapshot update or just fetch collection count? 
                // Let's rely on basic increment logic for ADD, but for EDIT it's harder without recount.
                // Simple Re-calc:
                /* 
                   LIMITATION: This client-side recalc relies on having all reviews loaded.
                   For <100 reviews it's fine.
                */
                // We need the latest list including the one just added/edited.
                // Since snapshot is async, we might not have it yet.
                // Better approach: just update the reviews collection, and let a hypothetical backend function handle it.
                // For this prototype, we'll try to update the aggregate if possible, but edit makes it tricky.
                // Let's skip aggregate update on Edit to avoid complexity bugs, or do a full fetch.
            }

            if (!isEditing) {
                setComment('')
                setRating(5)
            }
        } catch (error) {
            console.error("Error submitting review:", error)
            alert("Failed to submit review")
        }
    }

    return (
        <div style={{ marginTop: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Reviews & Ratings</h2>

            {/* Reviews List */}
            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>{review.userName}</span>
                                    {user && user.uid === review.userId && (
                                        <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>
                                    )}
                                </div>
                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "#e5e7eb"} stroke="none" />
                                ))}
                            </div>
                            <p style={{ margin: 0, color: '#4b5563' }}>{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No reviews yet. Be the first!</div>
                )}
            </div>

            {/* Add/Edit Review Form */}
            <div className="card" style={{ padding: '2rem' }}>
                {userReviewId && !isEditing ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderRadius: '16px', border: '1px solid #dbeafe', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ background: '#dbeafe', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Star size={24} fill="#2563eb" color="#2563eb" />
                        </div>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e3a8a' }}>You've reviewed this venue</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Thanks for sharing your experience!</p>

                        <button
                            onClick={handleEditClick}
                            style={{
                                background: 'white', border: '1px solid #2563eb', color: '#2563eb',
                                padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            Edit My Review
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating: <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{ratingLabels[rating]}</span></label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer', padding: 0
                                            }}
                                        >
                                            <Star
                                                size={32}
                                                fill={star <= rating ? "#f59e0b" : "#e5e7eb"}
                                                stroke={star <= rating ? "none" : "#9ca3af"}
                                                strokeWidth={1}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Experience</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Share your details..."
                                    required
                                    rows="4"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update Review' : 'Submit Review'}</button>
                                {isEditing && (
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost" style={{ color: '#6b7280' }}>Cancel</button>
                                )}
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

function HallDetails() {
    const { id } = useParams()
    const [hall, setHall] = useState(null)
    const [loading, setLoading] = useState(true)
    const { wishlist, toggleWishlist } = useWishlist() // Hook usage

    useEffect(() => {
        // In real app, fetch specific doc: doc(db, 'halls', id)
        // For now, since we synced 'halls' in Home, we could pass it or fetch again.
        // Let's fetch the single document for best practice.
        const fetchHall = async () => {
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            try {
                // Subscribe to real-time updates for rating changes
                const unsub = onSnapshot(doc(db, "halls", id), (docSnap) => {
                    if (docSnap.exists()) {
                        setHall({ id: docSnap.id, ...docSnap.data() })
                    }
                    setLoading(false)
                })
                return () => unsub() // Store this unsubscribe differently if possible, 
                // but for now simple fetch is safer to avoid hook complexity if I missed refs.
                // Let's stick to simple snapshot inside useEffect.
            } catch (e) { console.error(e); setLoading(false); }
        }

        // Actually simpler:
        const unsubscribe = onSnapshot(doc(db, 'halls', id), (doc) => {
            if (doc.exists()) {
                setHall({ id: doc.id, ...doc.data() })
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [id])

    if (loading) return <div>Loading...</div>
    if (!hall) return <div>Hall not found</div>

    const isWishlisted = wishlist.includes(hall.id)

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
                    <button
                        onClick={() => toggleWishlist(hall.id)}
                        style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Heart size={24} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#1f2937"} />
                    </button>
                </div>
            </div>

            {/* 4b. Content */}
            <div className="container grid-details" style={{ padding: '4rem 1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>About this venue</h2>
                    <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#4b5563' }}>{hall.description}</p>

                    <h3 style={{ marginTop: '3rem' }}>Amenities</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {(hall.amenities || []).length > 0 ? (
                            hall.amenities.map(a => (
                                <div key={a} style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                                    <Check size={18} color="var(--color-primary)" /> {a}
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No standard amenities listed.</div>
                        )}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '2rem', background: '#f0f9ff', borderRadius: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                        <h3 style={{ margin: 0, color: '#075985' }}>Social Proof</h3>
                        <p style={{ margin: '0.5rem 0', color: '#0c4a6e' }}>
                            <strong>34 couples</strong> booked this venue in the last month. Rated <strong>{hall.rating || 'New'}</strong> by {hall.reviewCount || 0} reviews.
                        </p>
                    </div>

                    {/* Integrated Review Section */}
                    <ReviewSection hallId={id} />
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

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Link to={`/customer/hall/${id}/book`} className="btn-accent" style={{ padding: '0.75rem 2.5rem', borderRadius: '50px', fontSize: '1rem', width: 'auto', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Check Availability
                            </Link>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <ShieldCheck size={14} /> 100% Secure Payment
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="sticky-cta sticky-cta-mobile"> {/* Hidden by default, show in media query in CSS */}
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


    const [eventDetails, setEventDetails] = useState('')
    const [attendees, setAttendees] = useState('')
    const [error, setError] = useState('')
    const [confirmedDates, setConfirmedDates] = useState([])
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Fetch Confirmed Bookings for this Hall
    useEffect(() => {
        if (!id) return
        const q = query(collection(db, 'bookings'), where('hallId', '==', id), where('status', '==', 'Confirmed'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dates = snapshot.docs.map(doc => doc.data().date)
            setConfirmedDates(dates)
        })
        return () => unsubscribe()
    }, [id])

    // Calendar Helper Functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const days = []
        for (let i = 0; i < firstDay; i++) days.push(null) // Padding
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(year, month, d))
        }
        return days
    }

    const formatDate = (d) => {
        if (!d) return ''
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const isDateBlocked = (d) => {
        if (!d) return false
        const dateStr = formatDate(d)

        // Block Past Dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (d < today) return true

        return confirmedDates.includes(dateStr)
    }

    const getBlockingReason = (d) => {
        if (!d) return ''
        const dateStr = formatDate(d)
        if (confirmedDates.includes(dateStr)) return "This date is already secured for an event. Please choose another wonderful day!"
        if (d < new Date().setHours(0, 0, 0, 0)) return "Bummer! You can't book a date in the past."
        return ""
    }

    // Import Payment Service (Add to top imports if not dynamic)
    // For now assuming dynamic import or global function availability, 
    // but best to modify file to import it at top. 
    // Actually, I'll use dynamic import for cleaner diff or just add import statement first.
    // Let's modify the whole loop to be safe.

    // ...

    const handleNext = async (e) => {
        e.preventDefault()
        if (error) return

        if (step === 2) {
            // Step 2: Payment
            const { initializePayment } = await import('../services/paymentService')

            initializePayment({
                amount: hall.price,
                hallName: hall.name,
                userName: auth.currentUser?.displayName || 'Guest',
                userEmail: auth.currentUser?.email || 'guest@example.com',
                userPhone: auth.currentUser?.phoneNumber
            }, async (response) => {
                // Payment Success Callback
                try {
                    await addDoc(collection(db, 'bookings'), {
                        hallId: id,
                        ownerId: hall.ownerId,
                        hallName: hall.name,
                        hallImage: hall.image,
                        hallLocation: hall.location,
                        userId: auth.currentUser?.uid || 'guest',
                        userName: auth.currentUser?.displayName || 'Guest',
                        date: date,
                        eventDetails: eventDetails,
                        attendees: attendees,
                        status: 'Confirmed', // Auto-confirm on payment!
                        paymentId: response.razorpay_payment_id,
                        amount: hall.price,
                        timestamp: Timestamp.now()
                    })
                    // Navigate to success
                    navigate('/customer/success', { state: { date: date, hallName: hall.name } })
                } catch (err) {
                    console.error("DB Error after payment:", err)
                    setError("Payment successful but booking failed to save. Contact support.")
                }
            }, (error) => {
                // Payment Failure Callback
                setError("Payment Failed: " + (error.description || "Unknown error"))
            })
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
                            <label style={{ display: 'block', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Select Event Date</label>

                            {/* Custom Calendar UI */}
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>&larr; Prev</button>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>Next &rarr;</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', paddingBottom: '0.5rem' }}>{day}</div>
                                    ))}
                                    {getDaysInMonth(currentMonth).map((d, i) => {
                                        const dateStr = formatDate(d)
                                        const blocked = isDateBlocked(d)
                                        const selected = date === dateStr
                                        const reason = getBlockingReason(d)

                                        return (
                                            <div
                                                key={i}
                                                title={reason}
                                                onClick={() => !blocked && d && setDate(dateStr)}
                                                style={{
                                                    padding: '0.75rem 0',
                                                    borderRadius: '8px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    cursor: blocked || !d ? 'not-allowed' : 'pointer',
                                                    background: selected ? 'var(--color-primary)' : blocked ? '#fee2e2' : 'white',
                                                    color: selected ? 'white' : blocked ? '#ef4444' : '#1e293b',
                                                    border: selected ? '1px solid var(--color-primary)' : '1px solid #f1f5f9',
                                                    opacity: !d ? 0 : 1,
                                                    textDecoration: blocked ? 'line-through' : 'none',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                            >
                                                {d ? d.getDate() : ''}
                                                {selected && <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'white' }} />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {date && (
                                <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <Check size={16} /> Selected: {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </div>
                            )}

                            {!date && (
                                <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: 0, marginBottom: '2rem', fontWeight: 600 }}>
                                    Please select an available date for your event.
                                </p>
                            )}

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                            <input type="text" placeholder="e.g. Rahul & Priya" required className="card" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', marginBottom: '1.5rem' }} />

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Event Details</label>
                            <textarea
                                placeholder="Describe your event (theme, preferences, etc.)"
                                className="card"
                                style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', marginBottom: '1.5rem', minHeight: '100px', fontFamily: 'inherit' }}
                                value={eventDetails}
                                onChange={e => setEventDetails(e.target.value)}
                            />

                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Expected Attendees</label>
                            <input
                                type="number"
                                placeholder="e.g. 500"
                                required
                                min="1"
                                className="card"
                                style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', marginBottom: '2rem' }}
                                value={attendees}
                                onChange={e => setAttendees(e.target.value)}
                            />

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
    const location = useLocation()
    const { date, hallName } = location.state || {}

    return (
        <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }}>
            <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--color-primary)' }}>Booking Confirmed!</h1>
            <p style={{ fontSize: '1.5rem', color: '#6b7280', maxWidth: '600px', margin: '1rem auto 3rem' }}>
                Congratulations! Your venue{hallName ? ` (${hallName})` : ''} for <strong>{date ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'long' }) : 'your special day'}</strong> is officially secured.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/customer/bookings" className="btn-primary">Go to My Bookings</Link>
                <button className="btn-secondary" style={{ background: 'white', border: '1px solid #ccc', padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer' }}>Download Invoice</button>
            </div>
        </div>
    )
}
