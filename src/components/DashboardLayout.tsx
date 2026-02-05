'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Presentation,
  Calendar,
  Heart,
  ClipboardList,
  Users,
  PlusCircle,
  Settings,
  LogOut,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditBar } from '@/components/CreditBar'
import { OnboardingModal } from '@/components/auth/OnboardingModal'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const TOTAL_CREDITS = 100

interface DashboardLayoutProps {
  children: React.ReactNode
  creditsSpent?: number
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/sessions', label: 'Sessions', icon: Presentation },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/my-schedule', label: 'My Schedule', icon: Heart },
  { href: '/my-votes', label: 'My Votes', icon: ClipboardList },
  { href: '/participants', label: 'Participants', icon: Users },
]

const actionItems = [
  { href: '/propose', label: 'Propose Session', icon: PlusCircle },
]

export function DashboardLayout({ children, creditsSpent = 0 }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, profile, signOut, needsOnboarding, refreshProfile } = useAuth()
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  // Show onboarding modal when needed
  React.useEffect(() => {
    if (needsOnboarding) {
      setShowOnboarding(true)
    }
  }, [needsOnboarding])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    refreshProfile()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                <img src="/logo.svg" alt="Schelling Point" className="h-8 w-8 rounded" />
                <span className="hidden sm:inline">Schelling Point</span>
              </Link>
              {profile?.is_admin && (
                <Badge variant="secondary" className="text-xs bg-[#B2FF00]/20 text-[#B2FF00] border-[#B2FF00]/30">
                  Admin
                </Badge>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {profile?.display_name || user.email}
                  </span>
                  {profile?.is_admin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin">
                        <Settings className="h-4 w-4 mr-1" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Credits Bar */}
      {user && (
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <CreditBar total={TOTAL_CREDITS} spent={creditsSpent} />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto py-2 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm font-medium rounded-md whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}

            <div className="flex-1" />

            {actionItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm font-medium rounded-md whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          email={user.email || ''}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  )
}
