// src/components/terminal/linux-sandbox.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import {
  executeSandboxCommand,
  startSandbox,
  stopSandbox,
} from '../../../server/actions'
import { CommandOutput } from './command-output'
import { TerminalInput } from './terminal-input'
import { UserCommand } from './user-command'

interface LinuxSandboxProps {
  onExit: () => void
}

export const LinuxSandbox: React.FC<LinuxSandboxProps> = ({ onExit }) => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<Array<React.ReactNode>>([])
  const [commandHistory, setCommandHistory] = useState<Array<string>>([])
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number>(0)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  const startSandboxFn = useServerFn(startSandbox)
  const executeSandboxCommandFn = useServerFn(executeSandboxCommand)
  const stopSandboxFn = useServerFn(stopSandbox)

  useEffect(() => {
    const initializeSandbox = async () => {
      try {
        const data = await startSandboxFn()
        if (data.sessionId) {
          setSessionId(data.sessionId)
          setOutput([
            <CommandOutput
              key="welcome"
              output="Deno Sandbox Initialized. Type 'exit' or Ctrl+C to quit."
            />,
          ])
        } else if (data.error) {
          setOutput([
            <CommandOutput key="error" output={`Error: ${data.error}`} />,
          ])
        }
      } catch (error: any) {
        setOutput([
          <CommandOutput
            key="error"
            output={`Failed to connect to Deno Sandbox service: ${error.message}`}
          />,
        ])
      }
    }

    initializeSandbox()

    const handleCtrlC = (event: KeyboardEvent) => {
      if (event.key === 'c' && event.ctrlKey) {
        event.preventDefault()
        handleExit()
      }
    }

    document.addEventListener('keydown', handleCtrlC)

    return () => {
      document.removeEventListener('keydown', handleCtrlC)
      // Attempt to stop the sandbox session on unmount
      if (sessionId) {
        stopSandboxFn({ data: { sessionId } }).catch((err: unknown) =>
          console.error('Failed to stop sandbox on unmount:', err),
        )
      }
    }
  }, [onExit, sessionId])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  const handleCommand = async (command: string) => {
    setCommandHistory((prev) => [...prev, command])
    setOutput((prev) => [
      ...prev,
      <UserCommand key={prev.length} command={command} />,
    ])

    if (command.toLowerCase() === 'exit') {
      handleExit()
      return
    }

    if (sessionId) {
      try {
        const data = await executeSandboxCommandFn({
          data: { sessionId, command },
        })
        if (data.output) {
          setOutput((prev) => [
            ...prev,
            <CommandOutput key={prev.length} output={data.output} />,
          ])
        } else if (data.error) {
          setOutput((prev) => [
            ...prev,
            <CommandOutput key={prev.length} output={`Error: ${data.error}`} />,
          ])
        }
      } catch (error: any) {
        setOutput((prev) => [
          ...prev,
          <CommandOutput
            key={prev.length}
            output={`Failed to communicate with sandbox service: ${error.message}`}
          />,
        ])
      }
    } else {
      setOutput((prev) => [
        ...prev,
        <CommandOutput key={prev.length} output="Sandbox not initialized." />,
      ])
    }
  }

  const handleExit = async () => {
    if (sessionId) {
      try {
        await stopSandboxFn({ data: { sessionId } })
      } catch (err: unknown) {
        console.error('Failed to stop sandbox:', err)
      }
    }
    onExit()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-2">
        {output.map((line, index) => (
          <React.Fragment key={index}>{line}</React.Fragment>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <div className="p-2 border-t border-gray-700">
        <TerminalInput
          input={input}
          setInput={setInput}
          onEnter={handleCommand}
          commandHistory={commandHistory}
          setCommandHistoryIndex={setCommandHistoryIndex}
          commandHistoryIndex={commandHistoryIndex}
        />
      </div>
    </div>
  )
}
