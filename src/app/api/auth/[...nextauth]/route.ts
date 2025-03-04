import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import { dbConnect } from "@/lib/db-connect";

const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                usernameOrEmail: { label: "Username or Email", type: "text", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.usernameOrEmail || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                await dbConnect();

                // Find user in the database by checking against both email and username
                let user = await User.findOne({ username: credentials.usernameOrEmail });
                if (!user) {
                    user = await User.findOne({ email: credentials.usernameOrEmail });
                    if (!user) {
                        throw new Error("User not found");
                    }
                }

                // Check if user used credentials
                if (!credentials.password || user.provider !== "credentials") {
                    throw new Error("redirect-google");
                }

                // Verify password
                const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                if (!passwordMatch) {
                    throw new Error("Invalid credentials, have you entered the correct password?");
                }

                // Return user object (must include `id`)
                return { id: user._id.toString(), username: user.username, email: user.email, role: user.role };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            await dbConnect();

            // Check if the user already exists
            let existingUser = await User.findOne({ email: user.email });

            // If the user doesn't exist, create one
            if (!existingUser) {
                existingUser = new User({
                    username: user.name,
                    firstName: (profile as any)?.given_name || null,
                    lastName: (profile as any)?.family_name || null,
                    email: user.email,
                    provider: "provider",
                    role: "user",
                    profilePicture:  (profile as any)?.picture || null,
                });
                await existingUser.save();
            }

            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.username = token.username as string;
                session.user.profilePicture = token.profilePicture as string | undefined;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
                token.profilePicture = user.profilePicture;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin", // Custom login page
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
