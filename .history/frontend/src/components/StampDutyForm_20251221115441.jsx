import { useState } from "react";
import { calculateStampDuty } from "../services/api";
import "./StampDutyForm.css";

export default function StampDutyForm() {
  const [form, setForm] = useState({
    areaType: "Urban",
    city: "Gwalior",
    ward: "Ward 1",
    colony: "A.B. Road",
    buyerType: "Male",
    propertyType: "Residential",
    areaSqm: 92
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    try {
      setError("");
      const res = await calculateStampDuty(form);
      setResult(res.data);
    } catch (err) {
      setError("Internal Server Error");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        IN BHUMI SURE – MP Stamp Duty Calculator
      </div>

      {/* Info strip */}
      <div className="info-strip">
        Public utility for informational purposes only.
      </div>

      {/* Main Card */}
      <div className="container">
        <div className="card">
          <h3>Property Details</h3>
          <hr />

          <div className="grid">
            <div>
              <label>Area Type</label>
              <select name="areaType" onChange={handleChange}>
                <option value="Urban">Urban (Nagariya)</option>
                <option value="Rural">Rural (Gramin)</option>
              </select>
            </div>

            <div>
              <label>City</label>
              <select name="city" onChange={handleChange}>
                <option>Gwalior</option>
              </select>
            </div>

            <div>
              <label>Ward</label>
              <select name="ward" onChange={handleChange}>
                <option>Ward 1</option>
              </select>
            </div>

            <div>
              <label>Colony</label>
              <select name="colony" onChange={handleChange}>
                <option>A.B. Road</option>
              </select>
            </div>

            <div>
              <label>Buyer Category</label>
              <select name="buyerType" onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label>Property Type</label>
              <select name="propertyType" onChange={handleChange}>
                <option>Residential</option>
              </select>
            </div>

            <div>
              <label>Area (sq. meter)</label>
              <input
                type="number"
                name="areaSqm"
                value={form.areaSqm}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="calc-btn" onClick={handleCalculate}>
            Calculate Stamp Duty
          </button>

          {error && <p className="error">{error}</p>}

          {result && (
            <div className="result">
              <p><b>Stamp Duty:</b> ₹{result.stampDuty}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        © BHUMI SURE | MP Stamp Duty Public Utility (Prototype)
      </div>
    </>
  );
}
