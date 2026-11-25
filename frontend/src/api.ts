import type { LanguageOption, MeetingAnalysis } from './types';

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') {
      return data.detail;
    }
  } catch {
    // Fall back to status text if body is not JSON
  }
  return response.statusText || `Request failed (${response.status})`;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function processMedia(params: {
  sourceUrl?: string;
  file?: File | null;
  language: LanguageOption;
}): Promise<MeetingAnalysis> {
  const formData = new FormData();
  formData.append('language', params.language);

  if (params.file) {
    formData.append('file', params.file);
  } else if (params.sourceUrl?.trim()) {
    formData.append('source_url', params.sourceUrl.trim());
  }

  const res = await fetch('/api/process', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return (await res.json()) as MeetingAnalysis;
}

export async function askMeetingQuestion(question: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const data = (await res.json()) as { answer: string };
  return data.answer;
}
