'use client'
import { RootUser } from './root-user'
import { useEffect, useRef } from 'react'

interface TerminalInputProps {
  input: string
  setInput: (input: string) => void
  onEnter: (command: string) => void
}

export const TerminalInput = ({
  input,
  setInput,
  onEnter,
}: TerminalInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnter(input)
      setInput('')
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [input])

  return (
    <div className="flex gap-2 text-emerald-400 font-mono">
      <div className="flex gap-1 whitespace-nowrap select-none">
        <span className="text-emerald-500">&gt;&gt;</span>
        <RootUser />
        <span className="text-emerald-500">~/</span>
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-white w-full resize-none overflow-hidden font-mono leading-relaxed"
          rows={1}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}
