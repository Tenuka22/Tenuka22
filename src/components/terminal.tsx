'use client'

import { useState } from 'react'
import { CommandOutput } from './terminal/command-output'
import { InitialMessage } from './terminal/initial-message'
import { TerminalInput } from './terminal/terminal-input'
import { UserCommand } from './terminal/user-command'
import { root_user } from '@/lib/constants'

export const Terminal = () => {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleInitialMessageLoad = () => {
    setShowInput(true)
  }

  const [messages, setMessages] = useState<React.ReactNode[]>([
    <InitialMessage key="initial" onLoad={handleInitialMessageLoad} />,
  ])

  const commands = [
    'help: Show this help message',
    'echo [text]: Print text to the console',
    'clear: Clear the terminal',
    'date: Show the current date',
    'whoami: Show the current user',
    'motd: Show the message of the day',
  ]

  const handleEnter = (command: string) => {
    const newMessages = [
      ...messages,
      <UserCommand key={messages.length} command={command} />,
    ]
    const [cmd, ...args] = command.split(' ')

    switch (cmd) {
      case 'echo':
        newMessages.push(
          <CommandOutput key={messages.length + 1} output={args.join(' ')} />,
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
                  {commands.map((cmd) => {
                    const [first, ...rest] = cmd.split(' ')
                    return (
                      <li key={cmd} className="text-emerald-200">
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
          <CommandOutput
            key={messages.length + 1}
            output={`command not found: ${cmd}`}
          />,
        )
        break
    }
    setMessages(newMessages)
  }

  return (
    <div className="overflow-y-auto flex-1 h-screen p-4 border flex flex-col border-dashed size-full">
      <div className="flex-1 flex flex-col gap-3">
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
          />
        )}
      </div>
    </div>
  )
}
