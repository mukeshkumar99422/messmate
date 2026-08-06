/**
 *   collapses 4 duplicated response builders
 *   - POST /login
 *   - POST /login-with-otp
 *   - GET  /me
 *   - POST /refresh
 *
 * Expects `user` to already have `hostel` populated with at least
 * `{ id, name }` when the user has a hostel (students/accountants).
 */
const AuthResponseDTO = (user, accessToken) => ({
    accessToken,
    _id: user._id,
    name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
    identifier: user.identifier,
    email: user.email,
    role: user.role,
    hostelId: user.hostel ? user.hostel.id : null,
    hostelName: user.hostel ? user.hostel.name : null,
    isVerified: user.isVerified,
});

module.exports = { AuthResponseDTO };