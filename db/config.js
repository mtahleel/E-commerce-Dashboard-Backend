import mongoose from "mongoose";
const DB = process.env.DATABASE || "mongodb://127.0.0.1:27017";
mongoose.connect(DB);

// mongoose
//   .connect(DB)
//   .then(() => console.log("Database connected"))
//   .catch((err) => console.log("error", err));
