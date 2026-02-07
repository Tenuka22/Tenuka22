'use client'

import { useEffect, useState } from 'react'
import { RootUser } from './root-user'
import { ascii_name } from '@/lib/constants'
import { getClientInfo } from '@/lib/client'

interface InitialMessageProps {
  onLoad: () => void
  userInfo?: any
}

export const InitialMessage = ({ onLoad, userInfo }: InitialMessageProps) => {
  const [info, setInfo] = useState<ReturnType<typeof getClientInfo>>(null)

  useEffect(() => {
    setInfo(getClientInfo())
    // Add a small delay for better UX before enabling input
    const timer = setTimeout(() => {
      onLoad()
    }, 1000) // 1 second delay
    return () => clearTimeout(timer)
  }, [onLoad])

  return (
    <div className="grid lg:grid-cols-2 place-items-center size-full flex-1">
      <pre className="font-mono p-4 lg:p-2 lg:text-sm sm:text-xs text-[0.5rem] leading-relaxed h-fit">
        {ascii_name}
      </pre>
      {info && (
        <div className="flex flex-col text-orange-300">
          <RootUser name={userInfo?.plainName} />
          {Object.entries(info).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[auto_1fr] items-center gap-1 p-1 border rounded"
            >
              <span className="text-emerald-500 font-mono h-full">
                {k.toUpperCase().padEnd(12)}:
              </span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
