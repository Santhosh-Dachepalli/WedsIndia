// Simulated Database
const halls = [
    {
        id: 1,
        name: 'Grand Royal Convention Center',
        location: 'Bangalore, Karnataka',
        price: 150000,
        capacity: 1200,
        amenities: ['AC', 'Parking', 'Catering', 'Decor'],
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
    },
    {
        id: 2,
        name: 'Golden Pearl Banquet Hall',
        location: 'Chennai, Tamil Nadu',
        price: 85000,
        capacity: 500,
        amenities: ['AC', 'Valet Parking', 'Stage'],
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552'
    }
];

exports.getAllHalls = async (req, res) => {
    const { city, minPrice, maxPrice } = req.query;
    let results = halls;

    if (city) {
        results = results.filter(h => h.location.toLowerCase().includes(city.toLowerCase()));
    }

    // Simulate database delay
    setTimeout(() => {
        res.json(results);
    }, 200);
};

exports.getHallById = async (req, res) => {
    const hall = halls.find(h => h.id == req.params.id);
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json(hall);
};
