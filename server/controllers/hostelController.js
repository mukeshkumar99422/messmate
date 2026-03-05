const Hostel = require('../models/Hostel');

const getAllHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find({}).select('id name residents');

        const formattedHostels = hostels.map((h) => ({
            id: h.id,
            name: h.name,
            residents: h.residents
        }));

        res.json(formattedHostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllHostels
};