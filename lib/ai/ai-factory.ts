// AI Provider Factory

import { AIProvider } from './base-ai-provider'
import { OpenAIProvider } from './openai-provider'
import { AnthropicProvider } from './anthropic-provider'
import { GroqProvider } from './groq-provider'

export type AIProviderType = 'openai' | 'anthropic' | 'groq'

export class AIFactory {
  static createProvider(): AIProvider | null {
    const providerType = (process.env.AI_PROVIDER as AIProviderType) || 'openai'

    switch (providerType) {
      case 'groq': {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
          console.warn('[AI] GROQ_API_KEY not set. AI analysis disabled.')
          return null
        }
        return new GroqProvider(
          apiKey,
          'https://api.groq.com/openai/v1',
          process.env.GROQ_MODEL || 'llama3-70b-8192'
        )
      }

      case 'anthropic': {
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          console.warn('[AI] ANTHROPIC_API_KEY not set. AI analysis disabled.')
          return null
        }
        return new AnthropicProvider(
          apiKey,
          'https://api.anthropic.com/v1',
          process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
        )
      }

      case 'openai':
      default: {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          console.warn('[AI] OPENAI_API_KEY not set. AI analysis disabled.')
          return null
        }
        return new OpenAIProvider(
          apiKey,
          'https://api.openai.com/v1',
          process.env.OPENAI_MODEL || 'gpt-4o-mini'
        )
      }
    }
  }

  static isAIEnabled(): boolean {
    const provider = process.env.AI_PROVIDER || 'openai'
    if (provider === 'groq') return !!process.env.GROQ_API_KEY
    if (provider === 'anthropic') return !!process.env.ANTHROPIC_API_KEY
    return !!process.env.OPENAI_API_KEY
  }
}
