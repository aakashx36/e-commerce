const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// 1. Load Environment Variables (Hamesha sabse upar)
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize App (Ye line upar honi chahiye!)
const app = express();

// 4. Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. CORS Configuration (Ek hi baar use karein, properly)
app.use(
  cors({
    origin: "http://localhost:5173", //
    credentials: true,
  }),
);

// 6. API Routes Initialization
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// 7. Health Check Route
app.get("/", (req, res) => {
  res.send("Vendora API is running successfully...");
});

// 8. Error Handling Middleware (Routes ke baad aate hain)
app.use(notFound);
app.use(errorHandler);

// 9. Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
