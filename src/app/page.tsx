"use client"; // This component needs interactivity

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.files || e.currentTarget.files.files.length === 0) return;

    const file = e.currentTarget.files.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setStatus("Uploading and processing...");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setStatus(`✅ Success! Uploaded ${data.uploaded} chunks from ${data.filename}.`);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">NoteWave Ingest</h1>
        <p className="text-slate-500 mb-6 text-sm">Upload a PDF to process for RAG.</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            name="files"
            type="file"
            accept=".pdf"
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {isLoading ? "Processing..." : "Upload PDF"}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3 rounded text-sm ${status.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}