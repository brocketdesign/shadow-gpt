"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Zap,
} from "lucide-react"
import {
  DISCIPLINE_LEVELS,
  PAIN_POINTS,
  VISION_OPTIONS,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 6

export function OnboardingWizard() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const holdStartRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)

  // Form data
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [disciplineLevel, setDisciplineLevel] = useState("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [painPointsOther, setPainPointsOther] = useState("")
  const [vision, setVision] = useState<string[]>([])
  const [visionCustom, setVisionCustom] = useState("")

  // Generated content
  const [generatedContent, setGeneratedContent] = useState<{
    affirmations: string[]
    trackers: { title: string; icon: string; color: string }[]
    challenge: { title: string; description: string } | null
  } | null>(null)

  const progressPercent = ((step) / (TOTAL_STEPS - 1)) * 100

  const pactText = name && painPoints.length && vision.length
    ? `I, ${name}, commit to attacking ${painPoints.map(pp => {
        const found = PAIN_POINTS.find(p => p.value === pp)
        return found ? found.label.toLowerCase() : pp
      }).join(', ')} to achieve ${vision.map(v => {
        const found = VISION_OPTIONS.find(o => o.value === v)
        return found ? found.label.toLowerCase() : v
      }).join(', ')}.`
    : ""

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return true
      case 1: return name.trim().length > 0 && age.trim().length > 0 && disciplineLevel !== ""
      case 2: return painPoints.length > 0
      case 3: return vision.length > 0
      case 4: return true // hold-to-sign handles this
      case 5: return true
      default: return false
    }
  }, [step, name, age, disciplineLevel, painPoints, vision])

  const togglePainPoint = (value: string) => {
    setPainPoints(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    )
  }

  const toggleVision = (value: string) => {
    setVision(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const submitOnboarding = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: parseInt(age, 10),
          disciplineLevel,
          painPoints,
          painPointsOther: painPointsOther.trim() || undefined,
          vision,
          visionCustom: visionCustom.trim() || undefined,
          pactText,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setGeneratedContent(data.generatedContent)
        setStep(5)
        await refreshUser()
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [name, age, disciplineLevel, painPoints, painPointsOther, vision, visionCustom, pactText, refreshUser, toast])

  // Hold-to-sign logic
  const startHold = useCallback(() => {
    holdStartRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min((elapsed / 3000) * 100, 100)
      setHoldProgress(progress)
      if (progress >= 100) {
        submitOnboarding()
        return
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
  }, [submitOnboarding])

  const endHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    setHoldProgress(0)
  }, [])

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const goNext = () => {
    if (step < TOTAL_STEPS - 1 && canProceed()) {
      setStep(s => s + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }

  const goToDashboard = () => {
    router.push("/")
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <div className="max-w-lg mx-auto">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Step {step} of {TOTAL_STEPS - 2}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Step 0: The Hook */}
            {step === 0 && (
              <motion.div
                key="step0"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                    Take Back Control.
                  </h1>
                  <p className="text-lg text-gray-600 max-w-md mx-auto">
                    Your personal protocol for discipline, clarity, and transformation starts now.
                  </p>
                </div>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={goNext}
                  className="text-lg px-8 py-6"
                >
                  Start Initialization
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Identity & Base */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Who are you?</h2>
                  <p className="text-gray-600 mt-1">Let&apos;s calibrate your experience.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input
                      placeholder="Your first name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <Input
                      type="number"
                      placeholder="Your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="text-lg"
                      min={13}
                      max={120}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Current discipline level?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DISCIPLINE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setDisciplineLevel(level.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          disciplineLevel === level.value
                            ? "border-indigo-500 bg-indigo-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <span className="text-2xl">{level.icon}</span>
                        <p className="font-medium text-sm mt-1">{level.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={goBack} className="flex-shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Diagnosis (Pain Points) */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">What holds you back?</h2>
                  <p className="text-gray-600 mt-1">Select all that apply.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PAIN_POINTS.map((pp) => (
                    <button
                      key={pp.value}
                      type="button"
                      onClick={() => togglePainPoint(pp.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all duration-200",
                        painPoints.includes(pp.value)
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{pp.icon}</span>
                        {painPoints.includes(pp.value) && (
                          <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </div>
                      <p className="font-medium text-sm mt-2">{pp.label}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other (optional)
                  </label>
                  <Input
                    placeholder="Describe other challenges..."
                    value={painPointsOther}
                    onChange={(e) => setPainPointsOther(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={goBack} className="flex-shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Vision (North Star) */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Where do you want to be in 6 months?</h2>
                  <p className="text-gray-600 mt-1">Select your vision.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {VISION_OPTIONS.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => toggleVision(v.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all duration-200",
                        vision.includes(v.value)
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{v.icon}</span>
                        {vision.includes(v.value) && (
                          <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </div>
                      <p className="font-medium text-sm mt-2">{v.label}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom vision (optional)
                  </label>
                  <Input
                    placeholder="Describe your specific goal..."
                    value={visionCustom}
                    onChange={(e) => setVisionCustom(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={goBack} className="flex-shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: The Pact */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Your Pact</h2>
                  <p className="text-gray-600 mt-1">Make it official. Sign your commitment.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-800 leading-relaxed italic">
                      &ldquo;{pactText}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">
                    Hold the button for 3 seconds to sign your pact
                  </p>

                  {/* Hold-to-sign button */}
                  <div className="relative inline-block w-full">
                    <button
                      type="button"
                      onMouseDown={startHold}
                      onMouseUp={endHold}
                      onMouseLeave={endHold}
                      onTouchStart={startHold}
                      onTouchEnd={endHold}
                      disabled={loading}
                      className={cn(
                        "w-full py-5 px-8 rounded-2xl font-bold text-lg text-white transition-all duration-200 relative overflow-hidden",
                        loading
                          ? "bg-gray-400 cursor-wait"
                          : "gradient-bg hover:shadow-lg active:scale-[0.98] cursor-pointer"
                      )}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-0 bg-white/30 transition-none"
                        style={{ width: `${holdProgress}%` }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Calibrating Protocol...
                          </>
                        ) : holdProgress > 0 ? (
                          <>
                            <Zap className="w-5 h-5" />
                            Signing... {Math.round(holdProgress)}%
                          </>
                        ) : (
                          <>
                            Hold to Sign
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={goBack} className="flex-1" disabled={loading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: AI Setup (Results) */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Protocol Calibrated</h2>
                  <p className="text-gray-600 mt-1">Your dashboard is ready, {name}.</p>
                </div>

                {generatedContent && (
                  <div className="space-y-4">
                    {/* Affirmations */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">
                        🔥 Your Affirmations
                      </h3>
                      <div className="space-y-2">
                        {generatedContent.affirmations.map((aff, i) => (
                          <p key={i} className="text-sm text-gray-800 italic">
                            &ldquo;{aff}&rdquo;
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Trackers */}
                    {generatedContent.trackers.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">
                          📊 Your Trackers
                        </h3>
                        <div className="space-y-2">
                          {generatedContent.trackers.map((tracker, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                style={{ backgroundColor: tracker.color + '20' }}
                              >
                                {tracker.icon}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{tracker.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenge */}
                    {generatedContent.challenge && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">
                          🎯 Your First Challenge
                        </h3>
                        <p className="font-medium text-gray-800">{generatedContent.challenge.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{generatedContent.challenge.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={goToDashboard}
                  className="w-full text-lg py-6"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
