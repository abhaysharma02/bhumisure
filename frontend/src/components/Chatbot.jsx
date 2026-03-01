import { useState } from "react";
import "./Chatbot.css";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="gov-chatbot-container">
            {isOpen && (
                <div className="gov-chatbot-window">
                    <div className="chatbot-header">
                        <h4>Ask Bhumi AI</h4>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    <div className="chatbot-messages">
                        <div className="msg bot-msg">
                            Namaskar! I am Bhumi AI, your official assistant for the MP Stamp Duty portal. How can I help you today?
                        </div>
                        <div className="msg bot-msg">
                            <strong>Quick Topics:</strong>
                            <ul>
                                <li>How to calculate stamp duty?</li>
                                <li>What is a guideline rate?</li>
                                <li>How to find my Ward number?</li>
                            </ul>
                        </div>
                    </div>
                    <div className="chatbot-input">
                        <input type="text" placeholder="Type your question..." />
                        <button>Send</button>
                    </div>
                </div>
            )}

            <button className="gov-chatbot-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "Close AI Help" : "Ask Bhumi AI"}
            </button>
        </div>
    );
}
