import { TerminalLine } from './terminal-line'
import { RootUser } from './root-user'

export const UserCommand = ({ command }: { command: string }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <RootUser />
      <span className="text-gray-400">:~$</span>
      <TerminalLine line={command} />
    </div>
  )
}
