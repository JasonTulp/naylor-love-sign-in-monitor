'use server';
import ActivityType from "@/models/activity-type";
import { revalidatePath } from "next/cache";
import { dbConnect } from "./db-connect";
import mongoose from "mongoose";

export const createActivity = async (formData: FormData) => {
    await dbConnect();
    // Extracting activity from formData
    const _id = String(formData.get("name"));
    const competitive = formData.get("competitive") === "on";
    try {
        console.log("Using database:", mongoose.connection.name);

        // Creating a new activity using model
        const newActivityType = await ActivityType.create({
            _id,
            competitive,
        });
        // Triggering revalidation of the specified path ("/")
        revalidatePath("/");
        console.log(" Added actvity: ", newActivityType.toString());
        return newActivityType.toString();
    } catch (error) {
        console.log(error);
        return {message: 'error creating actiity'};
    }
};
