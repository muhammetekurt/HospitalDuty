const API_BASE_URL = 'https://localhost:5000/api';

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

class AIService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      return await this.makeRequest<ChatResponse>('/ai/chat', request);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('AI servisi ile iletişim kurulamadı');
    }
  }
}

export const aiService = new AIService();
