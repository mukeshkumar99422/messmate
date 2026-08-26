/**
 * - POST /login
 * - POST /login-with-otp
 * @param {document} user already have `hostel` populated
 * @param {jwt token} accessToken newly generated access token
 * @returns sanitized response DTO
 */
const LoginResponseDTO = (user, accessToken) => ({
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


/**
 * - GET /me
 * @param {document} user already have `hostel` populated
 * @returns sanitized response dto
 */
const GetMeResponseDTO = (user) => ({
    _id: user._id,
    name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
    identifier: user.identifier,
    email: user.email,
    role: user.role,
    hostelId: user.hostel ? user.hostel.id : null,
    hostelName: user.hostel ? user.hostel.name : null,
    isVerified: user.isVerified,
});

module.exports = { LoginResponseDTO, GetMeResponseDTO };