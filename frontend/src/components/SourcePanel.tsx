import {
  FileAudio,
  Globe,
  Link2,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { InputMode, LanguageOption } from '../types';

interface SourcePanelProps {
  isProcessing: boolean;
  backendOnline: boolean | null;
  error: string | null;
  onSubmit: (params: {
    sourceUrl?: string;
    file?: File | null;
    language: LanguageOption;
  }) => void;
}

const PIPELINE_STEPS = [
  'Acquiring & chunking audio',
  'Transcribing speech',
  'Generating title & summary',
  'Extracting actions & indexing RAG',
];

export function SourcePanel({
  isProcessing,
  backendOnline,
  error,
  onSubmit,
}: SourcePanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<LanguageOption>('english');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    !isProcessing &&
    (inputMode === 'url' ? sourceUrl.trim().length > 0 : selectedFile !== null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      sourceUrl: inputMode === 'url' ? sourceUrl.trim() : undefined,
      file: inputMode === 'file' ? selectedFile : null,
      language,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setSelectedFile(dropped);
      setInputMode('file');
    }
  };

  return (
    <aside className="panel source-panel">
      <div className="panel-header">
        <div>
          <h2>Media Source</h2>
          <p className="muted">Analyze a YouTube video or local audio/video file.</p>
        </div>
        <span
          className={`status-pill ${
            backendOnline === true
              ? 'online'
              : backendOnline === false
              ? 'offline'
              : 'checking'
          }`}
          title="FastAPI backend status"
        >
          <span className="status-dot" />
          {backendOnline === true
            ? 'API Ready'
            : backendOnline === false
            ? 'API Offline'
            : 'Checking...'}
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="source-form">
        <div className="segmented-control" role="tablist" aria-label="Source type">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'url'}
            className={`segment-btn ${inputMode === 'url' ? 'active' : ''}`}
            onClick={() => setInputMode('url')}
            disabled={isProcessing}
          >
            <Link2 size={15} />
            URL / Path
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'file'}
            className={`segment-btn ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => setInputMode('file')}
            disabled={isProcessing}
          >
            <UploadCloud size={15} />
            Upload File
          </button>
        </div>

        {inputMode === 'url' ? (
          <div className="field">
            <label htmlFor="source-url">YouTube URL or Local File Path</label>
            <input
              id="source-url"
              type="text"
              placeholder="https://youtube.com/watch?v=... or C:\path\to\meeting.mp4"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        ) : (
          <div className="field">
            <label>Audio or Video File</label>
            <div
              className={`dropzone ${isDragging ? 'dragging' : ''} ${
                selectedFile ? 'has-file' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.mkv,.ogg"
                hidden
                disabled={isProcessing}
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              {selectedFile ? (
                <div className="selected-file">
                  <FileAudio size={20} className="accent-icon" />
                  <div className="file-meta">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Remove file"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <UploadCloud size={26} className="muted-icon" />
                  <span>Drop media file here or click to browse</span>
                  <span className="hint">MP4, MP3, WAV, M4A, WEBM, MKV</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="field">
          <label>
            <Globe size={14} className="inline-icon" /> Transcription Engine & Language
          </label>
          <div className="lang-grid">
            <button
              type="button"
              className={`lang-card ${language === 'english' ? 'active' : ''}`}
              onClick={() => setLanguage('english')}
              disabled={isProcessing}
            >
              <span className="lang-title">English</span>
              <span className="lang-sub">Local Whisper</span>
            </button>
            <button
              type="button"
              className={`lang-card ${language === 'hinglish' ? 'active' : ''}`}
              onClick={() => setLanguage('hinglish')}
              disabled={isProcessing}
            >
              <span className="lang-title">Hinglish</span>
              <span className="lang-sub">Sarvam AI → EN</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={!canSubmit}>
          {isProcessing ? (
            <>
              <Loader2 size={17} className="spin" />
              Processing Pipeline...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Analyze Video / Audio
            </>
          )}
        </button>

        {isProcessing && (
          <div className="pipeline-progress">
            <p className="progress-title">Running AI pipeline</p>
            <ul>
              {PIPELINE_STEPS.map((step) => (
                <li key={step}>
                  <span className="pulse-dot" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </aside>
  );
}
