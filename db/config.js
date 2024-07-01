import mongoose from "mongoose";
const DB = process.env.DATABASE;
mongoose.connect(DB);
