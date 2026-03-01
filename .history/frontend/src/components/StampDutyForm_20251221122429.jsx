import { useState, useEffect } from "react";
import "./StampDutyForm.css";

const API = "http://localhost:4000";

export default function StampDuty() {
  const [form, setForm] = useState({
    areaType: "",
    propertyType: "Residential",
    buyerCategory: "Male",
    areaSqm: ""
  });

  /* ===== URBAN ===== */
  const [wards, setWards] = useState([]);
  const [ward, setWard] = useState("");
  const [colonies, setColonies] = useState([]);
  const [colony, setColony] = useState("");

  /* ===== RURAL ===== */
  const [tehsils, setTehsils] = useState([]);
  const [tehsil, setTehsil] = useState("");
  const [halkas, setHalkas] = useState([]);
  const [halka, setHalka] = useState("");
  const [villages, setVillages] = useState([]);
  const [village, setVillage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ===== AREA TYPE CHANGE ===== */
  useEffect(() => {
    setWard("");
    setColony("");
    setTehsil("");
    setHalka("");
    setVillage("");
    setError("");

    if (form.areaType === "Urban") {
      fetch(`${API}/api/wards?city=Gwalior`)
        .then(r => r.json())
        .then(d => setWards(d || []));
    }

    if (form.areaType === "Rural") {
      fetch(`${API}/api/tehsils?city=Gwalior`)
        .then(r => r.json())
        .then(d => setTehsils(d || []));
    }
  }, [form.areaType]);

  /* ===== URBAN ===== */
  useEffect(() => {
    if (!ward) return;
    fetch(`${API}/api/colonies?city=Gwalior&ward=${ward}`)
      .then(r => r.json())
      .then(d => setColonies(d || []));
  }, [ward]);

  /* ===== RURAL ===== */
  useEffect(() => {
    if (!tehsil) return;
    fetch(`${API}/api/halkas?city=Gwalior&tehsil=${tehsil}`)
      .then(r => r.json())
      .then(d => setHalkas(d || []));
  }, [tehsil]);

  useEffect(() => {
    if (!halka) return;
    fetch(
      `${API}/api/villages?city=Gwalior&tehsil=${tehsil}&halka=${halka}`
    )
      .then(r => r.json())
      .then(d => setVillages(d || []));
  }, [halka]);

  /* ===== FRONT PAGE CALCULATE (NO RESULT YET) ===== */
  function calculate() {
    if (
      !form.areaType ||
      (form.areaType === "Urban" && (!ward || !colony)) ||
      (form.areaType === "Rural" && (!tehsil || !halka || !village))
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setError("");
    alert("Front page validated ✔ (Next: calculation section)");
  }

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <strong>BHUMI SURE</strong>
        <span className="sub-title">
          Madhya Pradesh Stamp Duty Calculator
        </span>
      </header>

      {/* NOTICE */}
      <div className="notice">
        Public utility for informational purposes only.
      </div>

      {/* MAIN CONTAINER */}
      <div className="container">
        <div className="card">
          <h2 className="page-title">Property Details</h2>
          <hr className="divider" />

          <div className="form-grid">
            {/* AREA TYPE */}
            <div className="form-group">
              <label>Area Type</label>
              <select name="areaType" onChange={handleChange}>
                <option value="">Select</option>
                <option value="Urban">Urban (Nagariya)</option>
                <option value="Rural">Rural (Gramin)</option>
              </select>
            </div>

            {/* PROPERTY TYPE */}
            <div className="form-group">
              <label>Property Type</label>
              <select name="propertyType" onChange={handleChange}>
                <option value="Residential">Residential</option>
              </select>
            </div>

            {/* BUYER */}
            <div className="form-group">
              <label>Buyer Category</label>
              <select name="buyerCategory" onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* URBAN */}
            {form.areaType === "Urban" && (
              <>
                <div className="form-group">
                  <label>Ward</label>
                  <select onChange={e => setWard(e.target.value)}>
                    <option value="">Select</option>
                    {wards.map(w => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {ward && (
                  <div className="form-group">
                    <label>Colony</label>
                    <select onChange={e => setColony(e.target.value)}>
                      <option value="">Select</option>
                      {colonies.map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* RURAL */}
            {form.areaType === "Rural" && (
              <>
                <div className="form-group">
                  <label>Tehsil</label>
                  <select onChange={e => setTehsil(e.target.value)}>
                    <option value="">Select</option>
                    {tehsils.map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {tehsil && (
                  <div className="form-group">
                    <label>Halka</label>
                    <select onChange={e => setHalka(e.target.value)}>
                      <option value="">Select</option>
                      {halkas.map(h => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                )}

                {halka && (
                  <div className="form-group">
                    <label>Village</label>
                    <select onChange={e => setVillage(e.target.value)}>
                      <option value="">Select</option>
                      {villages.map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          {/* BUTTON */}
          <button className="calc-btn" onClick={calculate} disabled={loading}>
            {loading ? "Please wait..." : "Calculate Stamp Duty"}
          </button>

          {error && <p className="error">⚠ {error}</p>}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        © BHUMI SURE | MP Stamp Duty Public Utility (Prototype)
      </footer>
    </>
  );
}
