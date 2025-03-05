"use client";
import Link from "next/link";
import {getSession, signOut, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import { Session } from "next-auth";

export default function NavBar() {
    const router = useRouter(); // Redirect if no session
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/signin" }); // Redirect to sign-in page after sign-out
    }

    const handleAddUser = async () => {
        await router.push("/add-user");
    }

    return (
        <nav className="flex flex-col w-full items-center bg-mid-light">
            <div className={"lg:w-3/4 xl:w-1/2 flex w-full justify-between "}>
                <ul className="flex space-x-4">
                    {/*<li className="p-2 text-xl font-bold hover:underline hover:text-primary">*/}
                    {/*    <Link href="/">Home</Link>*/}
                    {/*</li>*/}
                    {/*<li className="p-2 text-xl font-bold hover:underline hover:text-primary">*/}
                    {/*    <Link href="/profile">Profile</Link>*/}
                    {/*</li>*/}
                    {/*<li className="p-2 text-xl font-bold hover:underline hover:text-primary">*/}
                    {/*    <Link href="/activities">Activities</Link>*/}
                    {/*</li>*/}
                    {/*/!*<li className="p-2 text-xl font-bold">*!/*/}
                    {/*/!*    <Link href="/add-activity-type">Add Activity</Link>*!/*/}
                    {/*/!*</li>*!/*/}
                </ul>
                <ul className="flex space-x-4">
                    {session && session.user?.role === "admin" && (
                        <li className="p-2 text-xl font-bold">
                            <button
                                onClick={handleAddUser}
                                className="hover:underline hover:text-primary"
                            >
                                Add User
                            </button>
                        </li>
                    )}
                    {session && (
                        <li className="p-2 text-xl font-bold">
                            <button
                                onClick={handleSignOut}
                                className="hover:underline hover:text-primary"
                            >
                                Sign Out
                            </button>
                        </li>
                    )}
                </ul>

            </div>
        </nav>
    );
}