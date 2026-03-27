export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  email: string;
  roles: string[];
  permissions: string[];
}

export interface ChatRequest {
  message: string;
  thread_id?: string;
  auth_token?: string;
  user_context?: UserContext;
  current_page?: string;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
  profile: string;
}

export interface ChatSession {
  thread_id: string;
  messages: ChatMessage[];
}
