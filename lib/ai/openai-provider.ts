// OpenAI Provider for AI Analysis

import { BaseAIProvider, AIAnalysisInput, AIAnalysisOutput } from './base-ai-provider'

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai'

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    try {
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
              content: 'You are a professional Forex market analyst. Provide objective, balanced analysis based on technical data. Always include risk warnings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenAI API error')
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      return this.parseAIResponse(aiResponse, input)
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }
}
