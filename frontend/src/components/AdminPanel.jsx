import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminPanel() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) {
            setMessage("Error: Please select a CSV file first.");
            return;
        }

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API}/api/import-guidelines`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setMessage(`Success: ${data.message} (${data.rows_inserted} rows inserted)`);
                setFile(null); // Clear file after success
                document.getElementById('csv-upload').value = '';
            } else {
                setMessage(`Error: ${data.message} ${data.error ? `- ${data.error}` : ''}`);
            }
        } catch (err) {
            setMessage("Error connecting to server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 w-full max-w-2xl mx-auto px-4">
            <div className="card w-full bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="page-title text-xl font-bold text-[#b91c1c] m-0">Admin Control Panel</h2>
                    <span className="text-sm font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">/admin/import-guidelines</span>
                </div>

                <div className="p-5 bg-[#fef2f2] border-t border-[#fecaca]">
                    <h3 className="text-[#991b1b] font-bold mb-3 text-lg">Import Guideline Rates (CSV)</h3>
                    <p className="mb-4 text-gray-700 text-sm md:text-base leading-relaxed">
                        Upload standard CSV files to bulk insert official guideline rates into the database.
                        Expected columns: <code className="bg-red-100 px-1 rounded">city, ward, location, residential_rate, commercial_rate, shop_rate, office_rate, agriculture_rate, year</code>.
                    </p>

                    <div className="mb-4">
                        <input
                            type="file"
                            id="csv-upload"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[#b91c1c] file:text-white
                                hover:file:bg-red-800 transition-colors
                                cursor-pointer border border-gray-300 rounded-md bg-white p-2"
                        />
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={loading || !file}
                        className={`w-full py-3 px-6 rounded-md font-bold text-white transition-colors duration-200 ${loading || !file ? 'bg-red-400 cursor-not-allowed opacity-80' : 'bg-[#b91c1c] hover:bg-red-800'
                            }`}
                    >
                        {loading ? "Uploading & Parsing CSV... Please wait" : "Upload and Import CSV"}
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 border rounded text-sm shadow-inner ${message.startsWith('Success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-300 text-gray-800'}`}>
                            <strong>Result:</strong> {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
