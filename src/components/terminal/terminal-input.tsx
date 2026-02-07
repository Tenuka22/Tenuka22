'use client'

import { useEffect, useRef } from 'react'
import { RootUser } from './root-user'
import { cn } from '@/lib/utils'
import { getTokenClass, tokenize } from '@/lib/tokenizer'

interface Props {
  input: string
  setInput: (input: string) => void
  onEnter: (command: string) => void
  commandHistory: Array<string>
  setCommandHistoryIndex: (index: number) => void
  commandHistoryIndex: number
  userInfo?: any
}

export const TerminalInput = ({
  input,
  setInput,
  onEnter,
  commandHistory,
  setCommandHistoryIndex,
  commandHistoryIndex,
  userInfo,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleDocumentClick = () => {
      inputRef.current?.focus()
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  // Sync scroll between transparent input and visible display
  useEffect(() => {
    if (inputRef.current && displayRef.current) {
      displayRef.current.scrollLeft = inputRef.current.scrollLeft
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter(input)
      setInput('')
      setCommandHistoryIndex(commandHistory.length + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistoryIndex > 0) {
        const newIndex = commandHistoryIndex - 1
        setCommandHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (commandHistoryIndex < commandHistory.length) {
        const newIndex = commandHistoryIndex + 1
        setCommandHistoryIndex(newIndex)
        setInput(commandHistory[newIndex] || '')
      }
    }
  }

  const renderTokens = () => {
    if (input === '') return <span /> // Return empty span to not render anything
    const tokens = tokenize(input)
    return tokens
      .map((token, index) => (
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
      )
  }

  return (
    <div className={cn('flex flex-row items-center gap-2')}>
      <label htmlFor="terminal-input" className="flex-shrink-0">
        <RootUser name={userInfo?.plainName} />
        <span className="text-gray-400">:~$</span>
      </label>
      <div
        className="relative flex-1"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Visible, styled output */}
        <div
          ref={displayRef}
          className="whitespace-pre w-full overflow-x-hidden"
        >
          {renderTokens()}
          <span className="terminal-input-cursor" />
        </div>
        {/* Hidden, functional input */}
        <input
          ref={inputRef}
          id="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute top-0 left-0 w-full h-full bg-transparent text-transparent focus:outline-none"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </div>
  )
}
