'use client'

import { useEffect, useRef, useState } from 'react'
import { CommandOutput } from './terminal/command-output'
import { InitialMessage } from './terminal/initial-message'
import { TerminalInput } from './terminal/terminal-input'
import { UserCommand } from './terminal/user-command'
import { TerminalLine } from './terminal/terminal-line'
import { LinuxSandbox } from './terminal/linux-sandbox' // Import LinuxSandbox
import { root_user, user_info } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const Terminal = () => {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [commandHistory, setCommandHistory] = useState<Array<string>>([])
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(0)
  const [isSandboxActive, setIsSandboxActive] = useState(false) // New state for sandbox
  const [hiddenMessages, setHiddenMessages] = useState<Array<React.ReactNode>>(
    [],
  )
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleInitialMessageLoad = () => {
    setShowInput(true)
  }

  const [messages, setMessages] = useState<Array<React.ReactNode>>([
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
  }, [messages, isSandboxActive]) // Add isSandboxActive to dependencies

  const commands = [
    'help: Show this help message',
    'echo [text]: Print text to the console',
    'clear: Clear the terminal',
    'date: Show the current date',
    'whoami: Show the current user',
    'motd: Show the message of the day',
    'about: Learn more about Tenuka',
    "projects: View Tenuka's projects (In Development)",
    'contact: Get in touch with Tenuka',
    "github: Open Tenuka's GitHub profile",
    "linkedin: Open Tenuka's LinkedIn profile",
    'sandbox: Enter the Deno sandbox (In Development)',
    "blog: Read Tenuka's blog posts (Strikethrough)",
    "resume: View Tenuka's resume (Strikethrough)",
  ]

  const handleEnter = async (command: string) => {
    if (command.trim() === '') {
      setMessages((prev) => [
        ...prev,
        <UserCommand key={prev.length} command="" />,
      ])
      return
    }

    const newCommandHistory = [...commandHistory, command]
    setCommandHistory(newCommandHistory)
    setCommandHistoryIndex(newCommandHistory.length)

    if (isSandboxActive) {
      return
    }

    // Show user command immediately
    setMessages((prev) => [
      ...prev,
      <UserCommand key={prev.length} command={command} />,
    ])

    const [cmd, ...args] = command.split(' ')

    switch (cmd) {
      case 'echo':
        setMessages((prev) => [
          ...prev,
          <TerminalLine key={prev.length} line={args.join(' ')} />,
        ])
        break
      case 'sandbox':
        setHiddenMessages((prev) => [
          ...messages,
          <UserCommand key={messages.length} command={command} />,
        ])
        setMessages([
          <UserCommand key={0} command={command} />,
          <CommandOutput
            key="sandbox-enter"
            output="Entering Deno Sandbox..."
          />,
        ])
        setIsSandboxActive(true)
        return
      case 'clear':
        setMessages([
          <InitialMessage key="initial" onLoad={handleInitialMessageLoad} />,
        ])
        return
      case 'help':
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={
              <div>
                <p>Available commands:</p>
                <ul className="list-disc list-inside">
                  {commands.map((cmdDef) => {
                    const [first, ...rest] = cmdDef.split(' ')
                    const isStrikethrough = [
                      'sandbox:',
                      'projects:',
                      'blog:',
                      'resume:',
                    ].includes(first)
                    return (
                      <li
                        key={cmdDef}
                        className={cn(
                          'text-emerald-200',
                          isStrikethrough && 'line-through opacity-50',
                        )}
                      >
                        <span className="text-yellow-500">{first}</span>{' '}
                        {rest.join(' ')}
                      </li>
                    )
                  })}
                </ul>
              </div>
            }
          />,
        ])
        break
      case 'date':
        setMessages((prev) => [
          ...prev,
          <CommandOutput key={prev.length} output={new Date().toString()} />,
        ])
        break
      case 'whoami':
        setMessages((prev) => [
          ...prev,
          <CommandOutput key={prev.length} output={<span>{user_info.name}</span>} />,
        ])
        break
      case 'motd':
        try {
          const response = await fetch('https://api.adviceslip.com/advice')
          const data = await response.json()
          setMessages((prev) => [
            ...prev,
            <CommandOutput key={prev.length} output={data.slip.advice} />,
          ])
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            <CommandOutput
              key={prev.length}
              output="Failed to fetch message of the day."
            />,
          ])
        }
        break
      case 'about':
        setMessages((prev) => [
          ...prev,
          <CommandOutput key={prev.length} output={user_info.about} />,
        ])
        break
      case 'projects':
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={
              <div>
                <p>Retrieving project information...</p>
                <p>
                  Integration with Gemini and Deno Deploy database is under
                  development.
                </p>
                <p>Here are some sample projects:</p>
                <ul className="list-disc list-inside">
                  {user_info.projects.map((project) => (
                    <li key={project.name}>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {project.name}
                      </a>
                      : {project.description}
                    </li>
                  ))}
                </ul>
              </div>
            }
          />,
        ])
        break
      case 'contact':
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={
              <div>
                <p>You can reach me at:</p>
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${user_info.email}`}
                    className="text-blue-400 hover:underline"
                  >
                    {user_info.email}
                  </a>
                </p>
                <p>
                  Phone:{' '}
                  <a
                    href={`tel:${user_info.phone}`}
                    className="text-blue-400 hover:underline"
                  >
                    {user_info.phone}
                  </a>
                </p>
              </div>
            }
          />,
        ])
        break
      case 'github':
        window.open(user_info.github, '_blank')
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={`Opening GitHub: ${user_info.github}`}
          />,
        ])
        break
      case 'linkedin':
        window.open(user_info.linkedin, '_blank')
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={`Opening LinkedIn: ${user_info.linkedin}`}
          />,
        ])
        break
      case 'blog':
      case 'resume':
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output="This command is currently disabled."
          />,
        ])
        break
      default:
        setMessages((prev) => [
          ...prev,
          <TerminalLine key={prev.length} line={`command not found: ${cmd}`} />,
        ])
        break
    }
  }

  const handleSandboxExit = () => {
    setIsSandboxActive(false)
    setMessages(hiddenMessages) // Restore previously hidden messages
    setHiddenMessages([]) // Clear hidden messages after restoring
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
      {isSandboxActive ? (
        <LinuxSandbox onExit={handleSandboxExit} />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
