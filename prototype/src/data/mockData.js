// --- Data Generators ---

const locations = [
    'New Delhi, Delhi', 'Chandigarh, Punjab', 'Ludhiana, Punjab', 'Amritsar, Punjab',
    'Lucknow, Uttar Pradesh', 'Noida, Uttar Pradesh', 'Varanasi, Uttar Pradesh',
    'Bhopal, Madhya Pradesh', 'Indore, Madhya Pradesh',
    'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Nagpur, Maharashtra',
    'Panaji, Goa', 'Margao, Goa',
    'Bangalore, Karnataka', 'Mysore, Karnataka', 'Mangalore, Karnataka',
    'Hyderabad, Telangana', 'Warangal, Telangana',
    'Visakhapatnam, Andhra Pradesh', 'Vijayawada, Andhra Pradesh',
    'Kochi, Kerala', 'Thiruvananthapuram, Kerala', 'Munnar, Kerala',
    'Chennai, Tamil Nadu', 'Coimbatore, Tamil Nadu', 'Madurai, Tamil Nadu'
];

const prefixes = ['Grand', 'Royal', 'Imperial', 'Golden', 'Silver', 'Crystal', 'Diamond', 'Heritage', 'Majestic', 'Elite', 'Prestige', 'Classic', 'Opulent', 'Regal', 'Divine', 'Bliss', 'Eternal'];
const infixes = ['Palace', 'Residency', 'Gardens', 'Banquet', 'Convention', 'Plaza', 'Suites', 'Villa', 'Mandap', 'Fort', 'View', 'Heights'];
const suffixes = ['Hall', 'Center', 'Hotel', 'Resort', 'Arena', 'Hub', 'Estate'];

const types = ['Convention Center', 'Wedding Hall', 'Luxury Banquet'];

// Unsplash Image Collection for Weddings/Venues
const images = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519225448526-72c961674389?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546709843-e35ee3e36e4e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc330e7?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1561026454-e75871239968?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=800&auto=format&fit=crop'
];

const amenitiesList = ['AC', 'Parking', 'Catering', 'Decor', 'Rooms', 'WiFi', 'Power Backup', 'DJ', 'Valet', 'Pool', 'Garden', 'Security'];

// --- Helper Functions ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomSubset = (arr, size) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
};

// --- Generate Data ---
const generateHalls = (count) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
        const type = getRandom(types);
        const location = getRandom(locations);
        const name = `${getRandom(prefixes)} ${getRandom(infixes)} ${getRandom(suffixes)}`;

        // Price logic based on type (roughly)
        let basePrice;
        if (type === 'Luxury Banquet') basePrice = getRandomInt(200000, 500000);
        else if (type === 'Convention Center') basePrice = getRandomInt(100000, 300000);
        else basePrice = getRandomInt(50000, 150000);

        // Capacity logic
        let capacity;
        if (type === 'Convention Center') capacity = getRandomInt(1000, 3000);
        else if (type === 'Wedding Hall') capacity = getRandomInt(500, 1500);
        else capacity = getRandomInt(200, 800);

        data.push({
            id: i,
            name: name,
            location: location,
            price: basePrice,
            capacity: capacity,
            rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1), // Rating between 3.5 and 5.0
            image: getRandom(images),
            amenities: getRandomSubset(amenitiesList, getRandomInt(4, 8)),
            description: `Experience the elegance of ${name}, the premier ${type} in ${location}. Perfect for your special day with world-class amenities and service.`,
            contactPhone: '+91 ' + getRandomInt(6000000000, 9999999999),
            contactEmail: `info@${name.replace(/\s+/g, '').toLowerCase()}.com`,
            type: type
        });
    }
    return data;
};

// Generate 120 halls to ensure good coverage
export const halls = generateHalls(120);

export const bookings = [
    { id: 101, hallId: 1, customer: 'Rahul Sharma', date: '2025-05-20', status: 'Confirmed', amount: 150000 },
    { id: 102, hallId: 2, customer: 'Priya Verma', date: '2025-06-15', status: 'Pending', amount: 85000 }
];
