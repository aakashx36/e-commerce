const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
// Password hashing ke liye bcrypt ki zaroorat pad sakti hai agar model hook nahi hai
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const products = require("./data");
const connectDB = require("../config/db");

connectDB();

const seedData = async () => {
  try {
    // 1. Database Wipe
    await Product.deleteMany();
    await User.deleteMany();
    console.log("✅ Database Cleaned..."); // Added emoji/text fix

    // 2. Create a Seller
    const seller = await User.create({
      name: "Official Vendora Second Seller",
      email: "2ndseller@vendora.com",
      password: "password@123",
      role: "seller",
      businessAddress: {
        label: "Warehouse",
        fullName: "Sandeep Kumar",
        phone: "9876543210",
        street: "Suite 404, Tech Park",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001",
      },
      status: "active",
    });

    console.log(
      "✅ Seller Account Created (Login: seller@vendora.com / password123)",
    );

    // 3. Link Products to Seller ID
    const linkedProducts = products.map((p) => {
      return { ...p, seller: seller._id };
    });

    // 4. Batch Insert
    await Product.insertMany(linkedProducts);
    console.log("✅ 100 Products with Specifications Tables Seeded!");

    console.log("🚀 SEEDING PROCESS COMPLETE!");
    process.exit();
  } catch (error) {
    // FIX: Backticks (`) use karein single quotes ki jagah template literal ke liye
    console.error(`❌ Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
