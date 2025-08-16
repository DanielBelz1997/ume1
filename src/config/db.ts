import mongoose from "mongoose";

export const connectionDB = async () => {
  try {
    const mongoURI =
      process.env.MONGOD_URI || "mongodb://localhost:27017/user-management";

    await mongoose.connect(mongoURI);
  } catch (e) {
    console.error("enable to connect to the db:", e);
    process.exit(1);
  }
};
