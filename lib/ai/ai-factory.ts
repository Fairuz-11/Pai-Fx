// AI Provider Factory

import { AIProvider } from './base-ai-provider'
import { OpenAIProvider } from './openai-provider'
import { AnthropicProvider } from './anthropic-provider'

export type AIProviderType = 'openai' | 'anthropic'

export class AIFactory {
  static createProvider(type?: AIProviderType): AIProvider | null {
    const apiKey = process.env.AI_API_KEY
    const model = process.env.AI_MODEL || 'gpt-4'
    const baseUrl = process.env.AI_BASE_URL

    // If no API key, return null (AI disabled)
    if (!apiKey) {
      console.warn('AI_API_KEY not configured. AI analysis disabled.')
      return null
    }

    const providerType = type || (process.env.AI_PROVIDER as AIProviderType) || 'openai'

    switch (providerType) {
      case 'openai':
        return new OpenAIProvider(
          apiKey,
          baseUrl || 'https://api.openai.com/v1',
          model
        )

      case 'anthropic':
        return new AnthropicProvider(
          apiKey,
          baseUrl || 'https://api.anthropic.com/v1',
          model
        )

      default:
        console.warn(`Unknown AI provider: ${providerType}. AI analysis disabled.`)
        return null
    }
  }

  static isAIEnabled(): boolean {
    return !!process.env.AI_API_KEY
  }
}
