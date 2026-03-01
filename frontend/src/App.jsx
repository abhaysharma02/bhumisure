import { useState } from "react";
import StampDutyForm from "./components/StampDutyForm";
import CompareTool from "./components/CompareTool";
import AdminPanel from "./components/AdminPanel";
import Chatbot from "./components/Chatbot";

function App() {
  const [view, setView] = useState("calculator");

  return (
    <div className="gov-app-container">
      {/* HEADER SECTION */}
      <header className="gov-header-section">
        <div className="gov-header-top">
          <div className="header-left">
            <h1 className="header-title">BHUMI SURE</h1>
            <p className="header-subtitle">Public utility for informational purposes</p>
          </div>
          <div className="header-right">
            <h2 className="header-org">Madhya Pradesh Stamp Duty Calculator (2025-26)</h2>
            <p className="header-dept">Government style public information portal</p>
          </div>
        </div>
        <div className="gov-header-border"></div>
      </header>

      {/* NAVIGATION MENU */}
      <nav className="gov-navbar">
        <div className="nav-container">
          <button onClick={() => setView("calculator")} className={`nav-link ${view === "calculator" ? "active" : ""}`}>
            Stamp Duty Calculator
          </button>
          <button onClick={() => setView("compare")} className={`nav-link ${view === "compare" ? "active" : ""}`}>
            Compare Locations
          </button>
          <button onClick={() => setView("guideline")} className={`nav-link ${view === "guideline" ? "active" : ""}`}>
            Guideline Rates
          </button>
          <button onClick={() => setView("admin")} className={`nav-link ${view === "admin" ? "active" : ""}`}>
            Admin Panel
          </button>
          <button onClick={() => setView("help")} className={`nav-link ${view === "help" ? "active" : ""}`}>
            Help
          </button>
          <button onClick={() => setView("about")} className={`nav-link ${view === "about" ? "active" : ""}`}>
            About
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="gov-main-content">
        {view === "calculator" && <StampDutyForm />}
        {view === "compare" && <CompareTool />}
        {view === "guideline" && <div className="gov-card"><h3>Guideline Rates</h3><p>Guideline search coming soon...</p></div>}
        {view === "admin" && <AdminPanel />}
        {view === "help" && <div className="gov-card"><h3>Help Center</h3><p>Information on how to use the calculator...</p></div>}
        {view === "about" && <div className="gov-card"><h3>About BHUMI SURE</h3><p>Not an official government website. This is a public utility tool.</p></div>}
      </main>

      {/* FOOTER SECTION */}
      <footer className="gov-footer-section">
        <div className="footer-content">
          <p className="disclaimer">
            <strong>Disclaimer:</strong> This is a public utility tool for informational purposes only. Not an official government website.
          </p>
          <p className="copyright">© 2025-26 Madhya Pradesh Property Guidelines. All rights reserved.</p>
        </div>
      </footer>

      {/* FLOATING CHATBOT */}
      <Chatbot />
    </div>
  );
}

export default App;
