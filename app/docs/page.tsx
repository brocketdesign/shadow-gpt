import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Key, ArrowRight, Code, Lock, Zap, Clock } from "lucide-react"
import { CopyDocsButton } from "@/components/copy-docs-button"

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-800 border-green-200",
    POST: "bg-blue-100 text-blue-800 border-blue-200",
    PATCH: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DELETE: "bg-red-100 text-red-800 border-red-200",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${colors[method] || "bg-gray-100 text-gray-800"}`}>
      {method}
    </span>
  )
}

function StatusBadge({ status }: { status: "live" | "coming_soon" }) {
  if (status === "coming_soon") {
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
        <Clock className="w-3 h-3 mr-1" /> Coming Soon
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
      <Zap className="w-3 h-3 mr-1" /> Live
    </Badge>
  )
}

function EndpointCard({
  method,
  path,
  description,
  status = "live",
  bodyParams,
  queryParams,
  exampleResponse,
}: {
  method: string
  path: string
  description: string
  status?: "live" | "coming_soon"
  bodyParams?: { name: string; type: string; required: boolean; description: string }[]
  queryParams?: { name: string; type: string; required: boolean; description: string }[]
  exampleResponse?: string
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <MethodBadge method={method} />
          <code className="text-sm font-mono font-medium text-gray-800">{path}</code>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{description}</p>

        {queryParams && queryParams.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Query Parameters</h4>
            <div className="space-y-1">
              {queryParams.map((p) => (
                <div key={p.name} className="flex items-baseline gap-2 text-sm">
                  <code className="text-indigo-600 font-mono text-xs">{p.name}</code>
                  <span className="text-gray-400 text-xs">{p.type}</span>
                  {p.required && <span className="text-red-500 text-xs">required</span>}
                  <span className="text-gray-500 text-xs">— {p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {bodyParams && bodyParams.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Body Parameters (JSON)</h4>
            <div className="space-y-1">
              {bodyParams.map((p) => (
                <div key={p.name} className="flex items-baseline gap-2 text-sm">
                  <code className="text-indigo-600 font-mono text-xs">{p.name}</code>
                  <span className="text-gray-400 text-xs">{p.type}</span>
                  {p.required && <span className="text-red-500 text-xs">required</span>}
                  <span className="text-gray-500 text-xs">— {p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {exampleResponse && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Example Response</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto">
              {exampleResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="gradient-bg text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10" />
            <h1 className="text-4xl sm:text-5xl font-bold">Zenith AI API</h1>
          </div>
          <p className="text-center text-white/90 text-lg max-w-2xl mx-auto">
            Programmatically access your Zenith AI data. Track habits, manage challenges, and build integrations with your personal development workflow.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/settings/api-keys"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              <Key className="w-4 h-4" />
              Get API Keys
              <ArrowRight className="w-4 h-4" />
            </Link>
            <CopyDocsButton />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Authentication */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Authentication</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">
                All API requests require authentication via API key and secret sent as HTTP headers. You can generate API keys from your{" "}
                <Link href="/settings/api-keys" className="text-indigo-600 hover:underline font-medium">
                  API Keys settings page
                </Link>.
              </p>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Headers</h3>
                <div className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm font-mono">
                  <div><span className="text-green-400">x-api-key</span>: zk_your_api_key_here</div>
                  <div><span className="text-green-400">x-api-secret</span>: zs_your_api_secret_here</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Example Request</h3>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto">
{`curl -X GET https://www.zenithai.me/api/v1/trackers \\
  -H "x-api-key: zk_your_api_key" \\
  -H "x-api-secret: zs_your_api_secret" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Security:</strong> Never expose your API secret in client-side code. The secret is shown only once at creation time — store it securely.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Base URL */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Base URL</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono text-gray-800">
                https://www.zenithai.me/api/v1
              </code>
              <p className="text-sm text-gray-500 mt-3">
                All endpoints below are relative to this base URL. Responses are JSON with the following structure:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm mt-3 overflow-x-auto">
{`{
  "success": true | false,
  "error": "Error message (only on failure)",
  "data": { ... }
}`}
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Trackers */}
        <section id="trackers">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Trackers</h2>
          <p className="text-gray-600 mb-6">
            Custom trackers let you track any numeric metric over time (e.g. finances, weight, hours worked).
          </p>
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/api/v1/trackers"
              description="List all custom trackers with their entries for a given month."
              queryParams={[
                { name: "year", type: "number", required: false, description: "Year (defaults to current year)" },
                { name: "month", type: "number", required: false, description: "Month 1-12 (defaults to current month)" },
              ]}
              exampleResponse={`{
  "success": true,
  "trackers": [
    {
      "id": "65f...",
      "title": "Savings",
      "color": "#6366f1",
      "icon": "💰",
      "monthlyTotal": 1500,
      "entries": [
        { "id": "65f...", "date": "2026-02-01", "amount": 500 },
        { "id": "65f...", "date": "2026-02-15", "amount": 1000 }
      ]
    }
  ]
}`}
            />

            <EndpointCard
              method="POST"
              path="/api/v1/trackers"
              description="Create a new custom tracker."
              bodyParams={[
                { name: "title", type: "string", required: true, description: "Name of the tracker" },
                { name: "color", type: "string", required: false, description: "Hex color code (default: #6366f1)" },
                { name: "icon", type: "string", required: false, description: "Emoji icon (default: 📊)" },
              ]}
              exampleResponse={`{
  "success": true,
  "tracker": {
    "id": "65f...",
    "title": "Savings",
    "color": "#6366f1",
    "icon": "💰",
    "createdAt": "2026-02-17T00:00:00.000Z"
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/trackers/entries"
              description="Get entries for a specific tracker in a given month."
              queryParams={[
                { name: "trackerId", type: "string", required: true, description: "The tracker ID" },
                { name: "year", type: "number", required: false, description: "Year (defaults to current year)" },
                { name: "month", type: "number", required: false, description: "Month 1-12 (defaults to current month)" },
              ]}
              exampleResponse={`{
  "success": true,
  "tracker": { "id": "65f...", "title": "Savings" },
  "entries": [
    { "id": "65f...", "date": "2026-02-01", "amount": 500 },
    { "id": "65f...", "date": "2026-02-15", "amount": 1000 }
  ]
}`}
            />

            <EndpointCard
              method="POST"
              path="/api/v1/trackers/entries"
              description="Add or update a tracker entry for a given date. If an entry exists for that date, its amount will be updated."
              bodyParams={[
                { name: "trackerId", type: "string", required: true, description: "The tracker ID" },
                { name: "date", type: "string", required: true, description: "Date in YYYY-MM-DD format" },
                { name: "amount", type: "number", required: true, description: "Numeric amount to record" },
              ]}
              exampleResponse={`{
  "success": true,
  "entry": {
    "id": "65f...",
    "trackerId": "65f...",
    "date": "2026-02-17",
    "amount": 250
  }
}`}
            />
          </div>
        </section>

        {/* Challenges */}
        <section id="challenges">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Challenges</h2>
          <p className="text-gray-600 mb-6">
            Create and manage time-bound challenges with check-in tracking.
          </p>
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/api/v1/challenges"
              description="List all challenges with progress and check-in data."
              queryParams={[
                { name: "status", type: "string", required: false, description: 'Filter by status: "active", "completed", "failed", "archived"' },
              ]}
              exampleResponse={`{
  "success": true,
  "challenges": [
    {
      "id": "65f...",
      "title": "30-Day No Sugar",
      "description": "Eliminate added sugar for 30 days",
      "durationDays": 30,
      "startDate": "2026-02-01",
      "endDate": "2026-03-02",
      "status": "active",
      "progress": {
        "totalDays": 30,
        "completedDays": 15,
        "failedDays": 1,
        "skippedDays": 0,
        "percentComplete": 50
      },
      "checkIns": [...]
    }
  ]
}`}
            />

            <EndpointCard
              method="POST"
              path="/api/v1/challenges"
              description="Create a new challenge."
              bodyParams={[
                { name: "title", type: "string", required: true, description: "Challenge title" },
                { name: "description", type: "string", required: false, description: "Optional description" },
                { name: "durationDays", type: "number", required: true, description: "Duration in days (1-365)" },
                { name: "startDate", type: "string", required: false, description: "Start date YYYY-MM-DD (defaults to today)" },
              ]}
              exampleResponse={`{
  "success": true,
  "challenge": {
    "id": "65f...",
    "title": "30-Day No Sugar",
    "description": "Eliminate added sugar for 30 days",
    "durationDays": 30,
    "startDate": "2026-02-17",
    "endDate": "2026-03-18",
    "status": "active",
    "createdAt": "2026-02-17T00:00:00.000Z"
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/challenges/:id"
              description="Get a single challenge by ID with full progress and check-in data."
              exampleResponse={`{
  "success": true,
  "challenge": {
    "id": "65f...",
    "title": "30-Day No Sugar",
    "progress": { ... },
    "checkIns": [ ... ]
  }
}`}
            />

            <EndpointCard
              method="PATCH"
              path="/api/v1/challenges/:id"
              description="Update a challenge's title, description, or status."
              bodyParams={[
                { name: "title", type: "string", required: false, description: "New title" },
                { name: "description", type: "string", required: false, description: "New description" },
                { name: "status", type: "string", required: false, description: '"active", "completed", "failed", or "archived"' },
              ]}
              exampleResponse={`{
  "success": true,
  "challenge": {
    "id": "65f...",
    "title": "Updated Title",
    "status": "completed",
    "updatedAt": "2026-02-17T12:00:00.000Z"
  }
}`}
            />
          </div>
        </section>

        {/* Calendar / Daily Tracking */}
        <section id="calendar">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Calendar / Daily Tracking</h2>
          <p className="text-gray-600 mb-6">
            Log your daily SAVERS protocol, vice tracking, mood, energy levels, notes, and view streaks.
          </p>
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/api/v1/calendar"
              description="Get daily tracking data. Pass a single date to get one day, or year/month for the full month."
              queryParams={[
                { name: "date", type: "string", required: false, description: "Single date YYYY-MM-DD (returns one day)" },
                { name: "year", type: "number", required: false, description: "Year (defaults to current year, used with month)" },
                { name: "month", type: "number", required: false, description: "Month 1-12 (defaults to current month)" },
              ]}
              exampleResponse={`{
  "success": true,
  "data": {
    "id": "65f...",
    "date": "2026-02-17",
    "savers": {
      "silence": true,
      "affirmations": true,
      "visualization": false,
      "exercise": true,
      "reading": true,
      "scribing": false,
      "score": "4/6"
    },
    "vices": {
      "cokeFree": true,
      "beerFree": true,
      "weedFree": true,
      "snsFree": false,
      "pornFree": true,
      "score": "4/5"
    },
    "dailyAffirmation": "I am unstoppable.",
    "notes": "Great day overall.",
    "moodRating": 8,
    "energyLevel": 7
  }
}`}
            />

            <EndpointCard
              method="POST"
              path="/api/v1/calendar"
              description="Create or update a daily tracking entry for a specific date. Fields not provided default to false/null."
              bodyParams={[
                { name: "date", type: "string", required: true, description: "Date in YYYY-MM-DD format" },
                { name: "saversSilence", type: "boolean", required: false, description: "Meditation completed" },
                { name: "saversAffirmations", type: "boolean", required: false, description: "Affirmations completed" },
                { name: "saversVisualization", type: "boolean", required: false, description: "Visualization completed" },
                { name: "saversExercise", type: "boolean", required: false, description: "Exercise completed" },
                { name: "saversReading", type: "boolean", required: false, description: "Reading completed" },
                { name: "saversScribing", type: "boolean", required: false, description: "Journaling completed" },
                { name: "viceFreeCoke", type: "boolean", required: false, description: "Soda/cola free" },
                { name: "viceFreeBeer", type: "boolean", required: false, description: "Alcohol free" },
                { name: "viceFreeWeed", type: "boolean", required: false, description: "Cannabis free" },
                { name: "viceFreeSns", type: "boolean", required: false, description: "SNS free (<30min)" },
                { name: "viceFreePorn", type: "boolean", required: false, description: "Porn free" },
                { name: "dailyAffirmation", type: "string", required: false, description: "Daily affirmation text" },
                { name: "notes", type: "string", required: false, description: "Free-form notes" },
                { name: "moodRating", type: "number", required: false, description: "Mood rating (e.g. 1-10)" },
                { name: "energyLevel", type: "number", required: false, description: "Energy level (e.g. 1-10)" },
              ]}
              exampleResponse={`{
  "success": true,
  "data": {
    "id": "65f...",
    "date": "2026-02-17",
    "savers": { "silence": true, ... , "score": "5/6" },
    "vices": { "cokeFree": true, ... , "score": "5/5" },
    "dailyAffirmation": "I am unstoppable.",
    "notes": null,
    "moodRating": 8,
    "energyLevel": 7
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/calendar/streaks"
              description="Get current and best streaks for each SAVERS habit, each vice, and combined metrics (All SAVERS, Zero Vices, Perfect Day). Based on last 90 days of data."
              exampleResponse={`{
  "success": true,
  "streaks": {
    "savers": {
      "silence": { "current": 12, "best": 30, "lastDate": "2026-02-17", "label": "Meditation", "icon": "🧘" },
      "affirmations": { "current": 5, "best": 20, ... },
      ...
    },
    "vices": {
      "coke": { "current": 45, "best": 45, "lastDate": "2026-02-17", "label": "Soda Free", "icon": "🥤" },
      ...
    },
    "combined": {
      "allSavers": { "current": 3, "best": 14, "label": "All SAVERS", "icon": "🌟" },
      "allVices": { "current": 20, "best": 30, "label": "Zero Vices", "icon": "🛡️" },
      "perfectDay": { "current": 2, "best": 7, "label": "Perfect Day", "icon": "👑" }
    }
  }
}`}
            />
          </div>
        </section>

        {/* Protocols - Coming Soon */}
        <section id="protocols">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Custom Protocols</h2>
          <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <Clock className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                <h3 className="text-xl font-bold text-amber-800 mb-2">Coming Soon</h3>
                <p className="text-amber-700 max-w-md mx-auto">
                  The Custom Protocols API will allow you to create and manage your own daily boolean protocols and log completions. Check back for updates.
                </p>
                <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-sm text-amber-700">
                    <MethodBadge method="GET" />
                    <code className="font-mono text-xs">/api/v1/protocols</code>
                    <span className="text-xs">— List protocols</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-700">
                    <MethodBadge method="POST" />
                    <code className="font-mono text-xs">/api/v1/protocols</code>
                    <span className="text-xs">— Create a protocol</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-700">
                    <MethodBadge method="POST" />
                    <code className="font-mono text-xs">/api/v1/protocols/entries</code>
                    <span className="text-xs">— Log a protocol entry</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-700">
                    <MethodBadge method="GET" />
                    <code className="font-mono text-xs">/api/v1/protocols/entries</code>
                    <span className="text-xs">— Get protocol entries</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error Codes */}
        <section id="errors">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Error Codes</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Meaning</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">200</code></td>
                      <td className="py-2 px-3">OK</td>
                      <td className="py-2 px-3">Request succeeded</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">201</code></td>
                      <td className="py-2 px-3">Created</td>
                      <td className="py-2 px-3">Resource created successfully</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">400</code></td>
                      <td className="py-2 px-3">Bad Request</td>
                      <td className="py-2 px-3">Missing or invalid parameters</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">401</code></td>
                      <td className="py-2 px-3">Unauthorized</td>
                      <td className="py-2 px-3">Invalid or missing API credentials</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">404</code></td>
                      <td className="py-2 px-3">Not Found</td>
                      <td className="py-2 px-3">Resource not found or doesn&apos;t belong to you</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">409</code></td>
                      <td className="py-2 px-3">Conflict</td>
                      <td className="py-2 px-3">Resource already exists (duplicate)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3"><code className="font-mono text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">501</code></td>
                      <td className="py-2 px-3">Not Implemented</td>
                      <td className="py-2 px-3">Endpoint is coming soon</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rate Limiting Note */}
        <section>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-indigo-800 mb-2">📌 Rate Limits & Usage</h3>
              <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
                <li>Maximum 10 API keys per user</li>
                <li>All API endpoints are rate-limited to prevent abuse</li>
                <li>Responses are always in JSON format</li>
                <li>Dates should be in <code className="bg-indigo-100 px-1 rounded">YYYY-MM-DD</code> format</li>
                <li>All times are in UTC</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-gray-400 text-sm">
          Zenith AI API v1 — Built for builders 🚀
        </div>
      </main>
    </div>
  )
}
