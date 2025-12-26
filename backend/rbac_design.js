/**
 * RBAC SYSTEM DESIGN
 * 
 * Roles:
 * 1. GUEST: Can search and view halls.
 * 2. CUSTOMER: Can book halls, view own bookings, write reviews.
 * 3. OWNER: Can manage own halls, view bookings for own halls, approve/reject bookings.
 * 4. ADMIN: Full access to all data, approve halls, sensitive system settings.
 */

const ROLES = {
    GUEST: 'guest',
    CUSTOMER: 'customer',
    OWNER: 'owner',
    ADMIN: 'admin'
};

const PERMISSIONS = {
    VIEW_HALLS: [ROLES.GUEST, ROLES.CUSTOMER, ROLES.OWNER, ROLES.ADMIN],
    BOOK_HALL: [ROLES.CUSTOMER],
    MANAGE_OWN_HALLS: [ROLES.OWNER],
    MANAGE_ALL_HALLS: [ROLES.ADMIN],
    APPROVE_HALLS: [ROLES.ADMIN],
    VIEW_REVENUE: [ROLES.ADMIN],
    VIEW_OWN_REVENUE: [ROLES.OWNER]
};

// Middleware Logic (Pseudocode)
function authorize(requiredPermission) {
    return (req, res, next) => {
        const userRole = req.user ? req.user.role : ROLES.GUEST;

        if (PERMISSIONS[requiredPermission].includes(userRole)) {
            next();
        } else {
            res.status(403).json({ error: "Access Denied" });
        }
    };
}
