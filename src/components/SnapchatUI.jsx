import React from "react";

export default function SnapchatUI({ messages, contactName, avatarUrl, showTimestamps, showStatusIndicators }) {
  // Generate initials from contact name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="chat-canvas snapchat">
      <div className="chat-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="header-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={contactName} />
            ) : (
              getInitials(contactName || 'Contact')
            )}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>{contactName || 'Contact'}</div>
        </div>
      </div>
      <div className="chat-area">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.from || 'them'}`}>
            <div className="bubble-sender">
              {msg.from === 'me' ? 'YOU' : (contactName || 'CONTACT').toUpperCase()}
            </div>
            <div>{msg.text}</div>
            {showTimestamps && msg.time && (
              <span className="bubble-timestamp">
                {msg.time} {showStatusIndicators && msg.from === 'me' && i === messages.length - 1 && '• Delivered'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
