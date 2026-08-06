/**
 * GET /hostels and POST /hostels response shaper.
 */
const HostelAdminResponseDTO = (hostel) => ({
    id: hostel.id,
    name: hostel.name,
    residents: hostel.residents,
    students: hostel.students,
    accountantContactNo: hostel.accountantContactNo || '',
    accountantEmail: hostel.accountantEmail || '',
    hostelContactNo: hostel.hostelContactNo || '',
    hostelEmail: hostel.hostelEmail,
    loginId: hostel.loginId,
});

/**
 * GET /hostels/:hostelId/students response shaper.
 */
const StudentListItemResponseDTO = (student) => ({
    name: student.name,
    identifier: student.identifier,
});

module.exports = { HostelAdminResponseDTO, StudentListItemResponseDTO };