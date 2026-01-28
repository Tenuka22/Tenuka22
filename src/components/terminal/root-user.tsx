import { root_user } from '@/lib/constants'

export const RootUser = () => {
  return (
    <span className="text-violet-300">
      homegroup
      <b className="text-rose-500">@</b>
      {root_user}
    </span>
  )
}
