/**
 * Seeds / refreshes the vegetable catalog. Idempotent: upserts by name so it is
 * safe to run repeatedly.
 *
 *   node src/seeders/products.seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../models/Product');
const logger = require('../utils/logger');

const VEGETABLES = [
  { name: 'Tomato', emoji: '🍅', pricePerKg: 40, description: 'Fresh farm tomatoes', sortOrder: 10 },
  { name: 'Potato', emoji: '🥔', pricePerKg: 30, description: 'Everyday potatoes', sortOrder: 20 },
  { name: 'Onion', emoji: '🧅', pricePerKg: 35, description: 'Nashik red onions', sortOrder: 30 },
  { name: 'Carrot', emoji: '🥕', pricePerKg: 50, description: 'Sweet & crunchy carrots', sortOrder: 40 },
  { name: 'Cucumber', emoji: '🥒', pricePerKg: 30, description: 'Cool green cucumbers', sortOrder: 50 },
  { name: 'Capsicum', emoji: '🫑', pricePerKg: 60, description: 'Green bell peppers', sortOrder: 60 },
  { name: 'Cauliflower', emoji: '🥦', pricePerKg: 45, description: 'Fresh cauliflower', sortOrder: 70 },
  { name: 'Spinach', emoji: '🥬', pricePerKg: 25, description: 'Leafy palak', sortOrder: 80 },
  { name: 'Brinjal', emoji: '🍆', pricePerKg: 40, description: 'Tender brinjal', sortOrder: 90 },
  { name: 'Green Chilli', emoji: '🌶️', pricePerKg: 80, description: 'Spicy green chillies', sortOrder: 100 },
  { name: 'Ladyfinger', emoji: '🫛', pricePerKg: 55, description: 'Fresh bhindi', sortOrder: 110 },
  { name: 'Corn', emoji: '🌽', pricePerKg: 35, description: 'Sweet corn', sortOrder: 120 },
  { name: 'Garlic', emoji: '🧄', pricePerKg: 120, description: 'Aromatic garlic', sortOrder: 130 },
  { name: 'Ginger', emoji: '🫚', pricePerKg: 100, description: 'Fresh ginger', sortOrder: 140 },
  { name: 'Broccoli', emoji: '🥦', pricePerKg: 90, description: 'Green broccoli', sortOrder: 150 },
  { name: 'Mushroom', emoji: '🍄', pricePerKg: 150, description: 'Button mushrooms (per kg)', sortOrder: 160 },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  logger.info('MongoDB connected (seeder)');

  for (const veg of VEGETABLES) {
    await Product.findOneAndUpdate({ name: veg.name }, { $set: veg }, { upsert: true, new: true });
  }

  const total = await Product.countDocuments();
  logger.info(`Seeded ${VEGETABLES.length} vegetables. Catalog now has ${total} products.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
