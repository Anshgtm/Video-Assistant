export type LanguageOption = 'english' | 'hinglish';

export type InputMode = 'url' | 'file';

export type ActiveTab = 'summary' | 'insights' | 'transcript' | 'chat';

export interface MeetingAnalysis {
  title: string;
  transcript: string;
  summary: string;
  action_items: string;
  key_decisions: string;
  open_questions: string;
  language: LanguageOption;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
