-- Database Schema for India Wedding Hall Booking App

-- 1. USERS TABLE (Customers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL, -- India format +91
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. OWNERS TABLE
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    gst_number VARCHAR(20),
    bank_account_number VARCHAR(30),
    ifsc_code VARCHAR(15),
    is_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HALLS TABLE
CREATE TABLE halls (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka', -- Defaulting but changeable
    pincode VARCHAR(10) NOT NULL,
    capacity_min INTEGER NOT NULL,
    capacity_max INTEGER NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    amenities JSONB, -- list of strings: ["AC", "Parking", "Catering"]
    images TEXT[], -- Array of image URLs
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval required
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS TABLE
-- Handling Concurrency: We will use a separate 'availability_locks' table or logic.
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    hall_id INTEGER REFERENCES halls(id),
    user_id INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'PENDING' CHECK (booking_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED')),
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_overlap EXCLUDE USING gp ( -- Requires PostGIS or just app level logic 
        -- Simplified uniqueness constraint for same hall same date
        hall_id WITH =, 
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (booking_status = 'CONFIRMED')
);

-- 5. PAYMENTS TABLE
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI', -- UPI / CARD / NETBANKING
    transaction_reference_id VARCHAR(100) NOT NULL, -- UPI Ref ID
    payment_gateway_id VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. AVAILABILITY LOCKS (Redis replacement for SQL-only systems)
-- Used to hold a date for 10 minutes while user pays
CREATE TABLE availability_locks (
    id SERIAL PRIMARY KEY,
    hall_id INTEGER NOT NULL,
    date DATE NOT NULL,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    user_id INTEGER NOT NULL
);

-- 7. REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
