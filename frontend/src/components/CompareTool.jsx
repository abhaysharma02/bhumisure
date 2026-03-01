import { useState, useEffect } from "react";
import "./StampDutyForm.css"; // Reuse existing css styles

const API = "http://localhost:4000";

export default function CompareTool() {
    const [wards, setWards] = useState([]);

    // Data for left side (Property A)
    const [locA, setLocA] = useState({ ward_id: "", location_id: "", rates: null });
    const [locationsA, setLocationsA] = useState([]);

    // Data for right side (Property B)
    const [locB, setLocB] = useState({ ward_id: "", location_id: "", rates: null });
    const [locationsB, setLocationsB] = useState([]);

    useEffect(() => {
        fetch(`${API}/api/wards`)
            .then(r => r.json())
            .then(d => { if (d.success) setWards(d.data); })
            .catch(console.error);
    }, []);

    // Fetch Locations A
    useEffect(() => {
        if (!locA.ward_id) return setLocationsA([]);
        fetch(`${API}/api/locations?ward_id=${locA.ward_id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setLocationsA(d.data); })
            .catch(console.error);
    }, [locA.ward_id]);

    // Fetch Locations B
    useEffect(() => {
        if (!locB.ward_id) return setLocationsB([]);
        fetch(`${API}/api/locations?ward_id=${locB.ward_id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setLocationsB(d.data); })
            .catch(console.error);
    }, [locB.ward_id]);

    // Fetch Rates A
    useEffect(() => {
        if (!locA.location_id) return setLocA(prev => ({ ...prev, rates: null }));
        fetch(`${API}/api/rates?location_id=${locA.location_id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setLocA(prev => ({ ...prev, rates: d.data })); })
            .catch(console.error);
    }, [locA.location_id]);

    // Fetch Rates B
    useEffect(() => {
        if (!locB.location_id) return setLocB(prev => ({ ...prev, rates: null }));
        fetch(`${API}/api/rates?location_id=${locB.location_id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setLocB(prev => ({ ...prev, rates: d.data })); })
            .catch(console.error);
    }, [locB.location_id]);

    const LocationSelector = ({ title, state, setState, locations }) => (
        <div className="card w-full md:flex-1 min-w-[300px] bg-white p-5 border border-gray-200 rounded-md shadow-sm">
            <h3 className="page-title text-xl font-bold text-[#003366] mb-4 border-b pb-2">{title}</h3>
            <div className="form-group mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Ward / Tehsil</label>
                <select className="w-full p-2.5 border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" value={state.ward_id} onChange={e => setState({ ...state, ward_id: e.target.value, location_id: "", rates: null })}>
                    <option value="">-- Choose Ward --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.ward_number} - {w.tehsil}</option>)}
                </select>
            </div>
            <div className="form-group mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Locality</label>
                <select className="w-full p-2.5 border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" value={state.location_id} onChange={e => setState({ ...state, location_id: e.target.value })} disabled={!state.ward_id}>
                    <option value="">-- Choose Locality --</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.locality_name} ({loc.road_type})</option>)}
                </select>
            </div>

            {state.rates && (
                <div className="mt-5 p-4 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]">
                    <h4 className="text-[#166534] font-bold mb-3 text-lg">Circle Rates (per sq.m)</h4>
                    <ul className="list-none p-0 m-0 leading-loose text-sm">
                        <li className="flex justify-between border-b border-green-200 py-1"><strong>Residential Plot:</strong> <span>₹ {Number(state.rates.residential_plot_rate).toLocaleString()}</span></li>
                        <li className="flex justify-between border-b border-green-200 py-1"><strong>Commercial Plot:</strong> <span>₹ {Number(state.rates.commercial_plot_rate).toLocaleString()}</span></li>
                        <li className="flex justify-between border-b border-green-200 py-1"><strong>Industrial Plot:</strong> <span>₹ {Number(state.rates.industrial_rate).toLocaleString()}</span></li>
                        <li className="flex justify-between border-b border-green-200 py-1"><strong>Multi-storey Residential:</strong> <span>₹ {Number(state.rates.multi_storey_res_rate).toLocaleString()}</span></li>
                        <li className="flex justify-between border-b border-green-200 py-1"><strong>Multi-storey Commercial:</strong> <span>₹ {Number(state.rates.multi_storey_com_rate).toLocaleString()}</span></li>
                        <li className="flex justify-between py-1"><strong>Agricultural Irrigated (per Ha):</strong> <span>₹ {Number(state.rates.agricultural_irrigated_rate).toLocaleString()}</span></li>
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full">
            <header className="header bg-[#003366] text-white p-4 rounded-t-md flex flex-col md:flex-row justify-between items-center mb-6">
                <strong className="text-xl">BHUMI SURE</strong>
                <span className="sub-title text-sm opacity-90 mt-1 md:mt-0">Compare Location Rates</span>
            </header>

            <div className="container flex flex-col md:flex-row gap-5 w-full">
                <LocationSelector title="Property Location A" state={locA} setState={setLocA} locations={locationsA} />

                {locA.rates && locB.rates && (
                    <div className="flex items-center justify-center font-bold text-2xl text-gray-500 py-4 md:py-0">
                        VS
                    </div>
                )}

                <LocationSelector title="Property Location B" state={locB} setState={setLocB} locations={locationsB} />
            </div>

            {locA.rates && locB.rates && (
                <div className="container" style={{ marginTop: '20px' }}>
                    <div className="card" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <h3 style={{ color: '#1e3a8a' }}>Analysis</h3>
                        <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                            Residential plots in <strong>Location A</strong> are
                            <span style={{ fontWeight: 'bold', color: locA.rates.residential_plot_rate > locB.rates.residential_plot_rate ? 'red' : 'green' }}>
                                {' '}₹ {Math.abs(locA.rates.residential_plot_rate - locB.rates.residential_plot_rate).toLocaleString()} {locA.rates.residential_plot_rate > locB.rates.residential_plot_rate ? 'more expensive' : 'cheaper'}
                            </span> compared to Location B.
                        </p>
                        <p style={{ marginTop: '5px', fontSize: '1.1rem' }}>
                            Commercial plots in <strong>Location A</strong> are
                            <span style={{ fontWeight: 'bold', color: locA.rates.commercial_plot_rate > locB.rates.commercial_plot_rate ? 'red' : 'green' }}>
                                {' '}₹ {Math.abs(locA.rates.commercial_plot_rate - locB.rates.commercial_plot_rate).toLocaleString()} {locA.rates.commercial_plot_rate > locB.rates.commercial_plot_rate ? 'more expensive' : 'cheaper'}
                            </span> compared to Location B.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
