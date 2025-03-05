"use client";

import Link from "next/link";
import NavBar from "@/components/nav-bar";

export default function SiteHeader() {
    return (
        <header
            className="App-header bg-mid shadow-lg shadow-dark border-b-4 border-border bg-gradient-to-t from-mid to-dark lg:sticky lg:top-0 z-50"
        >
            <div className="flex flex-row items-end pb-4 pt-10 justify-items-start w-full lg:w-3/4 xl:w-1/2">
                <Link className="relative flex flex-row group pb-1" href="/">
                    {/* Black & White (Default) */}
                    <img
                        src="/Naylor-Love-logo.png"
                        alt="Naylor Love Logo"
                        className="absolute transition-opacity duration-1000 ease-in-out opacity-100 group-hover:opacity-0"
                    />
                    {/* Colored (Hover) */}
                    <img
                        src="/Naylor-Love-hover-logo-2.png"
                        alt="Naylor Love Logo Color"
                        className="transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100"
                    />
                </Link>
                <h1 className="font-bold italic text-2xl pb-0 text-white">
                    Sign In Monitor
                </h1>
                {/*<Link href={"/"} className={"font-extrabold text-3xl p-4 md:text-4xl lg:text-5xl text-primary pt-10 pb-10"}>Naylor Love Sign In Monitor</Link>*/}
            </div>
            <NavBar />
        </header>
    );
}