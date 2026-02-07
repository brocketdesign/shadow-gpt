"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  BarChart3,
  Wallet,
  Calendar,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ListChecks,
  Printer
} from "lucide-react"
import { format } from "date-fns"
import { getMonthName, cn, generateRandomColor } from "@/lib/utils"

interface TrackerTotal {
  trackerId: string
  title: string
  icon: string
  color: string
  total: number
}

interface TrackerEntry {
  id: string
  date: string
  amount: number
  trackerTitle: string
  trackerIcon: string
}

interface DashboardStats {
  totalAmount: number
  daysWithEntries: number
  totalEntries: number
}

interface Tracker {
  id: string
  title: string
  icon: string
  color: string
}

export default function TrackersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [totals, setTotals] = useState<TrackerTotal[]>([])
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddEntryModal, setShowAddEntryModal] = useState(false)
  const [filterTracker, setFilterTracker] = useState("")

  const [createForm, setCreateForm] = useState({
    title: "",
    icon: "📊",
    color: "#6366f1",
  })
  const [entryForm, setEntryForm] = useState({
    trackerId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
  })
  const [creating, setCreating] = useState(false)
  const [addingEntry, setAddingEntry] = useState(false)

  const loadDashboardData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/trackers?action=dashboard&year=${currentYear}&month=${currentMonth}`)
      const data = await res.json()

      if (data.success) {
        setStats(data.stats)
        setTotals(data.totals)
        setEntries(data.entries)
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [user, currentYear, currentMonth])

  const loadTrackers = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/trackers?action=list&year=${currentYear}&month=${currentMonth}`)
      const data = await res.json()

      if (data.success) {
        setTrackers(data.trackers.map((t: Tracker) => ({
          id: t.id,
          title: t.title,
          icon: t.icon,
          color: t.color,
        })))
      }
    } catch (error) {
      console.error("Error loading trackers:", error)
    }
  }, [user, currentYear, currentMonth])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadTrackers()
    }
  }, [user, loadDashboardData, loadTrackers])

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleCreateTracker = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...createForm,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Tracker created! 📊",
          variant: "success",
        })
        setShowCreateModal(false)
        setCreateForm({ title: "", icon: "📊", color: generateRandomColor() })
        loadTrackers()
        loadDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to create tracker",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingEntry(true)

    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_entry",
          trackerId: entryForm.trackerId,
          date: entryForm.date,
          amount: parseFloat(entryForm.amount) || 0,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Entry added! ✅",
          variant: "success",
        })
        setShowAddEntryModal(false)
        setEntryForm({
          trackerId: "",
          date: format(new Date(), "yyyy-MM-dd"),
          amount: "",
        })
        loadDashboardData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to add entry",
        variant: "destructive",
      })
    } finally {
      setAddingEntry(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Delete this entry?")) return

    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_entry",
          entryId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: "Entry deleted", variant: "default" })
        loadDashboardData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTracker = async (trackerId: string) => {
    if (!confirm("Delete this tracker? All associated entries will also be permanently deleted.")) return

    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_tracker",
          trackerId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: "Tracker deleted", variant: "default" })
        loadDashboardData()
        loadTrackers()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete tracker",
        variant: "destructive",
      })
    }
  }

  const filteredEntries = filterTracker
    ? entries.filter((e) => e.trackerTitle === filterTracker)
    : entries

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="gradient-bg-teal text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Finances Dashboard
            </h1>

            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h2 className="text-2xl font-semibold min-w-[200px] text-center">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-teal-600">
                {loading ? "--" : `$${stats?.totalAmount.toFixed(2) || 0}`}
              </div>
              <div className="text-gray-600 mt-1">💰 Monthly Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {loading ? "--" : stats?.daysWithEntries || 0}
              </div>
              <div className="text-gray-600 mt-1">📅 Days with Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <ListChecks className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {loading ? "--" : stats?.totalEntries || 0}
              </div>
              <div className="text-gray-600 mt-1">📝 Total Entries</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Tracker
          </Button>
          <Button variant="outline" onClick={() => setShowAddEntryModal(true)} disabled={trackers.length === 0}>
            <DollarSign className="w-5 h-5 mr-2" />
            Add Entry
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-5 h-5 mr-2" />
            Print
          </Button>
        </div>

        {/* Totals by Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Totals by Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-200 rounded-lg" />
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>
            ) : totals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No trackers created yet. Start by creating your first tracker!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {totals.map((tracker) => (
                  <div
                    key={tracker.trackerId}
                    className="flex items-center gap-4 p-4 rounded-xl border relative group"
                    style={{ borderColor: tracker.color + "40", backgroundColor: tracker.color + "10" }}
                  >
                    <span className="text-3xl">{tracker.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{tracker.title}</div>
                      <div className="text-2xl font-bold" style={{ color: tracker.color }}>
                        {tracker.total.toFixed(2)} $
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTracker(tracker.trackerId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Entry Details
              </CardTitle>
              <select
                value={filterTracker}
                onChange={(e) => setFilterTracker(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All trackers</option>
                {trackers.map((t) => (
                  <option key={t.id} value={t.title}>{t.icon} {t.title}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No entries for this month. Add entries from the form!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Tracker</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {format(new Date(entry.date), "MMMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span>{entry.trackerIcon}</span>
                            {entry.trackerTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ${entry.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center print:hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Tracker Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-teal-500" />
              New Tracker
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTracker} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackerTitle">Tracker Name *</Label>
              <Input
                id="trackerTitle"
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="E.g., Coffee Spending, Transport..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackerIcon">Icon</Label>
                <Input
                  id="trackerIcon"
                  value={createForm.icon}
                  onChange={(e) => setCreateForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="📊"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackerColor">Color</Label>
                <Input
                  id="trackerColor"
                  type="color"
                  value={createForm.color}
                  onChange={(e) => setCreateForm((p) => ({ ...p, color: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Entry Modal */}
      <Dialog open={showAddEntryModal} onOpenChange={setShowAddEntryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-teal-500" />
              Add Entry
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entryTracker">Tracker *</Label>
              <select
                id="entryTracker"
                value={entryForm.trackerId}
                onChange={(e) => setEntryForm((p) => ({ ...p, trackerId: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a tracker</option>
                {trackers.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryAmount">Amount ($) *</Label>
                <Input
                  id="entryAmount"
                  type="number"
                  step="0.01"
                  value={entryForm.amount}
                  onChange={(e) => setEntryForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEntryModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={addingEntry}>
                {addingEntry ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
