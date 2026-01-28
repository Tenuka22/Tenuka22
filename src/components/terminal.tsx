'use client'

import { useState, useRef, useEffect } from 'react'
import { CommandOutput } from './terminal/command-output'
import { InitialMessage } from './terminal/initial-message'
import { TerminalInput } from './terminal/terminal-input'
import { UserCommand } from './terminal/user-command'
import { root_user } from '@/lib/constants'
import { TerminalLine } from './terminal/terminal-line'

export const Terminal = () => {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(0)
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleInitialMessageLoad = () => {
    setShowInput(true)
  }

  const [messages, setMessages] = useState<React.ReactNode[]>([
    <InitialMessage key="initial" onLoad={handleInitialMessageLoad} />,
  ])

  useEffect(() => {
    if (terminalRef.current) {
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
      }, 0)
    }
  }, [messages])

  const commands = [
    'help: Show this help message',
    'echo [text]: Print text to the console',
    'clear: Clear the terminal',
    'date: Show the current date',
    'whoami: Show the current user',
    'motd: Show the message of the day',
  ]

  const handleEnter = (command: string) => {
    if (command.trim() === '') {
      setMessages([
        ...messages,
        <UserCommand key={messages.length} command="" />,
      ])
      return
    }

    const newCommandHistory = [...commandHistory, command]
    setCommandHistory(newCommandHistory)
    setCommandHistoryIndex(newCommandHistory.length)

    const newMessages = [
      ...messages,
      <UserCommand key={messages.length} command={command} />,
    ]
    const [cmd, ...args] = command.split(' ')

    switch (cmd) {
      case 'echo':
        newMessages.push(
          <TerminalLine key={messages.length + 1} line={args.join(' ')} />,
        )
        break
      case 'clear':
        setMessages([
          <InitialMessage key="initial" onLoad={handleInitialMessageLoad} />,
        ])
        return
      case 'help':
        newMessages.push(
          <CommandOutput
            key={messages.length + 1}
            output={
              <div>
                <p>Available commands:</p>
                <ul className="list-disc list-inside">
                  {commands.map((cmdDef) => {
                    const [first, ...rest] = cmdDef.split(' ')
                    return (
                      <li key={cmdDef} className="text-emerald-200">
                        <span className="text-yellow-500">{first}</span>{' '}
                        {rest.join(' ')}
                      </li>
                    )
                  })}
                </ul>
              </div>
            }
          />,
        )
        break
      case 'date':
        newMessages.push(
          <CommandOutput
            key={messages.length + 1}
            output={new Date().toString()}
          />,
        )
        break
      case 'whoami':
        newMessages.push(
          <CommandOutput key={messages.length + 1} output={root_user} />,
        )
        break
      case 'motd':
        newMessages.push(
          <CommandOutput
            key={messages.length + 1}
            output="Keep it simple, stupid."
          />,
        )
        break
      default:
        newMessages.push(
          <TerminalLine
            key={messages.length + 1}
            line={`command not found: ${cmd}`}
          />,
        )
        break
    }
    setMessages(newMessages)
  }

  const focusInput = () => {
    const inputElement = document.getElementById('terminal-input')
    if (inputElement) {
      inputElement.focus()
    }
  }

  return (
    <div
      ref={terminalRef}
      className="terminal flex-1 h-screen p-4 flex flex-col size-full"
      onClick={focusInput}
    >
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-4">
        {showInput && (
          <TerminalInput
            input={input}
            setInput={setInput}
            onEnter={handleEnter}
            commandHistory={commandHistory}
            setCommandHistoryIndex={setCommandHistoryIndex}
            commandHistoryIndex={commandHistoryIndex}
          />
        )}
      </div>
    </div>
  )
}
