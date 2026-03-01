import React, { useState, useEffect } from "react";

const rawAPI = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API = rawAPI.replace(/\/$/, "");

export default function GuidelineCheck() {
    const [guidelines, setGuidelines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculator State
    const [calcForm, setCalcForm] = useState({
        location: "",
        area: "",
        type: "residential"
    });
    const [calcResult, setCalcResult] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);
    const [calcError, setCalcError] = useState("");

    const fetchGuidelines = async (query = "") => {
        setLoading(true);
        setError("");
        try {
            const endpoint = query
                ? `${API}/api/guideline?location=${encodeURIComponent(query)}`
                : `${API}/api/guidelines`;
            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                setGuidelines(data.data);
            } else {
                setError(data.message || "Failed to fetch data");
                setGuidelines([]);
            }
        } catch (err) {
            setError("Error connecting to server");
            setGuidelines([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuidelines();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchGuidelines(searchQuery);
    };

    const handleCalcChange = (e) => {
        setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        if (!calcForm.location || !calcForm.area) {
            setCalcError("Please provide both location and area.");
            return;
        }

        setCalcLoading(true);
        setCalcError("");
        setCalcResult(null);

        try {
            const res = await fetch(`${API}/api/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(calcForm)
            });
            const data = await res.json();

            if (data.success) {
                setCalcResult(data.data);
            } else {
                setCalcError(data.message || "Calculation failed");
            }
        } catch (err) {
            setCalcError("Error connecting to server");
        } finally {
            setCalcLoading(false);
        }
    };

    return (
        <div className="w-full flex md:flex-row flex-col gap-6">

            {/* LEFT: Guideline Table Area */}
            <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#003366] m-0">Guideline Rates Database</h2>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Search by location name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                            />
                            <button type="submit" className="bg-[#003366] text-white px-4 py-2 rounded font-semibold hover:bg-[#064582] transition-colors">
                                Search
                            </button>
                            {searchQuery && (
                                <button type="button" onClick={() => { setSearchQuery(""); fetchGuidelines(""); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors">
                                    Clear
                                </button>
                            )}
                        </form>

                        {error && <div className="p-3 mb-4 text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>}

                        <div className="overflow-x-auto border border-gray-200 rounded">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#003366] text-white">
                                    <tr>
                                        <th className="p-3 font-semibold">Location</th>
                                        <th className="p-3 font-semibold">Ward</th>
                                        <th className="p-3 font-semibold">Residential</th>
                                        <th className="p-3 font-semibold">Commercial</th>
                                        <th className="p-3 font-semibold">Shop</th>
                                        <th className="p-3 font-semibold">Office</th>
                                        <th className="p-3 font-semibold">Agriculture</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="7" className="p-6 text-center text-gray-500">Loading data...</td></tr>
                                    ) : guidelines.length > 0 ? (
                                        guidelines.map((g) => (
                                            <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-medium text-gray-900">{g.location}</td>
                                                <td className="p-3 text-gray-600">{g.ward}</td>
                                                <td className="p-3">₹{g.residential_rate?.toLocaleString() || '-'}</td>
                                                <td className="p-3">₹{g.commercial_rate?.toLocaleString() || '-'}</td>
                                                <td className="p-3">₹{g.shop_rate?.toLocaleString() || '-'}</td>
                                                <td className="p-3">₹{g.office_rate?.toLocaleString() || '-'}</td>
                                                <td className="p-3">₹{g.agriculture_rate?.toLocaleString() || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="p-6 text-center text-gray-500">No guideline rates found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 text-right">Showing limited results. Use search for specifics.</div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Calculator Area */}
            <div className="w-full md:w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                    <div className="p-4 border-b border-gray-200 bg-[#ff9933] text-white">
                        <h2 className="text-lg font-bold m-0 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            Price Estimate Quick Calc
                        </h2>
                    </div>

                    <div className="p-5">
                        <form onSubmit={handleCalculate} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Exact Location Name</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={calcForm.location}
                                    onChange={handleCalcChange}
                                    placeholder="e.g. DD Nagar"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#003366]"
                                    required
                                />
                                <span className="text-[10px] text-gray-500">Must match location from DB exactly</span>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Property Type</label>
                                <select
                                    name="type"
                                    value={calcForm.type}
                                    onChange={handleCalcChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#003366]"
                                >
                                    <option value="residential">Residential Plotted</option>
                                    <option value="commercial">Commercial Plotted</option>
                                    <option value="shop">Shop</option>
                                    <option value="office">Office</option>
                                    <option value="agriculture">Agriculture Land</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Area (sq.m / ha)</label>
                                <input
                                    type="number"
                                    name="area"
                                    value={calcForm.area}
                                    onChange={handleCalcChange}
                                    placeholder="e.g. 1500"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#003366]"
                                    required
                                />
                            </div>

                            <button type="submit" disabled={calcLoading} className="mt-2 w-full bg-[#003366] text-white py-2.5 rounded font-bold hover:bg-[#064582] transition-colors">
                                {calcLoading ? "Calculating..." : "Calculate Exact Price"}
                            </button>
                        </form>

                        {calcError && <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{calcError}</div>}

                        {calcResult && (
                            <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-green-800 text-sm mb-1 uppercase font-semibold">Total Assessed Value</div>
                                <div className="text-2xl font-bold text-green-900 mb-2">₹{calcResult.total_price.toLocaleString()}</div>
                                <div className="flex justify-between border-t border-green-200 pt-2 text-sm text-green-700">
                                    <span>Base Rate:</span>
                                    <span className="font-bold">₹{calcResult.rate.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
