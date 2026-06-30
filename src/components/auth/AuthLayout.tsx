import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary">EcoPort</h1>
          </Link>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">{title}</h2>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}