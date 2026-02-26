const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  meal: { type: String, enum: ['breakfast', 'lunch',  'dinner'], required: true },
  items: [{
    id: { type: String }, //----      ------
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

// Index for fast querying by student and date for the analysis page
purchaseSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);