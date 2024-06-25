import mongoose from "mongoose";
const DB = process.env.DATABASE;
mongoose.connect(DB);

// mongoose
//   .connect(DB)
//   .then(() => console.log("Database connected"))
//   .catch((err) => console.log("error", err));
