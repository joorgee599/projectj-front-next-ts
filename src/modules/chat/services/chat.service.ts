import { ChatRequest, ChatResponse } from '../types/chat.types';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:5000';

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${AGENT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error: ${response.status}`);
    }

    return response.json();
  },

  // Para futuro: streaming
  async sendMessageStream(request: ChatRequest): Promise<ReadableStream> {
    const response = await fetch(`${AGENT_API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.body!;
  },
};
