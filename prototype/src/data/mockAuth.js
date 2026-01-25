export const users = [
    { email: 'user@bookmyvenue.com', password: 'User@123', role: 'customer', name: 'Santhosh User' },
    { email: 'owner@bookmyvenue.com', password: 'Owner@123', role: 'owner', name: 'Halls Owner' },
    { email: 'admin@bookmyvenue.com', password: 'Admin@123', role: 'admin', name: 'Super Admin' }
];

export const checkCredentials = (email, password) => {
    // In a real app, this would be an API call
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Invalid Credentials' };
    return { success: true, user };
};
