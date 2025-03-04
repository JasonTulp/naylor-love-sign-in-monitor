import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: string;
        username: string;
        profilePicture?: string;
    }
    interface Session {
        user: User;
    }
}