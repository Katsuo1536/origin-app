'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouteGuard } from './_hooks/useRouteGuard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRouteGuard()

  const pathname = usePathname()
  const isSelected = (href: string) => {
    return pathname.includes(href)
  }

  return (
    <>

      {/* メインエリア */}
      <div className="ml-70 p-4">{children}</div>
    </>
  )
}