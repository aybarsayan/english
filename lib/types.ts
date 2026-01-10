export interface StudentInfo {
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  order?: number; // Konuşma sırası (sadece client-side kullanılır)
}

export interface VoiceSessionData {
  studentName: string;
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  messages: Message[];
  duration: number;
}

export interface StudentWithSessions {
  studentName: string;
  firstName: string;
  lastName: string;
  totalDuration: number;
  sessionCount: number;
  sessions: {
    id: string;
    messages: Message[];
    duration: number;
    createdAt: string;
  }[];
}
