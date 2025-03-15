const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupon');
const Claim = require('../models/claim');
const { v4: uuidv4 } = require('uuid');

router.get('/coupon', async (req, res) => {
  try {

    try {
      await Claim.findOne({ _id: "000000000000000000000000" });
      console.log("Claims collection is accessible");
    } catch (initError) {
      console.log("Initializing Claims collection...");
      // This will create the collection if it doesn't exist
    }

    // Extract IP address and cookie ID
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let cookieId = req.cookies.couponUser;
    
    // If no cookie exists, create one
    if (!cookieId) {
      cookieId = uuidv4();
      res.cookie('couponUser', cookieId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }); // 30 days
    }
    
    // Check if user has claimed a coupon within the time limit (1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentClaim = await Claim.findOne({
      $or: [
        { ipAddress, claimedAt: { $gte: oneHourAgo } },
        { cookieId, claimedAt: { $gte: oneHourAgo } }
      ]
    });
    
    if (recentClaim) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: 'You can claim another coupon after 1 hour',
        nextAvailable: new Date(recentClaim.claimedAt.getTime() + 60 * 60 * 1000)
      });
    }
    
    // Get all active coupons
    const activeCoupons = await Coupon.find({ isActive: true });
    
    if (activeCoupons.length === 0) {
      return res.status(404).json({ error: 'No coupons available' });
    }
    
    // Get the most recently claimed coupon to determine next in round-robin
    const lastClaim = await Claim.findOne().sort({ claimedAt: -1 }).populate('couponId');
    
    let nextCoupon;
    
    if (!lastClaim) {
      // If no claims yet, start with the first coupon
      nextCoupon = activeCoupons[0];
    } else {
      // Find the index of the last claimed coupon
      const lastIndex = activeCoupons.findIndex(c => 
        c._id.toString() === lastClaim.couponId._id.toString());
      
      // Get the next coupon in round-robin fashion
      const nextIndex = (lastIndex + 1) % activeCoupons.length;
      nextCoupon = activeCoupons[nextIndex];
    }
    
    // Record this claim
    const newClaim = new Claim({
      couponId: nextCoupon._id,
      ipAddress,
      cookieId
    });
    
    await newClaim.save();
    
    // Return the coupon to the user
    res.json({
      success: true,
      coupon: {
        code: nextCoupon.code,
        value: nextCoupon.value,
        description: nextCoupon.description
      },
      message: 'Coupon claimed successfully!'
    });
    
  } catch (error) {
    console.error('Error getting coupon:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Admin route to add new coupons (you would add authentication for this in production)
router.post('/admin/coupon', async (req, res) => {
  try {
    const { code, value, description } = req.body;
    
    if (!code || !value || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    
    const newCoupon = new Coupon({
      code,
      value,
      description
    });
    
    await newCoupon.save();
    
    res.status(201).json({
      success: true,
      coupon: newCoupon
    });
    
  } catch (error) {
    console.error('Error adding coupon:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
