// Anthropic Claude Provider for AI Analysis

import { BaseAIProvider, AIAnalysisInput, AIAnalysisOutput } from './base-ai-provider'

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic'

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    try {
      const prompt = this.buildPrompt(input)

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Anthropic API error')
      }

      const data = await response.json()
      const aiResponse = data.content[0]?.text || ''

      return this.parseAIResponse(aiResponse)
    } catch (error) {
      console.error('Error calling Anthropic API:', error)
      throw error
    }
  }
}
