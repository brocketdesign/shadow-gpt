"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Key, Plus, Trash2, Copy, Eye, EyeOff, BookOpen, Shield } from "lucide-react"

interface ApiKeyData {
  id: string
  name: string
  key: string
  secret?: string // only present right after creation
  lastUsedAt: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newlyCreated, setNewlyCreated] = useState<ApiKeyData | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const { toast } = useToast()

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys")
      const data = await res.json()
      if (data.success) {
        setApiKeys(data.apiKeys)
      }
    } catch {
      toast({ title: "Error", description: "Failed to load API keys", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "Error", description: "Please enter a name for the API key", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setNewlyCreated(data.apiKey)
        setNewKeyName("")
        fetchKeys()
        toast({ title: "API Key Created", description: "Save your secret now — it won't be shown again." })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const deleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setApiKeys((keys) => keys.filter((k) => k.id !== id))
        toast({ title: "Deleted", description: "API key has been revoked." })
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete API key", variant: "destructive" })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: `${label} copied to clipboard.` })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="gradient-bg text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Key className="w-8 h-8" />
              <h1 className="text-3xl sm:text-4xl font-bold text-center">API Keys</h1>
              <Shield className="w-8 h-8" />
            </div>
            <p className="text-center text-white/90 text-lg">
              Manage your API keys to access the Zenith AI API programmatically
            </p>
            <div className="flex justify-center mt-4">
              <a
                href="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View API Documentation
              </a>
            </div>
          </div>
        </div>

        {/* Create New Key */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Create New API Key
            </h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="keyName" className="sr-only">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. My Integration, Mobile App, Zapier..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createKey()}
                  disabled={creating}
                />
              </div>
              <Button onClick={createKey} disabled={creating} variant="gradient">
                {creating ? "Creating..." : "Generate Key"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Newly Created Key (show secret once) */}
        {newlyCreated?.secret && (
          <Card className="mb-6 border-2 border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Key Created: {newlyCreated.name}</h3>
                  <p className="text-sm text-green-600 mt-1">
                    ⚠️ Save these credentials now. The secret will not be shown again.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-green-700 font-medium">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-white border border-green-200 rounded-md px-3 py-2 text-sm font-mono break-all">
                      {newlyCreated.key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreated.key, "API Key")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-green-700 font-medium">API Secret</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-white border border-green-200 rounded-md px-3 py-2 text-sm font-mono break-all">
                      {showSecret ? newlyCreated.secret : "•".repeat(40)}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreated.secret!, "API Secret")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-green-700"
                onClick={() => { setNewlyCreated(null); setShowSecret(false) }}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing Keys */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Your API Keys</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No API keys yet. Create one above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{apiKey.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <code className="text-xs text-gray-500 font-mono">{apiKey.key}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(apiKey.key, "API Key")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsedAt && (
                          <> · Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteKey(apiKey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-3">How to Use</h2>
            <p className="text-sm text-gray-600 mb-4">
              Include your API key and secret in the request headers:
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto">
{`curl -X GET https://www.zenithai.me/api/v1/trackers \\
  -H "x-api-key: zk_your_api_key" \\
  -H "x-api-secret: zs_your_api_secret"`}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
