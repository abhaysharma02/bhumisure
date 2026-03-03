import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./StampDutyForm.css";
import { useLanguage } from "../context/LanguageContext";

// Helper component to recenter map when location changes
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function StampDuty() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    ward_id: "",
    location_id: "",
    propertyType: "residential_plot_rate",
    buyerType: "Male",
    area: ""
  });

  const [wards, setWards] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Default coordinate (Gwalior)
  const [mapCenter, setMapCenter] = useState([26.2183, 78.1828]);
  const [selectedLocationName, setSelectedLocationName] = useState("Location Selected");
  const [mapStyle, setMapStyle] = useState("satellite");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "ward_id") {
      // With the new structure, we rely mostly on location search, but keep ward for completeness
      setForm((prev) => ({ ...prev, location_id: "" }));
      setResult(null);
    }

    if (name === "location_id" && value) {
      const selectedLoc = locations.find(loc => loc.id === parseInt(value) || loc.id === value);
      if (selectedLoc) {
        setSelectedLocationName(selectedLoc.location);
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
    setSelectedLocationName("Location Selected");
  }

  useEffect(() => {
    fetch(`${API}/api/wards`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setWards(d.data);
      })
      .catch(err => {
        setError(t('sysOffline'));
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let url = `${API}/api/rates?`;

      if (form.ward_id) {
        url += `ward=${encodeURIComponent(form.ward_id)}&`;
      }

      if (searchTerm) {
        url += `location=${encodeURIComponent(searchTerm)}`;
      }

      // If user hasn't typed anything and hasn't selected a ward, just fetch some defaults
      if (!searchTerm && !form.ward_id) {
        return setLocations([]);
      }

      fetch(url)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setLocations(d.data);
          }
        })
        .catch(err => console.error("Error fetching locations:", err));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, form.ward_id]);

  function calculate() {
    if (!form.location_id || !form.propertyType || !form.area) {
      setError(t('errFillAll'));
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
          setError(data.message || t('calcFailed'));
        }
      })
      .catch(err => {
        setError(t('netErr'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="gov-calculator-layout grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start w-full">
      {/* LEFT COLUMN: FORM */}
      <div className="gov-calc-form-container w-full">
        <div className="gov-card">
          <h2 className="gov-card-title text-xl md:text-2xl">{t('formTitle')}</h2>
          <p className="gov-card-subtitle text-sm">{t('formSubtitle')}</p>

          {error && <div className="gov-alert gov-alert-error">⚠ {error}</div>}

          {/* STEP 1 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num flex-shrink-0">1</span>
              <h3 className="text-base md:text-lg">{t('step1')}</h3>
            </div>
            <div className="gov-step-body grid grid-cols-1 md:grid-cols-2 gap-5 p-4 md:p-5 bg-white">
              <div className="gov-form-group">
                <label>{t('wardLbl')} <span className="req">*</span></label>
                <select name="ward_id" value={form.ward_id} onChange={handleChange}>
                  <option value="">{t('wardPlaceholder')}</option>
                  {wards.map((w, index) => (
                    <option key={index} value={w.ward}>
                      {w.ward}
                    </option>
                  ))}
                </select>
                <span className="gov-help-text">{t('wardHelp')}</span>
              </div>
              <div className="gov-form-group">
                <label>{t('locLbl')} <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="Search Location (e.g. A.B. Road)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2 p-2 border border-gray-300 rounded w-full"
                />
                <select name="location_id" value={form.location_id} onChange={handleChange} disabled={locations.length === 0}>
                  <option value="">{t('locPlaceholder')}</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} (Ward: {loc.ward})
                    </option>
                  ))}
                </select>
                <span className="gov-help-text">{t('locHelp')}</span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num flex-shrink-0">2</span>
              <h3 className="text-base md:text-lg">{t('step2')}</h3>
            </div>
            <div className="gov-step-body grid grid-cols-1 md:grid-cols-2 gap-5 p-4 md:p-5 bg-white">
              <div className="gov-form-group">
                <label>{t('propTypeLbl')} <span className="req">*</span></label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange}>
                  <option value="residential_plot_rate">{t('propOp1')}</option>
                  <option value="commercial_plot_rate">{t('propOp2')}</option>
                  <option value="industrial_rate">{t('propOp3')}</option>
                  <option value="multi_storey_res_rate">{t('propOp4')}</option>
                  <option value="agricultural_irrigated_rate">{t('propOp5')}</option>
                  <option value="agricultural_non_irrigated_rate">{t('propOp6')}</option>
                </select>
                <span className="gov-help-text">{t('propHelp')}</span>
              </div>
              <div className="gov-form-group">
                <label>{t('ownGrpLbl')} <span className="req">*</span></label>
                <select name="buyerType" value={form.buyerType} onChange={handleChange}>
                  <option value="Male">{t('ownOp1')}</option>
                  <option value="Female">{t('ownOp2')}</option>
                  <option value="Joint">{t('ownOp3')}</option>
                </select>
                <span className="gov-help-text">{t('ownHelp')}</span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="gov-step">
            <div className="gov-step-header">
              <span className="gov-step-num flex-shrink-0">3</span>
              <h3 className="text-base md:text-lg">{t('step3')}</h3>
            </div>
            <div className="gov-step-body p-4 md:p-5 bg-white">
              <div className="gov-form-group w-full md:w-1/2">
                <label>{t('areaLbl')} <span className="req">*</span></label>
                <input
                  type="number"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder={t('areaPlaceholder')}
                />
                <span className="gov-help-text">{t('areaHelp')}</span>
              </div>
            </div>
          </div>

          <div className="gov-form-actions flex flex-col sm:flex-row gap-3 mt-6">
            <button className="gov-btn gov-btn-primary w-full sm:w-auto" onClick={calculate} disabled={loading}>
              {loading ? t('processingBtn') : t('submitBtn')}
            </button>
            <button className="gov-btn gov-btn-secondary w-full sm:w-auto" onClick={handleReset}>
              {t('resetBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAP & RESULTS */}
      <div className="gov-calc-sidebar w-full">
        {/* RESULT CARD */}
        {result && (
          <div className="gov-card result-box">
            <div className="result-header">
              <h3>{t('resTitle')}</h3>
              <p>{t('resYear')}</p>
            </div>

            <div className="result-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="result-item p-4 border border-gray-300 rounded bg-white flex flex-col">
                <span className="result-label text-xs text-gray-500 mb-2 uppercase">{t('resBaseRate')}</span>
                <span className="result-value text-lg md:text-xl font-bold">₹{result.ratePerUnit.toLocaleString()}</span>
              </div>
              <div className="result-item p-4 border border-gray-300 rounded bg-white flex flex-col">
                <span className="result-label text-xs text-gray-500 mb-2 uppercase">{t('resPropVal')}</span>
                <span className="result-value highlight text-lg md:text-xl font-bold text-[#003366]">₹{result.propertyValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="result-breakdown">
              <div className="breakdown-row">
                <span>{t('resStamp')} ({result.stampDutyPercentage})</span>
                <span>₹{result.stampDutyAmount.toLocaleString()}</span>
              </div>
              <div className="breakdown-row">
                <span>{t('resReg')} ({result.registrationPercentage})</span>
                <span>₹{result.registrationAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="result-total bg-[#003366] text-white p-4 md:p-5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2 sm:gap-0">
              <span className="text-base font-semibold">{t('resTotal')}</span>
              <span className="total-amount text-2xl md:text-3xl font-bold">₹{result.totalPayableAmount.toLocaleString()}</span>
            </div>

            <div className="result-actions flex flex-col sm:flex-row gap-3">
              <button className="gov-btn gov-btn-outline w-full sm:w-auto" onClick={handlePrint}>
                {t('printBtn')}
              </button>
              <button className="gov-btn gov-btn-outline w-full sm:w-auto" onClick={handlePrint}>
                {t('downBtn')}
              </button>
            </div>
          </div>
        )}

        {/* MAP PORTAL */}
        <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="gov-map-header bg-[#1f2937] text-white p-4 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0">
            <div>
              <h3 className="m-0 text-base">{t('gisTitle')}</h3>
              <p className="m-0 text-sm text-gray-300">{t('selParcel')} <strong>{selectedLocationName}</strong></p>
            </div>
            <div className="map-view-toggle flex mt-2 xs:mt-0">
              <button
                onClick={() => setMapStyle('normal')}
                style={{
                  padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                  backgroundColor: mapStyle === 'normal' ? '#fff' : 'transparent',
                  color: mapStyle === 'normal' ? '#003366' : '#fff',
                  border: '1px solid #fff', borderRadius: '4px 0 0 4px',
                  fontWeight: 'bold'
                }}
              >{t('mapBtn')}</button>
              <button
                onClick={() => setMapStyle('satellite')}
                style={{
                  padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                  backgroundColor: mapStyle === 'satellite' ? '#fff' : 'transparent',
                  color: mapStyle === 'satellite' ? '#003366' : '#fff',
                  border: '1px solid #fff', borderRadius: '0 4px 4px 0',
                  fontWeight: 'bold'
                }}
              >{t('satBtn')}</button>
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
