import { createServerFn } from '@tanstack/react-start'
import { Sandbox, DenoRepl } from '@deno/sandbox'
import { ulid } from 'ulid'

interface SandboxSession {
  sandbox: Sandbox
  repl: DenoRepl
  lastUsed: number
}

const activeSandboxSessions = new Map<string, SandboxSession>()

export const startSandbox = createServerFn<any, 'POST'>({ method: 'POST' }).handler(
  async () => {
  const newSessionId = ulid()
  try {
    const sandbox = await Sandbox.create()
    const repl = await sandbox.deno.repl()
    activeSandboxSessions.set(newSessionId, {
      sandbox,
      repl,
      lastUsed: Date.now(),
    })
    return { sessionId: newSessionId, message: 'Deno Sandbox started.' }
  } catch (error: any) {
    return { error: `Failed to start Deno Sandbox: ${error.message}` }
  }
})

export const executeSandboxCommand = createServerFn<any, 'POST', { sessionId: string; command: string }>({
  method: 'POST',
})
  .inputValidator((data: { sessionId: string; command: string }) => data)
  .handler(async ({ data }: { data: { sessionId: string; command: string } }) => {
    const { sessionId, command } = data
    if (!sessionId || !command) {
      return { error: 'Session ID and command are required.' }
    }
    const session = activeSandboxSessions.get(sessionId)
    if (!session) {
      return { error: 'Sandbox session not found.' }
    }

    session.lastUsed = Date.now() // Update last used time

    try {
      const result = await session.repl.eval(command)
      return { output: String(result) }
    } catch (error: any) {
      return { error: `Command execution failed: ${error.message}` }
    }
  },
)

export const stopSandbox = createServerFn<any, 'POST', { sessionId: string }>({ method: 'POST' })
  .inputValidator((data: { sessionId: string }) => data)
  .handler(
  async ({ data }: { data: { sessionId: string } }) => {
    const { sessionId } = data
    if (!sessionId) {
      return { error: 'Session ID is required.' }
    }
    const session = activeSandboxSessions.get(sessionId)
    if (session) {
      session.repl.close()
      session.sandbox.close()
      activeSandboxSessions.delete(sessionId)
      return { message: `Sandbox session ${sessionId} stopped.` }
    } else {
      return { message: 'Sandbox session not found or already stopped.' }
    }
  },
)

// Inactivity timeout cleanup
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of activeSandboxSessions.entries()) {
    if (now - session.lastUsed > INACTIVITY_TIMEOUT_MS) {
      console.log(`Stopping inactive sandbox session: ${sessionId}`)
      session.repl.close()
      session.sandbox.close()
      activeSandboxSessions.delete(sessionId)
    }
  }
}, 60 * 1000) // Check every minute
