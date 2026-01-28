export type TokenType =
  | 'command'
  | 'string'
  | 'flag'
  | 'variable'
  | 'pipe'
  | 'operator'
  | 'number'
  | 'text'

export interface Token {
  type: TokenType
  value: string
}



export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let remainingInput = input.trim()

  // Handle command token first
  const commandMatch = remainingInput.match(/^\b[a-zA-Z_-]+\b/)
  if (commandMatch) {
    tokens.push({ type: 'command', value: commandMatch[0] })
    remainingInput = remainingInput.substring(commandMatch[0].length).trim()
  }

  const otherTokenPatterns: { type: TokenType; regex: RegExp }[] = [
    { type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
    { type: 'string', regex: /^'(?:\\.|[^'\\])*'/ },
    { type: 'flag', regex: /^--\w+(-\w+)*/ },
    { type: 'flag', regex: /^-\w+/ },
    { type: 'variable', regex: /^\$\w+/ },
    { type: 'pipe', regex: /^\|/ },
    { type: 'operator', regex: /^(>|<|&&|\|\|)/ },
    { type: 'number', regex: /^\b\d+\b/ },
  ]

  while (remainingInput.length > 0) {
    let matchFound = false
    for (const pattern of otherTokenPatterns) {
      const match = remainingInput.match(pattern.regex)
      if (match) {
        tokens.push({ type: pattern.type, value: match[0] })
        remainingInput = remainingInput.substring(match[0].length).trim()
        matchFound = true
        break
      }
    }

    if (!matchFound) {
      const textMatch = remainingInput.match(/^\S+/)
      if (textMatch) {
        tokens.push({ type: 'text', value: textMatch[0] })
        remainingInput = remainingInput.substring(textMatch[0].length).trim()
      } else {
        // Should not happen if input is properly trimmed, but as a safeguard:
        break
      }
    }
  }

  return tokens
}

export const getTokenClass = (type: TokenType): string => {
  switch (type) {
    case 'command':
      return 'text-yellow-500'
    case 'string':
      return 'text-green-500'
    case 'flag':
      return 'text-cyan-500'
    case 'variable':
      return 'text-purple-500'
    case 'pipe':
      return 'text-orange-500'
    case 'operator':
      return 'text-red-500'
    case 'number':
      return 'text-blue-500'
    case 'text':
    default:
      return 'text-gray-300'
  }
}
