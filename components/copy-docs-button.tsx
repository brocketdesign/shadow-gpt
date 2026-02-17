"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

const API_DOCS_MARKDOWN = `# Zenith AI API Documentation

Base URL: \`https://www.zenithai.me/api/v1\`

## Authentication

All API requests require authentication via API key and secret sent as HTTP headers.

### Required Headers

\`\`\`
x-api-key: zk_your_api_key_here
x-api-secret: zs_your_api_secret_here
Content-Type: application/json
\`\`\`

### Example Request

\`\`\`bash
curl -X GET https://www.zenithai.me/api/v1/trackers \\
  -H "x-api-key: zk_your_api_key" \\
  -H "x-api-secret: zs_your_api_secret" \\
  -H "Content-Type: application/json"
\`\`\`

> ⚠️ **Security:** Never expose your API secret in client-side code. The secret is shown only once at creation time — store it securely.

---

## Response Format

All responses are JSON:

\`\`\`json
{
  "success": true | false,
  "error": "Error message (only on failure)",
  "data": { ... }
}
\`\`\`

---

## 📊 Trackers

Custom trackers let you track any numeric metric over time (e.g. finances, weight, hours worked).

### GET /api/v1/trackers

List all custom trackers with their entries for a given month.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | number | No | Year (defaults to current year) |
| month | number | No | Month 1-12 (defaults to current month) |

**Example Response:**

\`\`\`json
{
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
}
\`\`\`

### POST /api/v1/trackers

Create a new custom tracker.

**Body Parameters (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Name of the tracker |
| color | string | No | Hex color code (default: #6366f1) |
| icon | string | No | Emoji icon (default: 📊) |

**Example Response:**

\`\`\`json
{
  "success": true,
  "tracker": {
    "id": "65f...",
    "title": "Savings",
    "color": "#6366f1",
    "icon": "💰",
    "createdAt": "2026-02-17T00:00:00.000Z"
  }
}
\`\`\`

### GET /api/v1/trackers/entries

Get entries for a specific tracker in a given month.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| trackerId | string | Yes | The tracker ID |
| year | number | No | Year (defaults to current year) |
| month | number | No | Month 1-12 (defaults to current month) |

**Example Response:**

\`\`\`json
{
  "success": true,
  "tracker": { "id": "65f...", "title": "Savings" },
  "entries": [
    { "id": "65f...", "date": "2026-02-01", "amount": 500 },
    { "id": "65f...", "date": "2026-02-15", "amount": 1000 }
  ]
}
\`\`\`

### POST /api/v1/trackers/entries

Add or update a tracker entry for a given date. If an entry exists for that date, its amount will be updated.

**Body Parameters (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| trackerId | string | Yes | The tracker ID |
| date | string | Yes | Date in YYYY-MM-DD format |
| amount | number | Yes | Numeric amount to record |

**Example Response:**

\`\`\`json
{
  "success": true,
  "entry": {
    "id": "65f...",
    "trackerId": "65f...",
    "date": "2026-02-17",
    "amount": 250
  }
}
\`\`\`

---

## 🎯 Challenges

Create and manage time-bound challenges with check-in tracking.

### GET /api/v1/challenges

List all challenges with progress and check-in data.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: "active", "completed", "failed", "archived" |

**Example Response:**

\`\`\`json
{
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
}
\`\`\`

### POST /api/v1/challenges

Create a new challenge.

**Body Parameters (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Challenge title |
| description | string | No | Optional description |
| durationDays | number | Yes | Duration in days (1-365) |
| startDate | string | No | Start date YYYY-MM-DD (defaults to today) |

**Example Response:**

\`\`\`json
{
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
}
\`\`\`

### GET /api/v1/challenges/:id

Get a single challenge by ID with full progress and check-in data.

**Example Response:**

\`\`\`json
{
  "success": true,
  "challenge": {
    "id": "65f...",
    "title": "30-Day No Sugar",
    "progress": { ... },
    "checkIns": [ ... ]
  }
}
\`\`\`

### PATCH /api/v1/challenges/:id

Update a challenge's title, description, or status.

**Body Parameters (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | New title |
| description | string | No | New description |
| status | string | No | "active", "completed", "failed", or "archived" |

**Example Response:**

\`\`\`json
{
  "success": true,
  "challenge": {
    "id": "65f...",
    "title": "Updated Title",
    "status": "completed",
    "updatedAt": "2026-02-17T12:00:00.000Z"
  }
}
\`\`\`

---

## 📅 Calendar / Daily Tracking (Coming Soon)

The Calendar API will allow you to programmatically log your daily SAVERS protocol, vice tracking, mood, energy levels, and notes.

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/v1/calendar | Get daily tracking data | Coming Soon |
| POST | /api/v1/calendar | Log a daily entry | Coming Soon |
| GET | /api/v1/calendar/streaks | Get streak data | Coming Soon |

---

## ✅ Custom Protocols (Coming Soon)

The Custom Protocols API will allow you to create and manage your own daily boolean protocols and log completions.

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/v1/protocols | List protocols | Coming Soon |
| POST | /api/v1/protocols | Create a protocol | Coming Soon |
| POST | /api/v1/protocols/entries | Log a protocol entry | Coming Soon |
| GET | /api/v1/protocols/entries | Get protocol entries | Coming Soon |

---

## Error Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid or missing API credentials |
| 404 | Not Found | Resource not found or doesn't belong to you |
| 409 | Conflict | Resource already exists (duplicate) |
| 501 | Not Implemented | Endpoint is coming soon |

---

## Rate Limits & Usage

- Maximum 10 API keys per user
- All API endpoints are rate-limited to prevent abuse
- Responses are always in JSON format
- Dates should be in \`YYYY-MM-DD\` format
- All times are in UTC
`

export function CopyDocsButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(API_DOCS_MARKDOWN)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = API_DOCS_MARKDOWN
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
        copied
          ? "bg-green-500 text-white"
          : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy as Markdown
        </>
      )}
    </button>
  )
}
