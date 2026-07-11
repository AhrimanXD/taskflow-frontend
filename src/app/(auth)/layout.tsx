"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-provider"
import { FullPageSpinner } from "@/components/common/full-page-spinner"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tasks")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || isAuthenticated) {
    return <FullPageSpinner />
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <div className="flex items-center gap-2 text-foreground">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutGrid className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Taskflow</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
