import { useState } from "react";

const API = "http://localhost:4000";

export default function AdminPanel() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleParse = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${API}/api/admin/parse-pdf`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setMessage(`Success: ${data.message} (${data.pages} pages processed)`);
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (err) {
            setMessage("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 w-full max-w-2xl mx-auto px-4">
            <div className="card w-full bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="page-title text-xl font-bold text-[#b91c1c] m-0">Admin Control Panel</h2>
                </div>

                <div className="p-5 bg-[#fef2f2] border-t border-[#fecaca]">
                    <h3 className="text-[#991b1b] font-bold mb-3 text-lg">Update Guideline Rates</h3>
                    <p className="mb-4 text-gray-700 text-sm md:text-base leading-relaxed">
                        Trigger the backend parse engine to read the uploaded Madhya Pradesh Guideline PDF (FY 2025-26)
                        and populate the PostgreSQL/SQLite database.
                    </p>
                    <button
                        onClick={handleParse}
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-md font-bold text-white transition-colors duration-200 ${loading ? 'bg-red-500 cursor-not-allowed opacity-80' : 'bg-[#b91c1c] hover:bg-red-800'
                            }`}
                    >
                        {loading ? "Parsing 251 pages... Please wait" : "Trigger Database Seed from PDF"}
                    </button>

                    {message && (
                        <div className="mt-4 p-3 bg-white border border-gray-300 rounded text-sm text-gray-800 shadow-inner">
                            <strong className="text-black">Result:</strong> {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
