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
        <div className="container" style={{ marginTop: '20px' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="page-title" style={{ color: '#b91c1c' }}>Admin Control Panel</h2>
                <hr className="divider" />

                <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                    <h3 style={{ color: '#991b1b', marginBottom: '10px' }}>Update Guideline Rates</h3>
                    <p style={{ marginBottom: '15px' }}>
                        Trigger the backend parser to read the uploaded Madhya Pradesh Guideline PDF (FY 2025-26)
                        and populate the PostgreSQL database.
                    </p>
                    <button
                        onClick={handleParse}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#ef4444' : '#b91c1c',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        {loading ? "Parsing 251 pages... Please wait" : "Trigger Database Seed from PDF"}
                    </button>

                    {message && (
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <strong>Result:</strong> {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
