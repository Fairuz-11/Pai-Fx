// Groq AI Provider - Free, fast, no credit card required
// Uses LLaMA 3 via Groq's ultra-fast inference API

import { BaseAIProvider, AIAnalysisInput, AIAnalysisOutput } from './base-ai-provider'

export class GroqProvider extends BaseAIProvider {
  name = 'groq'

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    const prompt = this.buildPrompt(input)

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional Forex market analyst. Provide objective, balanced analysis based on technical data. Always include risk warnings. Respond ONLY with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error((err as any)?.error?.message || `Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    return this.parseAIResponse(content, input)
  }
}
