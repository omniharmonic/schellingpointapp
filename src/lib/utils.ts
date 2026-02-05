import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Quadratic voting: credits = votes^2
export function votesToCredits(votes: number): number {
  return votes * votes
}

// Inverse: votes = sqrt(credits)
export function creditsToVotes(credits: number): number {
  return Math.floor(Math.sqrt(credits))
}

// Cost of next vote given current votes
export function nextVoteCost(currentVotes: number): number {
  return (currentVotes + 1) * (currentVotes + 1) - currentVotes * currentVotes
}

// Max votes possible with available credits
export function maxVotesWithCredits(credits: number): number {
  return Math.floor(Math.sqrt(credits))
}
