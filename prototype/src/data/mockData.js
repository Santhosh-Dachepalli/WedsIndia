export const halls = [
    {
        id: 1,
        name: 'Grand Royal Convention Center',
        location: 'Bangalore, Karnataka',
        price: 150000,
        capacity: 1200,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
        amenities: ['AC', 'Parking', 'Catering', 'Decor', '2 Rooms'],
        description: 'A luxurious hall perfect for grand weddings and receptions. Located in the heart of the city with ample parking.',
        contactPhone: '+91 98480 12345',
        contactEmail: 'bookings@grandconvention.com'
    },
    {
        id: 2,
        name: 'Golden Pearl Banquet Hall',
        location: 'Chennai, Tamil Nadu',
        price: 80000,
        capacity: 500,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
        amenities: ['Non-AC', 'Open Lawn', 'Basic Decor', 'Stage'],
        description: 'An affordable open lawn venue suitable for evening receptions and parties.',
        contactPhone: '+91 88888 77777',
        contactEmail: 'contact@sunshinelawns.in'
    },
    {
        id: 3,
        name: 'Silver Oak Wedding Hall',
        location: 'Hyderabad, Telangana',
        price: 250000,
        capacity: 800,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
        amenities: ['AC', 'Valet Parking', 'Premium Catering', 'Live Music', 'Bridal Suite'],
        description: 'Heritage royal architecture with modern amenities. The best destination for a royal wedding experience.',
        contactPhone: '+91 99000 54321',
        contactEmail: 'sales@royalpalace.com'
    }
];

export const bookings = [
    { id: 101, hallId: 1, customer: 'Rahul Sharma', date: '2025-05-20', status: 'Confirmed', amount: 150000 },
    { id: 102, hallId: 2, customer: 'Priya Verma', date: '2025-06-15', status: 'Pending', amount: 85000 }
];
