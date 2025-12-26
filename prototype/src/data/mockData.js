export const halls = [
    {
        id: 1,
        name: 'Grand Royal Convention Center',
        location: 'Bangalore, Karnataka',
        price: 150000,
        capacity: 1200,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
        amenities: ['AC', 'Parking', 'Catering', 'Decor'],
        description: 'A luxurious convention center perfect for grand weddings.'
    },
    {
        id: 2,
        name: 'Golden Pearl Banquet Hall',
        location: 'Chennai, Tamil Nadu',
        price: 85000,
        capacity: 500,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        amenities: ['AC', 'Valet Parking', 'Stage'],
        description: 'Elegant banquet hall in the heart of the city.'
    },
    {
        id: 3,
        name: 'Silver Oak Wedding Hall',
        location: 'Hyderabad, Telangana',
        price: 120000,
        capacity: 800,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        amenities: ['AC', 'Rooms', 'Generator'],
        description: 'Modern amenities with traditional aesthetics.'
    }
];

export const bookings = [
    { id: 101, hallId: 1, customer: 'Rahul Sharma', date: '2025-05-20', status: 'Confirmed', amount: 150000 },
    { id: 102, hallId: 2, customer: 'Priya Verma', date: '2025-06-15', status: 'Pending', amount: 85000 }
];
