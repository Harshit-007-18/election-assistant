import { useMemo } from 'react';

function formatText(text) {
  // Bold: **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Newlines
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
}

export default function MessageBubble({ message }) {
  const time = useMemo(() => {
    const d = new Date(message.timestamp);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }, [message.timestamp]);

  const html = useMemo(() => formatText(message.text), [message.text]);

  return (
    <div className={`message-row ${message.sender}`}>
      <div className="message-avatar">
        {message.sender === 'bot' ? '🗳️' : '👤'}
      </div>
      <div>
        <div
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
}
