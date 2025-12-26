const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { phone, role } = req.body;
    // Simulate OTP generation
    res.json({
        message: 'OTP sent successfully',
        otp: '1234' // DEV MODE ONLY 
    });
};

exports.register = async (req, res) => {
    const { fullName, phone, role } = req.body;
    res.status(201).json({ message: 'User registered successfully. Please login.' });
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    if (otp === '1234') {
        const token = jwt.sign(
            { id: 1, phone, role: 'customer' },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: { id: 1, name: 'Santhosh', role: 'customer' }
        });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
};
