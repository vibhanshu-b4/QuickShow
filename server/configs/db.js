import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/movieverse`);
        console.log('Database connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit process with failure
    }

    mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
    });
};

export default connectDB;