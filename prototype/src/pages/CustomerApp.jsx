import React, { useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Calendar as CalendarIcon, CreditCard, ArrowLeft, Filter, X, Wallet, Banknote, Navigation } from 'lucide-react'
import { halls } from '../data/mockData'

// Top Indian Cities for dropdown
const CITIES = ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Kochi', 'Jaipur', 'Udaipur']

export default function CustomerApp() {
    return (
        <div style={{ minHeight: '100vh' }}>
            <nav className="navbar">
                <div className="container nav-content">
                    <Link to="/" style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
                        <span style={{ color: '#4F46E5' }}>Weds</span>
                        <span style={{ color: '#F59E0B' }}>India</span>
                    </Link>
                    <div>
                        <Link to="/customer">Venues</Link>
                        <Link to="/">Logout</Link>
                    </div>
                </div>
            </nav>
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                <Routes>
                    <Route path="/" element={<SearchScreen />} />
                    <Route path="/hall/:id" element={<HallDetails />} />
                    <Route path="/hall/:id/book" element={<BookingScreen />} />
                    <Route path="/success" element={<SuccessScreen />} />
                </Routes>
            </div>
        </div>
    )
}

function SearchScreen() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [priceRange, setPriceRange] = useState(200000)

    // Logic: Filter by Name OR Location/City
    const filteredHalls = halls.filter(h => {
        const matchesName = h.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = h.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = selectedCity ? h.location.includes(selectedCity) : true;
        const matchesPrice = h.price <= priceRange;

        return (matchesName || matchesLocation) && matchesCity && matchesPrice;
    })

    const handleUseMyLocation = () => {
        // Feature: Simulate Geolocation
        if ("geolocation" in navigator) {
            // Mocking success
            alert("📍 Located near Hyderabad, Telangana");
            setSelectedCity("Hyderabad");
        } else {
            alert("Geolocation not supported");
        }
    }

    return (
        <div>
            {/* Hero Search Section */}
            <div className="card" style={{ marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.7)', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 2rem 0', fontSize: '2rem', color: '#1F2937' }}>Find your perfect wedding venue</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>

                    {/* City Selector */}
                    <div style={{ position: 'relative' }}>
                        <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            style={{ width: '100%', paddingLeft: '3rem', appearance: 'none', cursor: 'pointer' }}
                        >
                            <option value="">Select City (All)</option>
                            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    {/* Nearby Button */}
                    <button onClick={handleUseMyLocation} className="btn-secondary" style={{ padding: '0.875rem', justifyContent: 'center' }}>
                        <Navigation size={18} /> Use Nearby
                    </button>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: 2 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                        <input
                            type="text"
                            placeholder="Search specific venue name..."
                            style={{ width: '100%', paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {showFilters && (
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '1rem', color: '#374151' }}>
                            Budget per Day: ₹{priceRange.toLocaleString('en-IN')}
                        </label>
                        <input
                            type="range"
                            min="50000"
                            max="500000"
                            step="10000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            style={{ width: '100%', height: '6px', borderRadius: '4px', accentColor: '#4F46E5', background: '#E5E7EB' }}
                        />
                    </div>
                )}
            </div>

            <h2 className="heading-gold">
                {selectedCity ? `Top Venues in ${selectedCity}` : 'Trending Across India'}
            </h2>

            <div className="grid-3">
                {filteredHalls.length > 0 ? filteredHalls.map(hall => (
                    <Link key={hall.id} to={`/customer/hall/${hall.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', height: '250px' }}>
                                <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.95)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                    <Star size={14} fill="#F59E0B" /> {hall.rating}
                                </div>
                                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={14} /> {hall.location}
                                </div>
                            </div>

                            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 700 }}>{hall.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                    {hall.amenities.slice(0, 2).map(a => (
                                        <span key={a} style={{ fontSize: '0.8rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>{a}</span>
                                    ))}
                                    {hall.amenities.length > 2 && <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>+{hall.amenities.length - 2} more</span>}
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid #F3F4F6', paddingTop: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Starting from</div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4F46E5', fontFamily: 'Outfit, sans-serif' }}>₹{hall.price.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.5)', borderRadius: '20px' }}>
                        <h3 style={{ color: '#6B7280' }}>No venues found in {selectedCity || 'this search'}.</h3>
                        <p>Try changing your filters or location.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function HallDetails() {
    const { id } = useParams()
    const hall = halls.find(h => h.id === parseInt(id))
    const [selectedDate, setSelectedDate] = useState('')

    if (!hall) return <div>Hall not found</div>

    const isDateAvailable = (date) => date !== '2025-12-31'

    return (
        <div>
            <Link to="/customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'white', fontWeight: 600, textDecoration: 'none', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '30px', backdropFilter: 'blur(4px)' }}>
                <ArrowLeft size={18} /> Back to Search
            </Link>

            <div className="card" style={{ overflow: 'hidden', padding: 0, border: 'none' }}>
                <div style={{ height: '50vh', width: '100%', position: 'relative' }}>
                    <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '3rem 2rem 2rem' }}>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '3rem', fontFamily: 'Outfit, sans-serif' }}>{hall.name}</h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', margin: '0.5rem 0 0 0' }}>
                            <MapPin size={22} color="#F59E0B" /> {hall.location}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', padding: '3rem' }}>
                    <div>
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#111' }}>About this venue</h3>
                            <p style={{ lineHeight: 1.8, color: '#4B5563', fontSize: '1.1rem' }}>{hall.description}</p>
                        </div>

                        <div>
                            <h4 style={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontWeight: 700 }}>Premium Amenities</h4>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {hall.amenities.map(a => (
                                    <span key={a} style={{ background: 'white', border: '1px solid #E5E7EB', color: '#374151', padding: '0.85rem 1.5rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Widget */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', border: '1px solid #F3F4F6' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F3F4F6' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4F46E5', fontFamily: 'Outfit, sans-serif' }}>₹{hall.price.toLocaleString('en-IN')}</span>
                                <span style={{ color: '#6B7280', fontSize: '1.1rem' }}>/ day</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>SELECT DATE</label>
                                <input
                                    type="date"
                                    style={{ width: '100%' }}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            {selectedDate && (
                                <div style={{
                                    padding: '1rem', borderRadius: '12px',
                                    background: isDateAvailable(selectedDate) ? '#ECFDF5' : '#FEF2F2',
                                    color: isDateAvailable(selectedDate) ? '#059669' : '#DC2626',
                                    fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem',
                                    border: `1px solid ${isDateAvailable(selectedDate) ? '#A7F3D0' : '#FECACA'}`
                                }}>
                                    {isDateAvailable(selectedDate) ? 'Available for Booking' : 'Fully Booked'}
                                </div>
                            )}

                            <Link
                                to={`/customer/hall/${id}/book${selectedDate ? `?date=${selectedDate}` : ''}`}
                                className="btn-primary"
                                style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '1rem', fontSize: '1.1rem', pointerEvents: !selectedDate || !isDateAvailable(selectedDate) ? 'none' : 'auto', opacity: !selectedDate || !isDateAvailable(selectedDate) ? 0.5 : 1 }}
                            >
                                Proceed to Booking
                            </Link>
                            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#6B7280' }}>
                                Safe & Secure Payment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BookingScreen() {
    const { id } = useParams()
    const hall = halls.find(h => h.id === parseInt(id))
    const navigate = useNavigate()
    const [showUpiModal, setShowUpiModal] = useState(false)
    const [paymentType, setPaymentType] = useState('advance')
    const [paymentMethod, setPaymentMethod] = useState('upi')

    const queryParams = new URLSearchParams(window.location.search)
    const dateParam = queryParams.get('date')

    const advanceAmount = hall.price * 0.20;
    const amountToPay = paymentType === 'full' ? hall.price : advanceAmount;

    const initiatePayment = (e) => {
        e.preventDefault()
        if (paymentMethod === 'cod') {
            navigate('/customer/success')
        } else {
            setShowUpiModal(true)
        }
    }

    const confirmPayment = () => {
        setTimeout(() => {
            setShowUpiModal(false)
            navigate('/customer/success')
        }, 2000)
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link to={`/customer/hall/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'white', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '30px', textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
                <ArrowLeft size={18} /> Back
            </Link>

            <div className="card" style={{ padding: '3rem' }}>
                <h2 style={{ background: 'linear-gradient(to right, #4F46E5, #9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 0, fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>
                    Confirm Booking
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    <div style={{ padding: '1.5rem', background: '#F9FAFB', borderRadius: '16px' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#111' }}>Selected Venue</h3>
                        <p style={{ margin: 0, color: '#6B7280' }}>{hall.name}</p>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#EEF2FF', borderRadius: '16px' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#4F46E5' }}>Booking Amount</h3>
                        <p style={{ margin: 0, color: '#4F46E5', fontWeight: 800 }}>₹{hall.price.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <form onSubmit={initiatePayment}>
                    {/* Same Booking Inputs as before, just kept for structure consistency */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Contact Information</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="text" placeholder="First Name" required style={{ width: '100%' }} />
                            <input type="text" placeholder="Last Name" required style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Payment Options</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div
                                onClick={() => setPaymentType('advance')}
                                style={{
                                    padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', border: '2px solid',
                                    borderColor: paymentType === 'advance' ? '#4F46E5' : '#E5E7EB',
                                    background: paymentType === 'advance' ? '#EEF2FF' : 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: paymentType === 'advance' ? '#4F46E5' : '#374151' }}>Block Date (20%)</div>
                                <div style={{ fontSize: '0.95rem', color: '#6B7280', marginTop: '0.5rem' }}>Pay ₹{advanceAmount.toLocaleString()} now</div>
                            </div>

                            <div
                                onClick={() => setPaymentType('full')}
                                style={{
                                    padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', border: '2px solid',
                                    borderColor: paymentType === 'full' ? '#4F46E5' : '#E5E7EB',
                                    background: paymentType === 'full' ? '#EEF2FF' : 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: paymentType === 'full' ? '#4F46E5' : '#374151' }}>Full Payment</div>
                                <div style={{ fontSize: '0.95rem', color: '#6B7280', marginTop: '0.5rem' }}>Pay ₹{hall.price.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Select Method</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('upi')}
                                style={{
                                    flex: 1, padding: '1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB',
                                    background: paymentMethod === 'upi' ? '#1F2937' : 'white',
                                    color: paymentMethod === 'upi' ? 'white' : '#374151',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CreditCard size={20} /> UPI / Online
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cod')}
                                style={{
                                    flex: 1, padding: '1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB',
                                    background: paymentMethod === 'cod' ? '#1F2937' : 'white',
                                    color: paymentMethod === 'cod' ? 'white' : '#374151',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Banknote size={20} /> Pay at Venue
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', fontSize: '1.1rem' }}>
                        {paymentMethod === 'cod' ? 'Confirm Booking' : `Pay ₹${amountToPay.toLocaleString('en-IN')}`}
                    </button>
                </form>
            </div>

            {/* UPI Modal (Reused) */}
            {showUpiModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ marginBottom: '1.5rem', background: '#F3F4F6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: '32px' }} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Payment Request</h3>
                        <p style={{ color: '#6B7280', margin: '0 0 2rem 0' }}>Open your UPI app/phone to approve <b>₹{amountToPay.toLocaleString('en-IN')}</b></p>

                        <div style={{ margin: '0 auto 2rem auto', width: '50px', height: '50px', borderRadius: '50%', border: '4px solid #F3F4F6', borderTopColor: '#4F46E5', animation: 'spin 1s linear infinite' }}></div>

                        <button onClick={confirmPayment} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}>
                            Simulate Payment Success
                        </button>
                        <button onClick={() => setShowUpiModal(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>Cancel Transaction</button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

function SuccessScreen() {
    return (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ width: '100px', height: '100px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.2)' }}>
                <Check size={50} color="#059669" />
            </div>
            <h1 style={{ color: '#111', fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Booking Confirmed!</h1>
            <p style={{ fontSize: '1.25rem', color: '#374151', maxWidth: '600px', margin: '0 auto 3rem', background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '12px' }}>
                Your venue has been secured. Get ready for your big day!
            </p>
            <Link to="/customer" className="btn-primary" style={{ textDecoration: 'none' }}>Return to Venues</Link>
        </div>
    )
}

import { Check } from 'lucide-react'
