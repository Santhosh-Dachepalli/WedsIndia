exports.createBooking = async (req, res) => {
    const { hallId, date, userId } = req.body;

    // 1. Availability Check (Mock)
    if (date === '2025-12-31') {
        return res.status(409).json({ error: 'Hall already booked for this date' });
    }

    // 2. Create Booking
    const newBooking = {
        id: Math.floor(Math.random() * 1000),
        hallId,
        date,
        userId,
        status: 'CONFIRMED',
        paymentStatus: 'PAID', // Consolidated step for prototype
        amount: 150000
    };

    res.status(201).json({
        message: 'Booking confirmed successfully',
        booking: newBooking
    });
};

exports.getUserBookings = async (req, res) => {
    // Return mock bookings
    res.json([
        { id: 101, hallName: 'Grand Royal', date: '2025-05-20', status: 'CONFIRMED' }
    ]);
};
