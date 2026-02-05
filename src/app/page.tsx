'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Presentation, Vote, Calendar, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const handleEnter = () => {
    if (user) {
      router.push('/sessions')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Presentation className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Schelling Point</span>
          </div>
          <Button onClick={handleEnter} loading={isLoading}>
            {user ? 'Enter Event' : 'Sign In'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-primary">Democratic</span> Unconference
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Propose sessions, vote on what matters, and help shape the schedule.
          Your voice determines what gets talked about.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={handleEnter}>
            {user ? 'View Sessions' : 'Get Started'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sessions">Browse Sessions</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Presentation className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Propose Sessions</h3>
              <p className="text-muted-foreground">
                Share your expertise. Submit session proposals on topics you're passionate about.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quadratic Voting</h3>
              <p className="text-muted-foreground">
                Allocate your 100 credits to signal which sessions matter most to you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Build Your Schedule</h3>
              <p className="text-muted-foreground">
                Favorite sessions to create your personal schedule for the event.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How Quadratic Voting Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How Quadratic Voting Works</h2>
          <p className="text-muted-foreground mb-8">
            You have 100 credits to distribute. The cost of each additional vote increases quadratically.
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { votes: 1, cost: 1 },
              { votes: 2, cost: 4 },
              { votes: 3, cost: 9 },
              { votes: 4, cost: 16 },
            ].map(({ votes, cost }) => (
              <div key={votes} className="bg-card border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{votes}</div>
                <div className="text-sm text-muted-foreground">votes</div>
                <div className="text-lg font-semibold mt-2">{cost}</div>
                <div className="text-xs text-muted-foreground">credits</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This encourages spreading your votes across multiple sessions you care about.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Schelling Point MVP - Built for democratic unconference scheduling</p>
        </div>
      </footer>
    </div>
  )
}
