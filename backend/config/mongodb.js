import mongoose from 'mongoose'
import dns from 'node:dns/promises';

const connectDB = async () => {
    // console.log(process.env.MONGODB_URI)
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set')
        }
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export default connectDB
