import { Bot, Loader2, MessageSquare, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isAsking: boolean;
  error: string | null;
  onAsk: (question: string) => void;
}

const SUGGESTIONS = [
  'What were the main topics discussed?',
  'Who is responsible for the action items?',
  'Were any deadlines or next steps mentioned?',
];

export function ChatPanel({
  messages,
  isAsking,
  error,
  onAsk,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isAsking) return;
    setInput('');
    onAsk(trimmed);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon-wrap">
              <MessageSquare size={24} />
            </div>
            <h3>Ask anything about this meeting</h3>
            <p className="muted">
              Answers are grounded strictly in the indexed transcript via RAG.
            </p>
            <div className="suggestion-chips">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chip-btn"
                  onClick={() => onAsk(q)}
                  disabled={isAsking}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-row ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className="bubble">
                <div className="bubble-text">{msg.content}</div>
                <span className="bubble-time">{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}

        {isAsking && (
          <div className="chat-row assistant">
            <div className="avatar">
              <Bot size={15} />
            </div>
            <div className="bubble typing">
              <Loader2 size={15} className="spin" />
              <span>Searching transcript...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="error-banner compact" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          placeholder="Ask a question about the transcript..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isAsking}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || isAsking}
          aria-label="Send question"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
