'use client'

import { useEffect, useRef, useState } from 'react'
import { CommandOutput } from './terminal/command-output'
import { InitialMessage } from './terminal/initial-message'
import { TerminalInput } from './terminal/terminal-input'
import { UserCommand } from './terminal/user-command'
import { TerminalLine } from './terminal/terminal-line'
import { AnimatedCommandOutput } from './terminal/animated-command-output'
import { user_info as static_user_info } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getUserInfo } from '../../server/actions'

export const Terminal = () => {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [commandHistory, setCommandHistory] = useState<Array<string>>([])
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(0)
  const [userInfo, setUserInfo] = useState<any>(static_user_info)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAIInfo = async () => {
      try {
        const info = await getUserInfo()
        if (info && !info.error) {
          setUserInfo(info)
          setMessages((prev) =>
            prev.map((msg) => {
              if (
                typeof msg === 'object' &&
                msg !== null &&
                'key' in msg &&
                msg.key === 'initial'
              ) {
                return (
                  <InitialMessage
                    key="initial"
                    onLoad={handleInitialMessageLoad}
                    userInfo={info}
                  />
                )
              }
              return msg
            }),
          )
        }
      } catch (e) {
        console.error('Failed to fetch AI info', e)
      }
    }
    fetchAIInfo()
  }, [])

  const handleInitialMessageLoad = () => {
    setShowInput(true)
  }

  const [messages, setMessages] = useState<Array<React.ReactNode>>([
    <InitialMessage
      key="initial"
      onLoad={handleInitialMessageLoad}
      userInfo={userInfo}
    />,
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
    'about: Learn more about Tenuka',
    "projects: View Tenuka's projects (In Development)",
    'contact: Get in touch with Tenuka',
    "github: Open Tenuka's GitHub profile",
    "linkedin: Open Tenuka's LinkedIn profile",
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
      case 'clear':
        setMessages([
          <InitialMessage
            key="initial"
            onLoad={handleInitialMessageLoad}
            userInfo={userInfo}
          />,
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
                    const isStrikethrough = ['blog:', 'resume:'].includes(first)
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
          <CommandOutput
            key={prev.length}
            output={
              <span dangerouslySetInnerHTML={{ __html: userInfo.name }} />
            }
          />,
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
          <AnimatedCommandOutput
            key={prev.length}
            output={
              <div dangerouslySetInnerHTML={{ __html: userInfo.about }} />
            }
          />,
        ])
        break
      case 'projects':
        setMessages((prev) => [
          ...prev,
          <AnimatedCommandOutput
            key={prev.length}
            output={
              <div>
                <p>Retrieving project information...</p>
                <p>Here are some sample projects:</p>
                <ul className="list-disc list-inside">
                  {userInfo.projects?.map((project: any) => (
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
                    href={`mailto:${userInfo.email}`}
                    className="text-blue-400 hover:underline"
                  >
                    {userInfo.email}
                  </a>
                </p>
                <p>
                  Phone:{' '}
                  <a
                    href={`tel:${userInfo.phone || static_user_info.phone}`}
                    className="text-blue-400 hover:underline"
                  >
                    {userInfo.phone || static_user_info.phone}
                  </a>
                </p>
              </div>
            }
          />,
        ])
        break
      case 'github':
        window.open(userInfo.github, '_blank')
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={`Opening GitHub: ${userInfo.github}`}
          />,
        ])
        break
      case 'linkedin':
        window.open(userInfo.linkedin, '_blank')
        setMessages((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={`Opening LinkedIn: ${userInfo.linkedin}`}
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
              userInfo={userInfo}
            />
          )}
        </div>
      </>
    </div>
  )
}
