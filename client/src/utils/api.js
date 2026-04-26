const API_BASE = '/api';

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getTimeline(state) {
  const res = await fetch(`${API_BASE}/timeline/${encodeURIComponent(state)}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function getGuide(type) {
  const res = await fetch(`${API_BASE}/guides/${type}`);
  if (!res.ok) throw new Error('Failed to fetch guide');
  return res.json();
}

export function getSessionId() {
  let id = localStorage.getItem('ea_session_id');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ea_session_id', id);
  }
  return id;
}
