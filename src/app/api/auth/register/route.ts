import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { dbConnect } from "@/lib/db-connect";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password, passwordCheck, username, firstName, lastName } = await req.json();

        // Check if all fields are filled
        if (!email || !password || !passwordCheck || !username || !firstName || !lastName) {
            return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Email already registered" }, { status: 400 });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return NextResponse.json({ message: "Username already taken" }, { status: 400 });
        }

        // Check if password and passwordCheck match
        if (password !== passwordCheck) {
            return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
        }

        // Validate password
        if (password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 });
        }
        if (!/[A-Z]/.test(password)) {
            return NextResponse.json({ message: "Password must contain at least 1 uppercase letter" }, { status: 400 });
        }
        if (!/[a-z]/.test(password)) {
            return NextResponse.json({ message: "Password must contain at least 1 lowercase letter" }, { status: 400 });
        }
        if (!/\d/.test(password)) {
            return NextResponse.json({ message: "Password must contain at least 1 number" }, { status: 400 });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            provider: "credentials",
            firstName,
            lastName,
            role: "user",
        });

        await newUser.save();

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
