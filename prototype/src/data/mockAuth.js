export const users = [
    { email: 'user@weds.in', password: 'User@123', role: 'customer', name: 'Santhosh User' },
    { email: 'owner@weds.in', password: 'Owner@123', role: 'owner', name: 'Halls Owner' },
    { email: 'admin@weds.in', password: 'Admin@123', role: 'admin', name: 'Super Admin' }
];

export const checkCredentials = (email, password) => {
    // In a real app, this would be an API call
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Invalid Credentials' };
    return { success: true, user };
};
