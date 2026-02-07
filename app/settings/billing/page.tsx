import { checkSubscription } from "@/lib/subscription";
import { SubscriptionButton } from "@/components/subscription-button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Check, X } from "lucide-react";

const BillingPage = async () => {
    const isPro = await checkSubscription();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="gradient-bg text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8" />
                            <h1 className="text-3xl sm:text-4xl font-bold text-center">Subscription & Billing</h1>
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <p className="text-center text-white/90 text-lg">
                            Manage your plan and unlock your full potential
                        </p>
                    </div>
                </div>

                {/* Current Plan Card */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                            <div className="flex flex-col gap-y-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${isPro ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gray-400'}`} />
                                    <h2 className="font-bold text-2xl">
                                        {isPro ? "Ascended Plan" : "Initiate Plan"}
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    {isPro
                                        ? "You have unlimited access to all premium features."
                                        : "You're on the free plan with limited features."}
                                </p>
                            </div>
                            <SubscriptionButton isPro={isPro} />
                        </div>
                    </CardContent>
                </Card>

                {/* Features Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <Card className={!isPro ? "border-2 border-indigo-200" : ""}>
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold mb-2">Initiate</h3>
                                <div className="text-3xl font-bold text-gray-900">Free</div>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Maximum 3 custom trackers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Basic journal access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-400">No AI Coach</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-400">No advanced analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-400">No Monk Mode</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Premium Plan */}
                    <Card className={isPro ? "border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gradient-to-br from-indigo-50 to-purple-50"}>
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold">Ascended</h3>
                                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full">
                                        PRO
                                    </span>
                                </div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    $9.99<span className="text-lg text-gray-600">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Unlimited custom trackers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Unlimited AI Coach</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Advanced analytics & insights</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Monk Mode & app blocking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Exclusive 30-day challenges</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Cloud backup & multi-device sync</span>
                                </li>
                            </ul>
                            {!isPro && (
                                <div className="mt-6">
                                    <SubscriptionButton isPro={false} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default BillingPage;
