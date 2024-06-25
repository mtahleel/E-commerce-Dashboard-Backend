import mongoose from "mongoose";
mongoose.connect("mongodb://localhost:27017/e-commerce");

// const DB = process.env.DATABASE;
// mongoose
//   .connect(DB)
//   .then(() => console.log("Database connected"))
//   .catch((err) => console.log("error", err));
