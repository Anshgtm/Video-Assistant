import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  HelpCircle,
  KeyRound,
  ListChecks,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ActiveTab, ChatMessage, MeetingAnalysis } from '../types';
import { ChatPanel } from './ChatPanel';

interface InsightsWorkspaceProps {
  analysis: MeetingAnalysis | null;
  isProcessing: boolean;
  chatMessages: ChatMessage[];
  isAsking: boolean;
  chatError: string | null;
  onAsk: (question: string) => void;
}

export function InsightsWorkspace({
  analysis,
  isProcessing,
  chatMessages,
  isAsking,
  chatError,
  onAsk,
}: InsightsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [transcriptQuery, setTranscriptQuery] = useState('');

  const wordCount = useMemo(() => {
    if (!analysis?.transcript) return 0;
    return analysis.transcript.trim().split(/\s+/).filter(Boolean).length;
  }, [analysis?.transcript]);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard API may be unavailable in insecure contexts
    }
  };

  const downloadReport = () => {
    if (!analysis) return;
    const report = [
      `TITLE: ${analysis.title}`,
      `LANGUAGE: ${analysis.language}`,
      '',
      '=== SUMMARY ===',
      analysis.summary,
      '',
      '=== ACTION ITEMS ===',
      analysis.action_items,
      '',
      '=== KEY DECISIONS ===',
      analysis.key_decisions,
      '',
      '=== OPEN QUESTIONS ===',
      analysis.open_questions,
      '',
      '=== TRANSCRIPT ===',
      analysis.transcript,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'meeting'}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analysis) {
    return (
      <section className="panel workspace-panel empty-workspace">
        <div className="empty-state">
          <div className="hero-badge">
            <Sparkles size={28} />
          </div>
          <h2>
            {isProcessing
              ? 'Analyzing your media...'
              : 'Ready to analyze your meeting or video'}
          </h2>
          <p className="muted">
            {isProcessing
              ? 'We are transcribing the audio, summarizing key points, extracting action items, and indexing the transcript for Q&A.'
              : 'Paste a YouTube link, enter a local file path, or upload an audio/video file on the left to generate a structured summary and chat with the transcript.'}
          </p>
          <div className="feature-pills">
            <span>Whisper &amp; Sarvam AI</span>
            <span>Executive Summary</span>
            <span>Action Items &amp; Decisions</span>
            <span>RAG Q&amp;A Chat</span>
          </div>
        </div>
      </section>
    );
  }

  const filteredTranscript =
    transcriptQuery.trim().length > 0
      ? analysis.transcript
          .split(/(?<=[.!?])\s+/)
          .filter((sentence) =>
            sentence.toLowerCase().includes(transcriptQuery.trim().toLowerCase())
          )
          .join(' ')
      : analysis.transcript;

  return (
    <section className="panel workspace-panel">
      <div className="workspace-header">
        <div className="title-block">
          <div className="meta-row">
            <span className="badge">{analysis.language.toUpperCase()}</span>
            <span className="meta-text">{wordCount.toLocaleString()} words</span>
          </div>
          <h1>{analysis.title}</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => copyText('summary', analysis.summary)}
          >
            {copiedKey === 'summary' ? <Check size={15} /> : <ClipboardCopy size={15} />}
            {copiedKey === 'summary' ? 'Copied' : 'Copy Summary'}
          </button>
          <button type="button" className="secondary-btn" onClick={downloadReport}>
            <Download size={15} />
            Export .txt
          </button>
        </div>
      </div>

      <nav className="tabs-bar" aria-label="Analysis views">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <Sparkles size={15} />
          Summary
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <ListChecks size={15} />
          Actions &amp; Decisions
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          <FileText size={15} />
          Transcript
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={15} />
          Ask Assistant
          {chatMessages.length > 0 && (
            <span className="count-pill">{Math.ceil(chatMessages.length / 2)}</span>
          )}
        </button>
      </nav>

      <div className="tab-body">
        {activeTab === 'summary' && (
          <div className="card-surface prose-block">
            <div className="card-title-row">
              <h3>
                <Sparkles size={16} className="accent-icon" /> Executive Summary
              </h3>
            </div>
            <pre className="formatted-text">{analysis.summary}</pre>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-grid">
            <div className="card-surface">
              <div className="card-title-row">
                <h3>
                  <CheckCircle2 size={16} className="green-icon" /> Action Items
                </h3>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => copyText('actions', analysis.action_items)}
                >
                  {copiedKey === 'actions' ? <Check size={14} /> : <ClipboardCopy size={14} />}
                </button>
              </div>
              <pre className="formatted-text">{analysis.action_items}</pre>
            </div>

            <div className="card-surface">
              <div className="card-title-row">
                <h3>
                  <KeyRound size={16} className="amber-icon" /> Key Decisions
                </h3>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => copyText('decisions', analysis.key_decisions)}
                >
                  {copiedKey === 'decisions' ? <Check size={14} /> : <ClipboardCopy size={14} />}
                </button>
              </div>
              <pre className="formatted-text">{analysis.key_decisions}</pre>
            </div>

            <div className="card-surface full-span">
              <div className="card-title-row">
                <h3>
                  <HelpCircle size={16} className="blue-icon" /> Open Questions
                </h3>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => copyText('questions', analysis.open_questions)}
                >
                  {copiedKey === 'questions' ? <Check size={14} /> : <ClipboardCopy size={14} />}
                </button>
              </div>
              <pre className="formatted-text">{analysis.open_questions}</pre>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="card-surface transcript-card">
            <div className="transcript-toolbar">
              <div className="search-box">
                <Search size={15} className="muted-icon" />
                <input
                  type="text"
                  placeholder="Filter sentences in transcript..."
                  value={transcriptQuery}
                  onChange={(e) => setTranscriptQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => copyText('transcript', analysis.transcript)}
              >
                {copiedKey === 'transcript' ? <Check size={15} /> : <ClipboardCopy size={15} />}
                {copiedKey === 'transcript' ? 'Copied' : 'Copy All'}
              </button>
            </div>
            <div className="transcript-body">
              {filteredTranscript ? (
                <p>{filteredTranscript}</p>
              ) : (
                <p className="muted">No matching sentences found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatPanel
            messages={chatMessages}
            isAsking={isAsking}
            error={chatError}
            onAsk={onAsk}
          />
        )}
      </div>
    </section>
  );
}
