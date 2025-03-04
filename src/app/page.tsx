"use client";
import { useCallback } from "react";
import HorizontalRule from "@/components/horizontal-rule";
import { useDropzone } from "react-dropzone";
import ViewEvents from "@/components/view-events";

export default function Home() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
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
        console.log("Server response:", result);
        window.location.reload();
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] }, // Only allow CSV files
  });

  return (
  <div className="w-full space-y-4">
    <div className="flex flex-row space-x-4">
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
      </div>
    </div>

    <HorizontalRule />

    <ViewEvents />
    <HorizontalRule />

  </div>
  );
}
