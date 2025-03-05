"use client";
import { signIn } from "next-auth/react";
import {useState} from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            const result = await signIn("credentials", {
                usernameOrEmail,
                password,
                redirect: false,
            });

            if (result?.error) {
                setMessage(result.error || "An error occurred. Please try again.");
            } else {
                await new Promise((resolve) => setTimeout(resolve, 500));
                router.push("/");
            }
        } catch (error: any) {
            setMessage(error.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className={"panel !pl-20 !pr-20"}>
            <h1 className={"text-3xl font-extrabold text-primary mb-4 content-center text-center"}>Sign In</h1>
            <form onSubmit={handleLogin} className={"flex flex-col space-y-4"}>
                <input
                    type="text"
                    placeholder="Email or Username"
                    className="input"
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className = "panel !p-1 text-2xl !rounded-3xl font-extrabold text-darker !bg-primary">Sign in</button>
            </form>

            <p className={"italic text-center mt-8"}>
                Don't have an account? Ask your system administrator to create one for you.
            </p>

            {message && (
                <div className={`mt-4 p-2 rounded-md text-center font-extrabold !bg-red-200 !text-red-900`}>
                    {message}
                </div>
            )}
        </div>
    );
}
