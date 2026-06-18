export interface Email {
  id: string;
  sender: string;
  senderInitial: string;
  senderColor: string;
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
  important: boolean;
  starred: boolean;
  body?: string;
  isHtml?: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  isAllDay: boolean;
}
