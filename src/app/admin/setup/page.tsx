'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Building,
  Users as UsersIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getAccessToken(): string | null {
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const session = JSON.parse(stored)
      return session?.access_token || null
    } catch {
      return null
    }
  }
  return null
}

interface Venue {
  id: string
  name: string
  capacity: number | null
  features: string[] | null
}

interface TimeSlot {
  id: string
  label: string | null
  start_time: string
  end_time: string
  is_break: boolean
}

export default function AdminSetupPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()

  const [venues, setVenues] = React.useState<Venue[]>([])
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'venues' | 'timeslots'>('venues')

  // New venue form state
  const [showVenueForm, setShowVenueForm] = React.useState(false)
  const [editingVenue, setEditingVenue] = React.useState<Venue | null>(null)
  const [venueName, setVenueName] = React.useState('')
  const [venueCapacity, setVenueCapacity] = React.useState('')
  const [venueFeatures, setVenueFeatures] = React.useState('')

  // New time slot form state
  const [showSlotForm, setShowSlotForm] = React.useState(false)
  const [editingSlot, setEditingSlot] = React.useState<TimeSlot | null>(null)
  const [slotLabel, setSlotLabel] = React.useState('')
  const [slotDate, setSlotDate] = React.useState('')
  const [slotStartTime, setSlotStartTime] = React.useState('')
  const [slotEndTime, setSlotEndTime] = React.useState('')
  const [slotIsBreak, setSlotIsBreak] = React.useState(false)

  // Redirect if not admin
  React.useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
      router.push('/sessions')
    }
  }, [user, profile, authLoading, router])

  // Fetch data
  React.useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken()
      const authHeader = token ? `Bearer ${token}` : `Bearer ${SUPABASE_KEY}`

      try {
        const [venuesRes, timeSlotsRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/venues?select=*&order=name`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': authHeader,
            },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/time_slots?select=*&order=start_time`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': authHeader,
            },
          }),
        ])

        if (venuesRes.ok) {
          setVenues(await venuesRes.json())
        }
        if (timeSlotsRes.ok) {
          setTimeSlots(await timeSlotsRes.json())
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Venue CRUD operations
  const handleSaveVenue = async () => {
    const token = getAccessToken()
    if (!token) return

    const features = venueFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const venueData = {
      name: venueName,
      capacity: venueCapacity ? parseInt(venueCapacity) : null,
      features: features.length > 0 ? features : null,
    }

    try {
      if (editingVenue) {
        // Update existing venue
        const response = await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${editingVenue.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(venueData),
        })

        if (response.ok) {
          const [updated] = await response.json()
          setVenues((prev) => prev.map((v) => (v.id === editingVenue.id ? updated : v)))
        }
      } else {
        // Create new venue
        const response = await fetch(`${SUPABASE_URL}/rest/v1/venues`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(venueData),
        })

        if (response.ok) {
          const [created] = await response.json()
          setVenues((prev) => [...prev, created])
        }
      }

      resetVenueForm()
    } catch (err) {
      console.error('Error saving venue:', err)
    }
  }

  const handleDeleteVenue = async (id: string) => {
    const token = getAccessToken()
    if (!token) return

    if (!confirm('Delete this venue? Sessions scheduled here will need to be rescheduled.')) return

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setVenues((prev) => prev.filter((v) => v.id !== id))
      }
    } catch (err) {
      console.error('Error deleting venue:', err)
    }
  }

  const startEditVenue = (venue: Venue) => {
    setEditingVenue(venue)
    setVenueName(venue.name)
    setVenueCapacity(venue.capacity?.toString() || '')
    setVenueFeatures(venue.features?.join(', ') || '')
    setShowVenueForm(true)
  }

  const resetVenueForm = () => {
    setShowVenueForm(false)
    setEditingVenue(null)
    setVenueName('')
    setVenueCapacity('')
    setVenueFeatures('')
  }

  // Time Slot CRUD operations
  const handleSaveTimeSlot = async () => {
    const token = getAccessToken()
    if (!token) return

    const startDateTime = `${slotDate}T${slotStartTime}:00`
    const endDateTime = `${slotDate}T${slotEndTime}:00`

    const slotData = {
      label: slotLabel || null,
      start_time: startDateTime,
      end_time: endDateTime,
      is_break: slotIsBreak,
    }

    try {
      if (editingSlot) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/time_slots?id=eq.${editingSlot.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(slotData),
        })

        if (response.ok) {
          const [updated] = await response.json()
          setTimeSlots((prev) =>
            prev.map((s) => (s.id === editingSlot.id ? updated : s)).sort((a, b) =>
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            )
          )
        }
      } else {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/time_slots`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(slotData),
        })

        if (response.ok) {
          const [created] = await response.json()
          setTimeSlots((prev) =>
            [...prev, created].sort((a, b) =>
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            )
          )
        }
      }

      resetSlotForm()
    } catch (err) {
      console.error('Error saving time slot:', err)
    }
  }

  const handleDeleteTimeSlot = async (id: string) => {
    const token = getAccessToken()
    if (!token) return

    if (!confirm('Delete this time slot? Sessions scheduled here will need to be rescheduled.'))
      return

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/time_slots?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setTimeSlots((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (err) {
      console.error('Error deleting time slot:', err)
    }
  }

  const startEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot)
    setSlotLabel(slot.label || '')
    const startDate = new Date(slot.start_time)
    const endDate = new Date(slot.end_time)
    setSlotDate(startDate.toISOString().split('T')[0])
    setSlotStartTime(startDate.toTimeString().slice(0, 5))
    setSlotEndTime(endDate.toTimeString().slice(0, 5))
    setSlotIsBreak(slot.is_break)
    setShowSlotForm(true)
  }

  const resetSlotForm = () => {
    setShowSlotForm(false)
    setEditingSlot(null)
    setSlotLabel('')
    setSlotDate('')
    setSlotStartTime('')
    setSlotEndTime('')
    setSlotIsBreak(false)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile?.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin
              </Link>
              <h1 className="font-bold text-lg">Event Setup</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('venues')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
                activeTab === 'venues'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <MapPin className="h-4 w-4" />
              Venues ({venues.length})
            </button>
            <button
              onClick={() => setActiveTab('timeslots')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
                activeTab === 'timeslots'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Clock className="h-4 w-4" />
              Time Slots ({timeSlots.length})
            </button>
          </div>

          {/* Venues Tab */}
          {activeTab === 'venues' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Configure the rooms and spaces for your event
                </p>
                <Button onClick={() => setShowVenueForm(true)} disabled={showVenueForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Venue
                </Button>
              </div>

              {/* Venue Form */}
              {showVenueForm && (
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingVenue ? 'Edit Venue' : 'New Venue'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name *</label>
                        <Input
                          placeholder="e.g., Main Hall"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Capacity</label>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
                          value={venueCapacity}
                          onChange={(e) => setVenueCapacity(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Features (comma-separated)</label>
                      <Input
                        placeholder="e.g., projector, whiteboard, round tables"
                        value={venueFeatures}
                        onChange={(e) => setVenueFeatures(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={resetVenueForm}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveVenue} disabled={!venueName}>
                        <Check className="h-4 w-4 mr-2" />
                        {editingVenue ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Venues List */}
              <div className="grid gap-4 md:grid-cols-2">
                {venues.map((venue) => (
                  <Card key={venue.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{venue.name}</h3>
                          </div>
                          {venue.capacity && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <UsersIcon className="h-4 w-4" />
                              <span>Capacity: {venue.capacity}</span>
                            </div>
                          )}
                          {venue.features && venue.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {venue.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditVenue(venue)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteVenue(venue.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {venues.length === 0 && !showVenueForm && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No venues configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first venue to start scheduling sessions
                    </p>
                    <Button onClick={() => setShowVenueForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Time Slots Tab */}
          {activeTab === 'timeslots' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Configure the event schedule time blocks</p>
                <Button onClick={() => setShowSlotForm(true)} disabled={showSlotForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>

              {/* Time Slot Form */}
              {showSlotForm && (
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingSlot ? 'Edit Time Slot' : 'New Time Slot'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Label</label>
                        <Input
                          placeholder="e.g., Morning Session 1"
                          value={slotLabel}
                          onChange={(e) => setSlotLabel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date *</label>
                        <Input
                          type="date"
                          value={slotDate}
                          onChange={(e) => setSlotDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time *</label>
                        <Input
                          type="time"
                          value={slotStartTime}
                          onChange={(e) => setSlotStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Time *</label>
                        <Input
                          type="time"
                          value={slotEndTime}
                          onChange={(e) => setSlotEndTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <div className="flex items-center gap-3 h-10">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={slotIsBreak}
                              onChange={(e) => setSlotIsBreak(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Break / Lunch</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={resetSlotForm}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveTimeSlot}
                        disabled={!slotDate || !slotStartTime || !slotEndTime}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {editingSlot ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time Slots List */}
              <div className="space-y-2">
                {timeSlots.map((slot) => {
                  const startDate = new Date(slot.start_time)
                  const endDate = new Date(slot.end_time)
                  return (
                    <Card key={slot.id} className={slot.is_break ? 'bg-muted/30' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[80px]">
                              <div className="text-sm font-medium">
                                {startDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {endDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{slot.label || 'Session Block'}</span>
                                {slot.is_break && (
                                  <Badge variant="secondary" className="text-xs">
                                    Break
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {startDate.toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEditSlot(slot)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {timeSlots.length === 0 && !showSlotForm && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No time slots configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Add time slots to define when sessions can be scheduled
                    </p>
                    <Button onClick={() => setShowSlotForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
