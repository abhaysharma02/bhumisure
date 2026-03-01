import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./StampDutyForm.css";

// Helper component to recenter map when location changes
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

const API = "http://localhost:4000";

export default function StampDuty() {
  const [form, setForm] = useState({
    ward_id: "",
    location_id: "",
    propertyType: "residential_plot_rate",
    buyerType: "Male",
    area: ""
  });

  const [wards, setWards] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Default coordinate (Gwalior)
  const [mapCenter, setMapCenter] = useState([26.2183, 78.1828]);
  const [selectedLocationName, setSelectedLocationName] = useState("District Gwalior");
  const [mapStyle, setMapStyle] = useState("satellite");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "ward_id") {
      setForm((prev) => ({ ...prev, location_id: "" }));
      setResult(null);
    }

    if (name === "location_id" && value) {
      const selectedLoc = locations.find(loc => loc.id === parseInt(value));
      if (selectedLoc) {
        setSelectedLocationName(selectedLoc.locality_name);
        const rLat = 26.2183 + (Math.random() - 0.5) * 0.05;
        const rLng = 78.1828 + (Math.random() - 0.5) * 0.05;
        setMapCenter([rLat, rLng]);
      }
    }
  }

  function handleReset() {
    setForm({
      ward_id: "",
      location_id: "",
      propertyType: "residential_plot_rate",
      buyerType: "Male",
      area: ""
    });
    setResult(null);
    setError("");
    setMapCenter([26.2183, 78.1828]);
    setSelectedLocationName("District Gwalior");
  }

  useEffect(() => {
    fetch(`${API}/api/wards`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setWards(d.data);
      })
      .catch(err => {
        setError("System offline. Unable to connect to government server.");
      });
  }, []);

  useEffect(() => {
    if (!form.ward_id) {
      setLocations([]);
      return;
    }
    fetch(`${API}/api/locations?ward_id=${form.ward_id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setLocations(d.data);
      })
      .catch(err => console.error("Error fetching locations:", err));
  }, [form.ward_id]);

  function calculate() {
    if (!form.location_id || !form.propertyType || !form.area) {
      setError("Incomplete form. Please fill all required fields in Steps 1 to 3.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    fetch(`${API}/api/stamp-duty/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResult(data.data);
        } else {
          setError(data.message || "Calculation failed.");
        }
      })
      .catch(err => {
        setError("Network Error: Unable to reach calculation server.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="gov-calculator-layout">
      {/* LEFT COLUMN: FORM */}
      <div className="gov-calc-form-container">
        <div className="gov-card">
          <h2 className="gov-card-title">Stamp Duty Calculator Form</h2>
          <p className="gov-card-subtitle">Fill the details below accurately to calculate duty and registration fees.</p>

          {error && <div className="gov-alert gov-alert-error">⚠ {error}</div>}

          {/* STEP 1 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num">1</span>
              <h3>Location Details</h3>
            </div>
            <div className="gov-step-body gov-grid-2">
              <div className="gov-form-group">
                <label>Ward / Tehsil <span className="req">*</span></label>
                <select name="ward_id" value={form.ward_id} onChange={handleChange}>
                  <option value="">Select Ward Number...</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.ward_number} - {w.tehsil}
                    </option>
                  ))}
                </select>
                <span className="gov-help-text">Select your registered ward</span>
              </div>
              <div className="gov-form-group">
                <label>Locality & Road <span className="req">*</span></label>
                <select name="location_id" value={form.location_id} onChange={handleChange} disabled={!form.ward_id}>
                  <option value="">Select Locality...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.locality_name}
                    </option>
                  ))}
                </select>
                <span className="gov-help-text">Choose the specific road or locality</span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num">2</span>
              <h3>Property Details</h3>
            </div>
            <div className="gov-step-body gov-grid-2">
              <div className="gov-form-group">
                <label>Property Type <span className="req">*</span></label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange}>
                  <option value="residential_plot_rate">Residential Plot (Open Land)</option>
                  <option value="commercial_plot_rate">Commercial Plot</option>
                  <option value="industrial_rate">Industrial Land</option>
                  <option value="multi_storey_res_rate">Multi-storey Residential Flat</option>
                  <option value="agricultural_irrigated_rate">Agricultural Land (Irrigated)</option>
                  <option value="agricultural_non_irrigated_rate">Agricultural Land (Non-Irrigated)</option>
                </select>
                <span className="gov-help-text">Classification of the property</span>
              </div>
              <div className="gov-form-group">
                <label>Ownership Type <span className="req">*</span></label>
                <select name="buyerType" value={form.buyerType} onChange={handleChange}>
                  <option value="Male">Male (Standard Rate)</option>
                  <option value="Female">Female (Special Concession)</option>
                  <option value="Joint">Joint (Male + Female)</option>
                </select>
                <span className="gov-help-text">Gender demographics for duty concession</span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num">3</span>
              <h3>Measurements</h3>
            </div>
            <div className="gov-step-body">
              <div className="gov-form-group" style={{ maxWidth: '50%' }}>
                <label>Total Area <span className="req">*</span></label>
                <input
                  type="number"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                />
                <span className="gov-help-text">Enter area in sq.m (or hectares for Agric.)</span>
              </div>
            </div>
          </div>

          <div className="gov-form-actions">
            <button className="gov-btn gov-btn-primary" onClick={calculate} disabled={loading}>
              {loading ? "Processing..." : "Submit & Calculate"}
            </button>
            <button className="gov-btn gov-btn-secondary" onClick={handleReset}>
              Reset Form
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAP & RESULTS */}
      <div className="gov-calc-sidebar">
        {/* RESULT CARD */}
        {result && (
          <div className="gov-card result-box">
            <div className="result-header">
              <h3>Step 4: Official Calculation Result</h3>
              <p>Financial Year: 2025-26</p>
            </div>

            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Base Guideline Rate</span>
                <span className="result-value">₹{result.ratePerUnit.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Assessed Property Value</span>
                <span className="result-value highlight">₹{result.propertyValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="result-breakdown">
              <div className="breakdown-row">
                <span>Stamp Duty ({result.stampDutyPercentage})</span>
                <span>₹{result.stampDutyAmount.toLocaleString()}</span>
              </div>
              <div className="breakdown-row">
                <span>Registration Fee ({result.registrationPercentage})</span>
                <span>₹{result.registrationAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="result-total">
              <span>Total Payable Amount</span>
              <span className="total-amount">₹{result.totalPayableAmount.toLocaleString()}</span>
            </div>

            <div className="result-actions">
              <button className="gov-btn gov-btn-outline" onClick={handlePrint}>
                🖨 Print Certificate
              </button>
              <button className="gov-btn gov-btn-outline" onClick={handlePrint}>
                ⬇ Download PDF
              </button>
            </div>
          </div>
        )}

        {/* MAP PORTAL */}
        <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="gov-map-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Geographic Information System (GIS)</h3>
              <p>Selected Parcel: <strong>{selectedLocationName}</strong></p>
            </div>
            <div className="map-view-toggle">
              <button
                onClick={() => setMapStyle('normal')}
                style={{
                  padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                  backgroundColor: mapStyle === 'normal' ? '#fff' : 'transparent',
                  color: mapStyle === 'normal' ? '#003366' : '#fff',
                  border: '1px solid #fff', borderRadius: '4px 0 0 4px',
                  fontWeight: 'bold'
                }}
              >Map</button>
              <button
                onClick={() => setMapStyle('satellite')}
                style={{
                  padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                  backgroundColor: mapStyle === 'satellite' ? '#fff' : 'transparent',
                  color: mapStyle === 'satellite' ? '#003366' : '#fff',
                  border: '1px solid #fff', borderRadius: '0 4px 4px 0',
                  fontWeight: 'bold'
                }}
              >Satellite</button>
            </div>
          </div>
          <div className="gov-map-container">
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution={mapStyle === 'satellite' ? 'Map data © Google' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                url={mapStyle === 'satellite' ? 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              />
              <Marker position={mapCenter}>
                <Popup>
                  <strong>{selectedLocationName}</strong><br />
                  Madhya Pradesh Land Records
                </Popup>
              </Marker>
              <MapRecenter lat={mapCenter[0]} lng={mapCenter[1]} />
            </MapContainer>
          </div>
        </div>

        {/* HELP DESK PANEL */}
        <div className="gov-help-panel">
          <h4>Need Assistance?</h4>
          <ul className="help-list">
            <li><a href="#">How to read guideline rates?</a></li>
            <li><a href="#">Understanding stamp duty concessions</a></li>
            <li><a href="#">Check your mutation status (Namantaran)</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
