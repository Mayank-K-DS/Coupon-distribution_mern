const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  cookieId: {
    type: String,
    required: true
  },
  claimedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', claimSchema);