import { RootUser } from './root-user'

export const UserCommand = ({ command }: { command: string }) => {
  return (
    <div className="flex gap-1 flex-row text-emerald-500 -mb-2 h-fit">
      <span>{'>>'}</span>
      <RootUser />
      <span>{'/~'}</span>
      <span className="text-yellow-200">{command}</span>
    </div>
  )
}
