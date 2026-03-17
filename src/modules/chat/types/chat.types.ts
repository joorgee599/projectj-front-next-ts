export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  thread_id?: string;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
}

export interface ChatSession {
  thread_id: string;
  messages: ChatMessage[];
}
