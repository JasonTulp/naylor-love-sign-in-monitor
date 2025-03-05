"use server";
import mongoose, {Connection} from 'mongoose'

if (!process.env.MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env'
    )
}


let cached: Connection | null = null;

export async function dbConnect() {
    if (cached) {
        // console.log("DB CONNECT: Using cached db connection");
        return cached
    }

    try {
        // console.log("DB CONNECT: Establishing new connection")
        // If no cached connection exists, establish a new connection to MongoDB
        const cnx = await mongoose.connect(process.env.MONGODB_URI!);
        // Cache the connection for future use
        if (cnx.connection) {
            cached = cnx.connection;
        }
        console.log("DB CONNECT: New mongodb connection established");
        return cached;
    } catch (error) {
        // If an error occurs during connection, log the error and throw it
        console.log(error);
        throw error;
    }
}
