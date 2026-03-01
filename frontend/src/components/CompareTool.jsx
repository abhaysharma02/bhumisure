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
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
            <h3 className="page-title">{title}</h3>
            <div className="form-group">
                <label>Select Ward / Tehsil</label>
                <select value={state.ward_id} onChange={e => setState({ ...state, ward_id: e.target.value, location_id: "", rates: null })}>
                    <option value="">-- Choose Ward --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.ward_number} - {w.tehsil}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Select Locality</label>
                <select value={state.location_id} onChange={e => setState({ ...state, location_id: e.target.value })} disabled={!state.ward_id}>
                    <option value="">-- Choose Locality --</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.locality_name} ({loc.road_type})</option>)}
                </select>
            </div>

            {state.rates && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h4 style={{ color: '#166534', marginBottom: '10px' }}>Circle Rates (per sq.m)</h4>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: 1.8 }}>
                        <li><strong>Residential Plot:</strong> ₹ {Number(state.rates.residential_plot_rate).toLocaleString()}</li>
                        <li><strong>Commercial Plot:</strong> ₹ {Number(state.rates.commercial_plot_rate).toLocaleString()}</li>
                        <li><strong>Industrial Plot:</strong> ₹ {Number(state.rates.industrial_rate).toLocaleString()}</li>
                        <li><strong>Multi-storey Residential:</strong> ₹ {Number(state.rates.multi_storey_res_rate).toLocaleString()}</li>
                        <li><strong>Multi-storey Commercial:</strong> ₹ {Number(state.rates.multi_storey_com_rate).toLocaleString()}</li>
                        <li><strong>Agricultural Irrigated (per Ha):</strong> ₹ {Number(state.rates.agricultural_irrigated_rate).toLocaleString()}</li>
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <>
            <header className="header">
                <strong>BHUMI SURE</strong>
                <span className="sub-title">Compare Location Rates</span>
            </header>

            <div className="container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <LocationSelector title="Property Location A" state={locA} setState={setLocA} locations={locationsA} />

                {locA.rates && locB.rates && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#6b7280' }}>
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
        </>
    );
}
