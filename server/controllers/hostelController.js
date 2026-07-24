const Hostel = require('../models/Hostel');
const chalk = require('chalk');

const getAllHostels = async (req, res, next) => {
    try {
        // .lean() is for returning plain js object and not mongoose document, which is faster and uses less memory
        const hostels = await Hostel.find({}).select('id name residents').lean();

        const formattedHostels = hostels.map((h) => ({
            id: h.id,
            name: h.name,
            residents: h.residents
        }));

        // Prevent clients from receiving 304 Not Modified by disabling caching for this endpoint
        // res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.status(200).json(formattedHostels);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllHostels
};