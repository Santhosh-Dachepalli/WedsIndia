require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const hallRoutes = require('./src/routes/hallRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'India Hall Booking API is running', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
