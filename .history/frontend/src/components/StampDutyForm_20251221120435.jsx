import { useState, useEffect } from "react";
import "./StampDuty.css";

const API = "http://localhost:4000";

export default function StampDuty() {
  const [form, setForm] = useState({
    state: "MP",
    district: "Gwalior",
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

  const [result, setResult] = useState(null);
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
    setResult(null);
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

  /* ===== CALCULATE ===== */
  async function calculate() {
    setError("");
    setResult(null);

    if (
      !form.areaType ||
      !form.areaSqm ||
      Number(form.areaSqm) <= 0 ||
      (form.areaType === "Urban" && (!ward || !colony)) ||
      (form.areaType === "Rural" && (!tehsil || !halka || !village))
    ) {
      setError("Please complete all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/stamp-duty/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaType: form.areaType,
          buyerType: form.buyerCategory,
          propertyType:
            form.propertyType === "Residential"
              ? "Residential_Plot"
              : form.propertyType,
          ward: form.areaType === "Urban" ? ward : undefined,
          areaSqm: Number(form.areaSqm)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        IN BHUMI SURE – MP Stamp Duty Calculator
      </header>

      <div className="notice">
        Public utility for informational purposes only.
      </div>

      <div className="container">
        <div className="card">
          <h2>Property Details</h2>

          <div className="form-grid">
            <div>
              <label>Area Type</label>
              <select name="areaType" onChange={handleChange}>
                <option value="">Select</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div>
              <label>Property Type</label>
              <select name="propertyType" onChange={handleChange}>
                <option value="Residential">Residential</option>
              </select>
            </div>

            <div>
              <label>Buyer Category</label>
              <select name="buyerCategory" onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {form.areaType === "Urban" && (
              <>
                <div>
                  <label>Ward</label>
                  <select onChange={e => setWard(e.target.value)}>
                    <option value="">Select</option>
                    {wards.map(w => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {ward && (
                  <div>
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

            {form.areaType === "Rural" && (
              <>
                <div>
                  <label>Tehsil</label>
                  <select onChange={e => setTehsil(e.target.value)}>
                    <option value="">Select</option>
                    {tehsils.map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {tehsil && (
                  <div>
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
                  <div>
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

            {(colony || village) && (
              <div>
                <label>Area (sq. meter)</label>
                <input
                  type="number"
                  name="areaSqm"
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <button onClick={calculate} disabled={loading}>
            {loading ? "Calculating..." : "Calculate Stamp Duty"}
          </button>

          {error && <p className="error">⚠ {error}</p>}
        </div>

        {result && (
          <div className="card">
            <h2>Calculation Result</h2>
            <p>
              <b>Stamp Duty:</b> ₹ {result.stampDuty.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <footer className="footer">
        © BHUMI SURE | MP Stamp Duty Public Utility (Prototype)
      </footer>
    </>
  );
}
