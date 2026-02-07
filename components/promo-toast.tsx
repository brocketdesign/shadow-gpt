"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Zap } from "lucide-react"
import { useProModal } from "@/hooks/use-pro-modal"

export const PromoToast = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [isPro, setIsPro] = useState(false)
    const proModal = useProModal()

    useEffect(() => {
        const checkAndShow = async () => {
            try {
                // Check subscription status via API
                const response = await fetch('/api/subscription-status')
                const data = await response.json()
                const pro = data.isPro || false

                setIsPro(pro)

                // Don't show if user is already pro
                if (pro) return

                // Check if user has dismissed the promo
                const dismissed = localStorage.getItem("promo-toast-dismissed")
                if (dismissed) return

                // Show after 5 seconds
                setTimeout(() => {
                    setIsVisible(true)
                }, 5000)
            } catch (error) {
                console.error('Error checking subscription:', error)
            }
        }

        checkAndShow()
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("promo-toast-dismissed", "true")
    }

    const handleUpgrade = () => {
        setIsVisible(false)
        proModal.onOpen()
    }

    if (!isVisible || isPro) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="relative w-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-[2px]">
                <div className="bg-white rounded-2xl p-5 relative">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                                Unlock Your Full Potential
                            </h3>
                            <p className="text-sm text-gray-600">
                                Upgrade to <span className="font-semibold text-purple-600">Ascended</span> and get unlimited trackers, AI Coach, and more!
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4 pl-13">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Unlimited custom trackers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>AI-powered coaching</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Advanced analytics</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span>Upgrade Now</span>
                        <Zap className="w-4 h-4 fill-white" />
                    </button>

                    {/* Price */}
                    <p className="text-center text-xs text-gray-500 mt-2">
                        Only $9.99/month
                    </p>
                </div>
            </div>
        </div>
    )
}
