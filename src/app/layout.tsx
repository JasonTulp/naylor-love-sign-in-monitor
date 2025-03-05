"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {SessionProvider} from "next-auth/react";
import NavBar from "@/components/nav-bar";
import Link from "next/link";
import HeaderLogo from "@/components/header";
import SiteHeader from "@/components/header"; // Import Link from Next.js

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // dbConnect().then(r => console.log("Connected to database"));
    return (
        <html lang="en">
        <head>
            <title>NL Event Data</title>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-mid text-text `}
        >

        <SessionProvider>
            <div className={"flex flex-col justify-between min-h-screen  bg-gradient-to-t from-mid to-dark"}>
                {/*Header*/}
                <SiteHeader />

                {/*Main Content*/}
                <main id="container" className="mb-auto flex flex-col items-center">
                    {/*<div className="flex items-start p-4 w-full h-full lg:w-3/4 xl:w-1/2 bg-dark shadow-md border-x-2 border-border">*/}
                    <div className="flex items-start p-4 w-full h-full lg:w-3/4 xl:w-1/2">
                        {children}
                    </div>
                </main>

                <footer className="bg-mid-light text-text p-10 w-full   border-t-4 border-border">
                    <p>© 2025 Naylor Love</p>
                    <p className={"link"}>tulp.dev</p>
                </footer>
            </div>
        </SessionProvider>
        </body>
        </html>
    );
}