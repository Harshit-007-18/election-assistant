import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';
import ProgressTracker from './ProgressTracker';
import { sendMessage, getSessionId } from '../utils/api';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getSessionId());
  const hasGreeted = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    }
  }, []);

  // Send initial greeting (guarded against StrictMode double-fire)
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    handleSend('hello', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBotMessages = useCallback(async (botMessages) => {
    for (let i = 0; i < botMessages.length; i++) {
      if (i > 0) {
        setIsTyping(true);
        scrollToBottom();
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        setIsTyping(false);
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + i, text: botMessages[i], sender: 'bot', timestamp: new Date() },
      ]);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const handleSend = useCallback(async (text, silent = false) => {
    const msg = (typeof text === 'string' ? text : input).trim();
    if (!msg || isLoading) return;

    // Add user message (unless silent greeting)
    if (!silent) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: msg, sender: 'user', timestamp: new Date() },
      ]);
    }

    setInput('');
    setQuickReplies(null);
    setIsLoading(true);
    setIsTyping(true);
    scrollToBottom();

    try {
      // Simulate thinking delay
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));

      const response = await sendMessage(sessionId.current, msg);
      setIsTyping(false);

      if (response.messages && response.messages.length > 0) {
        await addBotMessages(response.messages);
      }

      if (response.quickReplies) {
        setQuickReplies(response.quickReplies);
      }

      if (response.progress) {
        setProgress(response.progress);
      } else {
        setProgress(null);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "I'm having trouble connecting. Please make sure the server is running and try again.",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setQuickReplies(['✅ Check eligibility', '📋 Register to vote', '📅 Election timeline', '🗳️ Voting day steps']);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, scrollToBottom, addBotMessages]);

  const handleQuickReply = useCallback((reply) => {
    handleSend(reply);
  }, [handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <ProgressTracker progress={progress} />

      <div className="chat-window" ref={chatRef}>
        {messages.length === 0 && !isTyping && (
          <div className="welcome-container">
            <div className="welcome-icon">🗳️</div>
            <h2>Election Assistant</h2>
            <p>Your smart guide to voter eligibility, registration, and elections in India.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>

      <QuickReplies replies={quickReplies} onSelect={handleQuickReply} disabled={isLoading} />

      <div className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            id="chat-input"
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            id="send-button"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>

      <div className="disclaimer">
        Data sourced from Election Commission of India guidelines. For official info, visit eci.gov.in
      </div>
    </>
  );
}
