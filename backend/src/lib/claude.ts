import Anthropic from '@anthropic-ai/sdk'

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (_claude) return _claude
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing required environment variable: ANTHROPIC_API_KEY')
  _claude = new Anthropic({ apiKey })
  return _claude
}
