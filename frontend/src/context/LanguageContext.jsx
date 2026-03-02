import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // Header
        title: "BHUMI SURE",
        subtitle: "Public utility for informational purposes",
        org: "Madhya Pradesh Stamp Duty Calculator (2025-26)",
        dept: "Government style public information portal",
        // Nav 
        calculator: "Stamp Duty Calculator",
        compare: "Compare Locations",
        guideline: "Guideline Rates",
        admin: "Admin Panel",
        help: "Help",
        about: "About",
        // Form
        formTitle: "Stamp Duty Calculator Form",
        formSubtitle: "Fill the details below accurately to calculate duty and registration fees.",
        step1: "Location Details",
        wardLbl: "Ward / Tehsil",
        wardPlaceholder: "-- Select Ward Number --",
        wardHelp: "Select your registered ward",
        locLbl: "Locality & Road",
        locPlaceholder: "-- Select Locality --",
        locHelp: "Choose the specific road or locality",
        step2: "Property Details",
        propTypeLbl: "Property Type",
        propOp1: "Residential Plot (Open Land)",
        propOp2: "Commercial Plot",
        propOp3: "Industrial Land",
        propOp4: "Multi-storey Residential Flat",
        propOp5: "Agricultural Land (Irrigated)",
        propOp6: "Agricultural Land (Non-Irrigated)",
        propHelp: "Classification of the property",
        ownGrpLbl: "Ownership Type",
        ownOp1: "Male (Standard Rate)",
        ownOp2: "Female (Special Concession)",
        ownOp3: "Joint (Male + Female)",
        ownHelp: "Gender demographics for duty concession",
        step3: "Measurements",
        areaLbl: "Total Area",
        areaPlaceholder: "e.g. 1500",
        areaHelp: "Enter area in sq.m (or hectares for Agric.)",
        submitBtn: "Submit & Calculate",
        processingBtn: "Processing...",
        resetBtn: "Reset Form",
        errFillAll: "Incomplete form. Please fill all required fields in Steps 1 to 3.",
        calcFailed: "Calculation failed.",
        sysOffline: "System offline. Unable to connect to government server.",
        netErr: "Network Error: Unable to reach calculation server.",
        // Results
        resTitle: "Step 4: Official Calculation Result",
        resYear: "Financial Year: 2025-26",
        resBaseRate: "Base Guideline Rate",
        resPropVal: "Assessed Property Value",
        resStamp: "Stamp Duty",
        resReg: "Registration Fee",
        resTotal: "Total Payable Amount",
        printBtn: "🖨 Print Certificate",
        downBtn: "⬇ Download PDF",
        // Map
        gisTitle: "Geographic Information System (GIS)",
        selParcel: "Selected Parcel:",
        mapBtn: "Map",
        satBtn: "Satellite",
        // Compare
        cmpHeader: "Compare Location Rates",
        locA: "Property Location A",
        locB: "Property Location B",
        vs: "VS",
        cmpAnalysis: "Analysis",
        resPlots: "Residential plots in",
        comPlots: "Commercial plots in",
        are: "are",
        compared: "compared to",
        moreExp: "more expensive",
        cheaper: "cheaper",
        circRates: "Circle Rates (per sq.m)",
        resPlot: "Residential Plot:",
        comPlot: "Commercial Plot:",
        indPlot: "Industrial Plot:",
        msRes: "Multi-storey Residential:",
        msCom: "Multi-storey Commercial:",
        agriIrr: "Agricultural Irrigated (per Ha):",
        // Admin
        adminCtrl: "Admin Control Panel",
        updRates: "Update Guideline Rates",
        adDesc: "Trigger the backend parse engine to read the uploaded Madhya Pradesh Guideline PDF (FY 2025-26) and populate the PostgreSQL/SQLite database.",
        adBtn: "Trigger Database Seed from PDF",
        adBtnLoad: "Parsing 251 pages... Please wait",
        adRes: "Result:",
        // Misc
        menuNav: "Menu Navigation",
        comingSoon: "Guideline search coming soon...",
        helpDesc: "Information on how to use the calculator...",
        helpCen: "Help Center",
        aboutDesc: "Not an official government website. This is a public utility tool.",
        discBold: "Disclaimer:",
        discText: "This is a public utility tool for informational purposes only. Not an official government website.",
        copyText: "© 2025-26 Madhya Pradesh Property Guidelines. All rights reserved."
    },
    hi: {
        // Header
        title: "भूमि श्योर (BHUMI SURE)",
        subtitle: "सूचनात्मक उद्देश्यों के लिए सार्वजनिक उपयोगिता",
        org: "मध्य प्रदेश स्टाम्प ड्यूटी कैलकुलेटर (2025-26)",
        dept: "सरकारी शैली सार्वजनिक सूचना पोर्टल",
        // Nav 
        calculator: "स्टाम्प ड्यूटी कैलकुलेटर",
        compare: "स्थानों की तुलना",
        guideline: "गाइडलाइन दरें",
        admin: "एडमिन पैनल",
        help: "मदद",
        about: "हमारे बारे में",
        // Form
        formTitle: "स्टाम्प ड्यूटी कैलकुलेटर फॉर्म",
        formSubtitle: "ड्यूटी और पंजीकरण शुल्क की गणना करने के लिए नीचे दिए गए विवरण सटीक रूप से भरें।",
        step1: "स्थान विवरण",
        wardLbl: "वार्ड / तहसील",
        wardPlaceholder: "-- वार्ड नंबर चुनें --",
        wardHelp: "अपना पंजीकृत वार्ड चुनें",
        locLbl: "मोहल्ला और सड़क",
        locPlaceholder: "-- मोहल्ला चुनें --",
        locHelp: "विशिष्ट सड़क या मोहल्ला चुनें",
        step2: "संपत्ति विवरण",
        propTypeLbl: "संपत्ति का प्रकार",
        propOp1: "आवासीय भूखंड (खुली भूमि)",
        propOp2: "व्यावसायिक भूखंड",
        propOp3: "औद्योगिक भूमि",
        propOp4: "बहुमंजिला आवासीय फ्लैट",
        propOp5: "कृषि भूमि (सिंचित)",
        propOp6: "कृषि भूमि (असिंचित)",
        propHelp: "संपत्ति का वर्गीकरण दर निर्धारित करने के लिए",
        ownGrpLbl: "स्वामित्व का प्रकार",
        ownOp1: "पुरुष (मानक दर)",
        ownOp2: "महिला (विशेष छूट)",
        ownOp3: "संयुक्त (पुरुष + महिला)",
        ownHelp: "छूट के लिए जेंडर आधारित जानकारी",
        step3: "मापन (क्षेत्रफल)",
        areaLbl: "कुल क्षेत्रफल",
        areaPlaceholder: "जैसे 1500",
        areaHelp: "क्षेत्रफल वर्ग मीटर (sq.m) में दर्ज करें (कृषि के लिए हेक्टेयर)",
        submitBtn: "सबमिट और गणना करें",
        processingBtn: "प्रोसेस हो रहा है...",
        resetBtn: "फॉर्म रीसेट करें",
        errFillAll: "अपूर्ण फॉर्म। कृपया चरण 1 से 3 तक सभी आवश्यक फ़ील्ड भरें।",
        calcFailed: "गणना विफल रही।",
        sysOffline: "सिस्टम ऑफ़लाइन। सरकारी सर्वर से कनेक्ट करने में असमर्थ।",
        netErr: "नेटवर्क त्रुटि: गणना सर्वर तक पहुँचने में असमर्थ।",
        // Results
        resTitle: "चरण 4: आधिकारिक गणना परिणाम",
        resYear: "वित्तीय वर्ष: 2025-26",
        resBaseRate: "आधार गाइडलाइन दर",
        resPropVal: "आकलित संपत्ति मूल्य",
        resStamp: "स्टाम्प ड्यूटी",
        resReg: "पंजीकरण शुल्क",
        resTotal: "कुल देय राशि",
        printBtn: "🖨 प्रमाण पत्र प्रिंट करें",
        downBtn: "⬇ पीडीएफ डाउनलोड करें",
        // Map
        gisTitle: "भौगोलिक सूचना प्रणाली (GIS)",
        selParcel: "चयनित पार्सल:",
        mapBtn: "नक्शा",
        satBtn: "सैटेलाइट",
        // Compare
        cmpHeader: "स्थानों की दरों की तुलना करें",
        locA: "संपत्ति स्थान A",
        locB: "संपत्ति स्थान B",
        vs: "बनाम",
        cmpAnalysis: "विश्लेषण",
        resPlots: "में आवासीय भूखंड",
        comPlots: "में व्यावसायिक भूखंड",
        are: "स्थान B की तुलना में",
        compared: "हैं।",
        moreExp: "अधिक महंगे",
        cheaper: "सस्ते",
        circRates: "सर्कल रेट (प्रति वर्ग मीटर)",
        resPlot: "आवासीय भूखंड:",
        comPlot: "व्यावसायिक भूखंड:",
        indPlot: "औद्योगिक भूखंड:",
        msRes: "बहुमंजिला आवासीय:",
        msCom: "बहुमंजिला व्यावसायिक:",
        agriIrr: "कृषि सिंचित (प्रति हेक्टेयर):",
        // Admin
        adminCtrl: "एडमिन कंट्रोल पैनल",
        updRates: "गाइडलाइन दरें अपडेट करें",
        adDesc: "प्रदान की गई मध्य प्रदेश गाइडलाइन पीडीएफ (वित्तीय वर्ष 2025-26) को पढ़ने और PostgreSQL/SQLite डेटाबेस को आबाद करने के लिए बैकएंड इंजन को ट्रिगर करें।",
        adBtn: "पीडीएफ से डेटाबेस सीड करें",
        adBtnLoad: "251 पृष्ठों को पार्स किया जा रहा है... कृपया प्रतीक्षा करें",
        adRes: "परिणाम:",
        // Misc
        menuNav: "मेन्यू नेविगेशन",
        comingSoon: "गाइडलाइन खोज जल्द आ रही है...",
        helpDesc: "कैलकुलेटर का उपयोग करने के तरीके की जानकारी...",
        helpCen: "सहायता केंद्र",
        aboutDesc: "यह कोई आधिकारिक सरकारी वेबसाइट नहीं है। यह एक सार्वजनिक उपयोगिता उपकरण है।",
        discBold: "अस्वीकरण:",
        discText: "यह केवल सूचनात्मक उद्देश्यों के लिए एक सार्वजनिक उपयोगिता उपकरण है। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है।",
        copyText: "© 2025-26 मध्य प्रदेश संपत्ति दिशानिर्देश। सर्वाधिकार सुरक्षित।"
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('en');

    const toggleLanguage = () => {
        setLang(prev => (prev === 'en' ? 'hi' : 'en'));
    };

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
