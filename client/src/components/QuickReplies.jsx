export default function QuickReplies({ replies, onSelect, disabled }) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="quick-replies">
      {replies.map((reply, idx) => (
        <button
          key={idx}
          className="quick-reply-btn"
          onClick={() => onSelect(reply)}
          disabled={disabled}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
