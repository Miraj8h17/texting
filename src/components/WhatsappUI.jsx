import React from "react";

export default function WhatsappUI({ messages, contactName, avatarUrl, showTimestamps, showStatusIndicators }) {
  // Generate initials from contact name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // WhatsApp checkmark icons
  const SingleCheck = () => (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M5.5 8.5L2 5l-1 1 4.5 4.5L15 1l-1-1z" />
    </svg>
  );

  const DoubleCheck = () => (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M2.5 6.5L0 4l4.5 4.5L15 0l-1.5-1.5L4.5 9.5z" />
      <path d="M6 6.5L3.5 4 8 8.5 18.5 0 17 -1.5 8 7.5z" opacity="0.6" />
    </svg>
  );

  return (
    <div className="chat-canvas whatsapp">
      <div className="chat-header" style={{ justifyContent: 'flex-start', gap: 12 }}>
        <div className="header-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={contactName} />
          ) : (
            getInitials(contactName || 'Contact')
          )}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{contactName || 'Contact'}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>online</div>
        </div>
      </div>
      <div className="chat-area">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.from || 'them'}`}>
            <span>{msg.text}</span>
            {showTimestamps && msg.time && (
              <span className="bubble-timestamp">
                {msg.time}
                {showStatusIndicators && msg.from === 'me' && i === messages.length - 1 && (
                  <span className="bubble-status"><DoubleCheck /></span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
