import { useState } from "react";
import StampDutyForm from "./components/StampDutyForm";
import CompareTool from "./components/CompareTool";
import AdminPanel from "./components/AdminPanel";
import Chatbot from "./components/Chatbot";
import { useLanguage } from "./context/LanguageContext";

function App() {
  const [view, setView] = useState("calculator");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang, toggleLanguage } = useLanguage();

  const handleNavClick = (v) => {
    setView(v);
    setMenuOpen(false); // Close mobile menu on click
  };

  return (
    <div className="gov-app-container flex flex-col min-h-screen">
      {/* HEADER SECTION */}
      <header className="gov-header-section bg-[#003366] text-white">
        <div className="gov-header-top flex flex-col md:flex-row justify-between items-center px-4 py-4 max-w-7xl mx-auto w-full text-center md:text-left gap-4 md:gap-0">
          <div className="header-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="header-title text-2xl md:text-3xl font-bold m-0 tracking-wide">{t('title')}</h1>
              <button
                onClick={toggleLanguage}
                className="bg-white text-[#003366] text-xs font-bold px-2 py-1 rounded shadow cursor-pointer hover:bg-gray-100 transition"
              >
                {lang === 'en' ? 'A / अ' : 'अ / A'}
              </button>
            </div>
            <p className="header-subtitle text-xs md:text-sm text-[#aecceb] uppercase mt-1 tracking-wider">{t('subtitle')}</p>
          </div>
          <div className="header-right md:text-right">
            <h2 className="header-org text-lg md:text-xl font-semibold m-0">{t('org')}</h2>
            <p className="header-dept text-xs md:text-sm text-[#aecceb] mt-1">{t('dept')}</p>
          </div>
        </div>
        <div className="gov-header-border h-1 bg-[#ff9933] w-full"></div>
      </header>

      {/* NAVIGATION MENU */}
      <nav className="gov-navbar bg-white border-b border-gray-300 shadow-sm relative z-40">
        <div className="nav-container max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:gap-0">

          {/* Mobile hamburger toggle */}
          <div className="md:hidden flex justify-between items-center py-3 w-full border-b border-gray-200">
            <span className="font-bold text-[#003366]">{t('menuNav')}</span>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#003366] p-1 border border-[#003366] rounded cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>

          <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto absolute md:relative top-full left-0 bg-white md:bg-transparent shadow-md md:shadow-none border-b md:border-none border-gray-200`}>
            {['calculator', 'compare', 'guideline', 'admin', 'help', 'about'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`nav-link text-left md:text-center px-5 py-3 md:py-3.5 border-b md:border-b-[3px] md:border-transparent ${view === item ? 'active font-bold text-[#003366] md:border-[#ff9933]' : 'text-[#003366]'}`}
              >
                {t(item)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="gov-main-content flex-1 w-full max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
        {view === "calculator" && <StampDutyForm />}
        {view === "compare" && <CompareTool />}
        {view === "guideline" && <div className="gov-card"><h3>{t('guideline')}</h3><p>{t('comingSoon')}</p></div>}
        {view === "admin" && <AdminPanel />}
        {view === "help" && <div className="gov-card"><h3>{t('helpCen')}</h3><p>{t('helpDesc')}</p></div>}
        {view === "about" && <div className="gov-card"><h3>{t('about')} {t('title')}</h3><p>{t('aboutDesc')}</p></div>}
      </main>

      {/* FOOTER SECTION */}
      <footer className="gov-footer-section bg-[#1f2937] text-white py-6 px-4 border-t-4 border-[#003366] mt-auto">
        <div className="footer-content max-w-7xl mx-auto text-center">
          <p className="disclaimer text-sm text-gray-300 mb-2">
            <strong>{t('discBold')}</strong> {t('discText')}
          </p>
          <p className="copyright text-xs text-gray-400 m-0">{t('copyText')}</p>
        </div>
      </footer>

      {/* FLOATING CHATBOT */}
      <Chatbot />
    </div>
  );
}

export default App;
