import React from 'react'
import type { Token } from '@/lib/tokenizer'
import { getTokenClass, tokenize } from '@/lib/tokenizer'

interface TerminalLineProps {
  line: string
}

export const TerminalLine: React.FC<TerminalLineProps> = React.memo(
  ({ line }) => {
    const tokens = tokenize(line)
    return (
      <div className="whitespace-pre">
        {tokens
          .map((token: Token, index: number) => (
            <span key={index} className={getTokenClass(token.type)}>
              {token.value}
            </span>
          ))
          .reduce<React.ReactNode | null>(
            (prev, curr) =>
              prev ? (
                <>
                  {prev} {curr}
                </>
              ) : (
                curr
              ),
            null,
          )}
      </div>
    )
  },
)

TerminalLine.displayName = 'TerminalLine'
