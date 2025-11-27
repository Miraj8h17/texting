import React from "react";

export default function ImessageUI({ messages, contactName, avatarUrl, showTimestamps, showStatusIndicators }) {
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
    <div className="chat-canvas imessage">
      <div className="chat-header">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#8e8e93', fontWeight: 500 }}>To:</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{contactName || 'Contact'}</div>
        </div>
      </div>
      <div className="chat-area">
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
            <div className={`bubble ${msg.from || 'them'}`}>
              {msg.text}
              {showTimestamps && msg.time && (
                <span className="bubble-timestamp">{msg.time}</span>
              )}
            </div>
            {showStatusIndicators && msg.from === 'me' && i === messages.length - 1 && (
              <div className="bubble-status">Delivered</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
