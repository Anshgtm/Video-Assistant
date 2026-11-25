import { Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { askMeetingQuestion, checkHealth, processMedia } from './api';
import { InsightsWorkspace } from './components/InsightsWorkspace';
import { SourcePanel } from './components/SourcePanel';
import type { ChatMessage, LanguageOption, MeetingAnalysis } from './types';

function formatTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function App() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const ping = async () => {
      const ok = await checkHealth();
      if (active) setBackendOnline(ok);
    };
    ping();
    const timer = setInterval(ping, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleProcess = async (params: {
    sourceUrl?: string;
    file?: File | null;
    language: LanguageOption;
  }) => {
    setIsProcessing(true);
    setProcessError(null);
    setChatError(null);

    try {
      const result = await processMedia(params);
      setAnalysis(result);
      setChatMessages([]);
    } catch (err) {
      setProcessError(
        err instanceof Error ? err.message : 'Failed to process media.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAsk = async (question: string) => {
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: question,
      timestamp: formatTime(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);
    setChatError(null);

    try {
      const answer = await askMeetingQuestion(question);
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: answer,
        timestamp: formatTime(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : 'Failed to get an answer.'
      );
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <Video size={20} />
          </div>
          <div>
            <span className="brand-name">AI Video Assistant</span>
            <span className="brand-tag">Transcribe · Summarize · Ask</span>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <SourcePanel
          isProcessing={isProcessing}
          backendOnline={backendOnline}
          error={processError}
          onSubmit={handleProcess}
        />
        <InsightsWorkspace
          analysis={analysis}
          isProcessing={isProcessing}
          chatMessages={chatMessages}
          isAsking={isAsking}
          chatError={chatError}
          onAsk={handleAsk}
        />
      </main>
    </div>
  );
}

export default App;
