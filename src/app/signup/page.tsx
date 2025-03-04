"use client";
import { useState } from "react";
import {signIn} from "next-auth/react";
import HorizontalRule from "@/components/horizontal-rule";
import {useRouter} from "next/navigation";


export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, passwordCheck, username, firstName, lastName }),
        });

        const data = await res.json();
        if (res.ok) {
            router.push("/signin");
        } else {
            setMessage(data.message || "An error occurred. Please try again.");
            setIsError(true);
        }
    };

    return (
        <div className={"panel !pl-20 !pr-20"}>
            <h1 className={"text-3xl font-extrabold text-primary mb-4 content-center text-center"}>Register</h1>
            <HorizontalRule />
            <form onSubmit={handleSubmit} className={"flex flex-col space-y-4"}>
                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    name="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="First Name"
                    name="given-name"
                    autoComplete="given-name"
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    name="family-name"
                    autoComplete="family-name"
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <HorizontalRule />
                <p className="text-sm text-center text-light-as">
                    Must be at least 8 characters long with one uppercase letter, one lowercase letter and one number.
                </p>
                <HorizontalRule />
                <input
                    type="password"
                    placeholder="Password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="input"
                    value={passwordCheck}
                    onChange={(e) => setPasswordCheck(e.target.value)}
                    required
                />
                <button type="submit"className = "panel !p-1 text-2xl !rounded-3xl font-extrabold text-darker !bg-primary">Register</button>
                <button
                    type="button"
                    onClick={() => signIn("google", {
                        redirect: true,
                        callbackUrl: "/profile", // Redirect after login
                    })}
                    className="link"
                >
                    Sign in with Google
                </button>
            </form>

            <p className={"italic text-center mt-8"}>
                Already have an account? <a href="/signin" className={"link"}>Sign in here</a>
            </p>

            {message && (
                <div className={`mt-4 p-2 rounded-md text-center font-extrabold ${isError ? "!bg-red-200 !text-red-900" : "!bg-green-200 !text-green-900"}`}>
                    {message}
                    {!isError && (
                        <span className="block mt-2">
                            <a href="/signin" className="text-blue-600 underline">Sign in</a>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
