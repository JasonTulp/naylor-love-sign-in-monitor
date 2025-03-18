"use client";
import {useCallback, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import Spinner from "@/components/spinner";
import { useDropzone } from "react-dropzone";


export default function RegisterPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [messageState, setmessageState] = useState<"error" | "success" | "loading">("loading");
    const { data: session } = useSession();


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
        setMessage("Attempting to upload file...");
        setmessageState("loading");

        const file = acceptedFiles[0];
        console.log("Uploaded file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            });

            const result = await response.json();
            setMessage(result.message);
            if (result.error) {
                setmessageState("error");
            } else {
                setmessageState("success");
            }
            console.log("Server response:", result);
            // window.location.reload();
        } catch (error) {
            console.error("Upload failed:", error);
        }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"] }, // Only allow CSV files
    });



    const getMessageStyles = () => {
        switch (messageState) {
        case "error":
            return "!bg-red-200 !text-red-900";
        case "success":
            return "!bg-green-200 !text-green-900";
        case "loading":
            return "!bg-yellow-200 !text-yellow-900"; // Optional loading color
        default:
            return "";
        }
    };
    
    useEffect(() => {
       
        if (!session || session.user?.role !== "admin") {
            router.push("/");
        }
    }, [session]);

    if (!session) {
        return <Spinner />
    }

    return (
        <div className="flex flex-row space-x-4 w-full">
        <div className="panel w-auto">
            <p>Upload a CSV file to parse and extract relevant information</p>
            <br />

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed p-2 text-center rounded-md cursor-pointer transition ${
                    isDragActive ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-gray-100"
                }`}
            >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="text-blue-600">Drop the file here...</p>
            ) : (
                <p className="text-gray-600">Drag & drop a CSV file here, or click to select one</p>
            )}
            </div>

            {message !== "" ? (
                <h2
                    className={`mt-4 p-1 rounded-md text-center font-extrabold ${getMessageStyles()}`}
                >
                {message}
                </h2>
            ) : null}

        </div>
        </div>
    );
}
