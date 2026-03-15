import { CONFIG } from '../config';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export const aiService = {
  chat: async (messages: Message[], context?: string): Promise<string> => {
    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      if (context && history.length > 0) {
        const lastMsg = history[history.length - 1];
        lastMsg.parts[0].text = `[CONTEXT: You are looking at the file content below]\n\n\`\`\`\n${context}\n\`\`\`\n\nUser Message: ${lastMsg.parts[0].text}`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: history }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "No response received from AI.";
    } catch (error) {
      console.error('AI Service Error:', error);
      return "Error connecting to AI service. Please check your API key and connection.";
    }
  },

  suggestEdits: async (fileName: string, content: string): Promise<string> => {
    return "// AI Suggestion for " + fileName + "\n" + content + "\n// End of suggestion";
  }
};
