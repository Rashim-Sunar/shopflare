const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const customError = require("./utils/customError");
const globalErrorHandler = require("./controllers/globalErrorHandler");

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/api/users", userRoutes);

app.all('*path', (req, res, next) => {
    const err = new customError(`Can't find ${req.originalUrl} on the server`, 404);
    next(err);
})

// Global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log("Server listening on port:",PORT);
})