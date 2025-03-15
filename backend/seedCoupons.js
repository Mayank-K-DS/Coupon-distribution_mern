const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/coupon');

dotenv.config();

console.log('Starting seed script...');
console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB with extended options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Connected to MongoDB successfully!');
  seedCoupons();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Connection URI used (password hidden):', 
    process.env.MONGO_URI?.replace(/:([^@]+)@/, ':***@') || 'No connection string found');
  process.exit(1);
});

// Initial coupons data
const initialCoupons = [
  {
    code: 'WELCOME10',
    value: 10,
    description: '10% off your first purchase'
  },
  {
    code: 'SAVE20',
    value: 20,
    description: '20% off selected items'
  },
  {
    code: 'FREESHIP',
    value: 0,
    description: 'Free shipping on orders over $50'
  },
  {
    code: 'SUMMER25',
    value: 25,
    description: '25% off summer collection'
  },
  {
    code: 'GIFT50',
    value: 50,
    description: '$50 off on purchases over $200'
  }
];

// Seed function
async function seedCoupons() {
  try {
    console.log('Clearing existing coupons...');
    // Clear existing coupons
    await Coupon.deleteMany({});
    
    console.log('Inserting new coupons...');
    // Insert new coupons
    const result = await Coupon.insertMany(initialCoupons);
    
    console.log(`Successfully seeded ${result.length} coupons`);
    console.log('Coupons:', result.map(c => c.code).join(', '));
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error in seedCoupons function:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}