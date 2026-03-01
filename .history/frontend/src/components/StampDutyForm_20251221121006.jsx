import { useState } from "react";
import { calculateStampDuty } from "../services/api";
import "./StampDutyForm.css";

export default function StampDutyForm() {
  const [form, setForm] = useState({
    areaType: "Urban",
    buyerType: "Male",
    propertyType: "Residential_Plot",
    ward: "Ward 01",
    areaSqm: ""
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    try {
      setError("");
      const res = await calculateStampDuty({
        ...form,
        areaSqm: Number(form.areaSqm)
      });
      setResult(res.data);
    } catch (err) {
      setError("Calculation failed. Check inputs or server.");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Stamp Duty Calculator – Gwalior</h2>

        <div className="grid">
          <div>
            <label>Area Type</label>
            <select name="areaType" onChange={handleChange}>
              <option>Urban</option>
              <option>Rural</option>
            </select>
          </div>

          <div>
            <label>Buyer Type</label>
            <select name="buyerType" onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div>
            <label>Property Type</label>
            <select name="propertyType" onChange={handleChange}>
              <option value="Residential_Plot">Residential Plot</option>
              <option value="Residential_Building">
                Residential Building
              </option>
            </select>
          </div>

          <div>
            <label>Ward</label>
            <input
              name="ward"
              value={form.ward}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Area (sq.m)</label>
            <input
              type="number"
              name="areaSqm"
              onChange={handleChange}
            />
          </div>
        </div>

        <button onClick={handleCalculate}>Calculate</button>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <p>Rate / sq.m: ₹{result.ratePerSqm}</p>
            <p>Property Value: ₹{result.propertyValue}</p>
            <p>
              Stamp Duty ({result.dutyRate}%): <b>₹{result.stampDuty}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
