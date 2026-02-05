'use client'

import { Progress } from '@/components/ui/progress'

interface CreditBarProps {
  total: number
  spent: number
}

export function CreditBar({ total, spent }: CreditBarProps) {
  const remaining = total - spent
  const percentUsed = (spent / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Vote Credits</span>
        <span>
          <span className="font-semibold text-primary">{remaining}</span>
          <span className="text-muted-foreground"> / {total} remaining</span>
        </span>
      </div>
      <Progress value={100 - percentUsed} />
      <p className="text-xs text-muted-foreground">
        You've spent {spent} credits. Each additional vote costs more (quadratic pricing).
      </p>
    </div>
  )
}
