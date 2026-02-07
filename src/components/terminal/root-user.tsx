import { root_user as static_root_user } from '@/lib/constants'

interface RootUserProps {
  name?: string
}

export const RootUser = ({ name }: RootUserProps) => {
  return (
    <span className="text-violet-300">
      homegroup
      <b className="text-rose-500">@</b>
      {name || static_root_user}
    </span>
  )
}
