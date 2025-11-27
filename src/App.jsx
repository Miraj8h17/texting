import React, { useState, useEffect } from "react";
import ImessageUI from "./components/ImessageUI";
import WhatsappUI from "./components/WhatsappUI";
import SnapchatUI from "./components/SnapchatUI";

export default function App() {
  const [template, setTemplate] = useState("iMessage");
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [newMessageFrom, setNewMessageFrom] = useState("me");

  // Customization options
  const [contactName, setContactName] = useState("John Doe");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showStatusIndicators, setShowStatusIndicators] = useState(true);
  const [timeFormat, setTimeFormat] = useState("12h"); // "12h" or "24h"

  // Auto-scroll when messages change
  useEffect(() => {
    setTimeout(() => {
      const chatArea = document.querySelector(".chat-area");
      if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }, 10);
  }, [messages]);

  const handleAddMessage = () => {
    if (!newMessageText.trim()) return;
    const now = new Date();
    setMessages(prev => [...prev, {
      from: newMessageFrom,
      text: newMessageText,
      time: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: timeFormat === '12h'
      })
    }]);
    setNewMessageText("");
  };

  const handleDeleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCaptureScreenshot = async () => {
    const phoneElement = document.querySelector('.phone-mockup');
    if (!phoneElement) return;

    try {
      // Use html-to-image library from CDN
      const htmlToImage = await import('https://cdn.skypack.dev/html-to-image');

      const dataUrl = await htmlToImage.toPng(phoneElement, {
        quality: 1,
        pixelRatio: 2,
      });

      // Download the image
      const link = document.createElement('a');
      const fileName = `${contactName.replace(/\s+/g, '-').toLowerCase()}-${template.toLowerCase()}-chat.png`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot feature requires an internet connection. Please ensure you are online and try again.');
    }
  };

  let TemplateComponent;
  switch (template) {
    case "WhatsApp":
      TemplateComponent = WhatsappUI;
      break;
    case "Snapchat":
      TemplateComponent = SnapchatUI;
      break;
    default:
      TemplateComponent = ImessageUI;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h1>Text Mockup Gen</h1>

        {/* Template Selection */}
        <div className="input-group">
          <label>Choose Style</label>
          <div className="template-grid">
            {["iMessage", "WhatsApp", "Snapchat"].map((t) => (
              <div
                key={t}
                className={`template-card ${template === t ? "active" : ""}`}
                onClick={() => setTemplate(t)}
              >
                <span className="template-name">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Customization */}
        <div className="input-group">
          <label>Contact Info</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact name..."
            className="text-input"
          />
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Avatar URL (optional)..."
            className="text-input"
            style={{ fontSize: '12px' }}
          />
        </div>

        {/* Appearance Settings */}
        <div className="input-group">
          <label>Appearance</label>
          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
              />
              <span>Show Timestamps</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showStatusIndicators}
                onChange={(e) => setShowStatusIndicators(e.target.checked)}
              />
              <span>Show Status Indicators</span>
            </label>
          </div>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
            style={{ marginTop: '8px' }}
          >
            <option value="12h">12-hour format</option>
            <option value="24h">24-hour format</option>
          </select>
        </div>

        {/* Add Message */}
        <div className="input-group">
          <label>Add Message</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={newMessageFrom}
              onChange={(e) => setNewMessageFrom(e.target.value)}
              style={{ width: '100px' }}
            >
              <option value="me">Me</option>
              <option value="them">Them</option>
            </select>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
              placeholder="Type message..."
              className="text-input"
              style={{ flex: 1 }}
            />
          </div>
          <button className="btn" onClick={handleAddMessage}>Add Message</button>
          <button
            className="btn"
            onClick={handleCaptureScreenshot}
            style={{ background: '#10b981' }}
          >
            📸 Screenshot Chat
          </button>
        </div>

        {/* Message List */}
        <div className="input-group" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <label>Conversation ({messages.length})</label>
          <div className="message-list">
            {messages.map((msg, i) => (
              <div key={i} className={`message-item ${msg.from}`}>
                <span className="msg-text">{msg.text}</span>
                <button className="delete-btn" onClick={() => handleDeleteMessage(i)}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="main-content">
        <div className={`phone-mockup ${template.toLowerCase()}`}>
          <TemplateComponent
            messages={messages}
            contactName={contactName}
            avatarUrl={avatarUrl}
            showTimestamps={showTimestamps}
            showStatusIndicators={showStatusIndicators}
          />
        </div>
      </div>
    </div>
  );
}
