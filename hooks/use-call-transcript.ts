"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TranscriptLine {
  id: string
  speaker: "agent" | "customer" | "system"
  text: string
  timestamp: string
  sentiment?: "positive" | "neutral" | "negative"
  isPartial?: boolean
}

export interface AiSuggestion {
  id: string
  type: "knowledge" | "compliance" | "empathy" | "upsell" | "procedure"
  title: string
  text: string
  confidence: number
  timestamp: string
  isNew?: boolean
}

export interface QmScore {
  greeting: number
  empathy: number
  compliance: number
  resolution: number
  closing: number
  overall: number
}

export interface CallTranscriptState {
  transcript: TranscriptLine[]
  suggestions: AiSuggestion[]
  qmScore: QmScore
  sentimentTimeline: Array<{ time: string; score: number }>
  isListening: boolean
  callDuration: number
}

// Realistic banking conversation fragments
const conversationFlows: Array<{ speaker: "agent" | "customer"; text: string; sentiment?: TranscriptLine["sentiment"] }[]> = [
  [
    { speaker: "customer", text: "Hi, I noticed a charge on my credit card that I don't recognize. It's for $247.50 from some company called TechServ Pro.", sentiment: "negative" },
    { speaker: "agent", text: "I understand your concern. Let me pull up your recent transactions. Can you confirm the last four digits of your card?", sentiment: "neutral" },
    { speaker: "customer", text: "Sure, it's 4829.", sentiment: "neutral" },
    { speaker: "agent", text: "Thank you. I can see the charge from TechServ Pro posted on April 18th. This appears to be a subscription service. Have you signed up for any software or tech services recently?", sentiment: "neutral" },
    { speaker: "customer", text: "Oh wait... actually I think that might be the antivirus I got last month. I didn't recognize the billing name.", sentiment: "positive" },
    { speaker: "agent", text: "That's very common — many software companies use different billing names. Would you like me to add a note to this transaction so it's easier to identify?", sentiment: "positive" },
    { speaker: "customer", text: "Yes, that would be great. Thank you for looking into this so quickly!", sentiment: "positive" },
    { speaker: "agent", text: "You're welcome! I've added the note. Is there anything else I can help you with today?", sentiment: "positive" },
  ],
  [
    { speaker: "customer", text: "I need to dispute a transaction. Someone used my card at a gas station in Texas and I'm in New York.", sentiment: "negative" },
    { speaker: "agent", text: "I'm sorry to hear that. Let me immediately flag this as potential fraud and secure your account. When did you first notice this?", sentiment: "neutral" },
    { speaker: "customer", text: "Just now. I got a notification for $89.34 at a Shell station in Houston.", sentiment: "negative" },
    { speaker: "agent", text: "I can see the transaction. I'm going to block your current card right now and initiate a fraud investigation. You'll receive a provisional credit within 24 hours.", sentiment: "neutral" },
    { speaker: "customer", text: "Will I get a new card? I have automatic payments set up.", sentiment: "negative" },
    { speaker: "agent", text: "Absolutely. A new card with a different number will be expedited to you within 2 business days. Your recurring payments will transfer automatically through our card updater service.", sentiment: "positive" },
    { speaker: "customer", text: "Okay, that's a relief. How will I know about the investigation?", sentiment: "neutral" },
    { speaker: "agent", text: "You'll receive email updates at each stage. The investigation typically resolves within 10 business days. Your provisional credit will remain in place during this time.", sentiment: "positive" },
  ],
  [
    { speaker: "customer", text: "I'd like to know about your mortgage refinancing options. My current rate is 6.8%.", sentiment: "neutral" },
    { speaker: "agent", text: "Great timing — we have some competitive rates right now. Based on current market conditions, you could potentially qualify for rates between 5.9% and 6.2%. May I ask about your property details?", sentiment: "positive" },
    { speaker: "customer", text: "It's a single-family home in Colorado, appraised at about $450,000 with $280,000 remaining on the mortgage.", sentiment: "neutral" },
    { speaker: "agent", text: "With that loan-to-value ratio of about 62%, you'd qualify for our preferred tier. That could mean significant monthly savings. Would you like me to run a preliminary estimate?", sentiment: "positive" },
    { speaker: "customer", text: "Yes please. What about closing costs?", sentiment: "neutral" },
    { speaker: "agent", text: "For a refinance of this size, closing costs typically range from $4,000 to $6,000. However, we have a promotion that waives the application fee and reduces origination costs by 50%.", sentiment: "positive" },
    { speaker: "customer", text: "That sounds really good. Can I get a formal quote?", sentiment: "positive" },
    { speaker: "agent", text: "Absolutely. I'll transfer you to our mortgage specialist who can prepare a detailed Good Faith Estimate. They can also schedule a virtual consultation at your convenience.", sentiment: "positive" },
  ],
  [
    { speaker: "customer", text: "I'm calling because my wire transfer hasn't gone through and it's been three days. This is urgent — it's a real estate closing.", sentiment: "negative" },
    { speaker: "agent", text: "I understand the urgency. Let me look into this immediately. Can you provide the wire reference number?", sentiment: "neutral" },
    { speaker: "customer", text: "It's WR-7734-9201. I sent $45,000 on Monday.", sentiment: "negative" },
    { speaker: "agent", text: "I found it. The wire was held by our compliance review system because of the amount and the recipient being a new payee. I can see it's been cleared and is now processing.", sentiment: "neutral" },
    { speaker: "customer", text: "So when will it actually arrive?", sentiment: "negative" },
    { speaker: "agent", text: "Now that it's cleared compliance, it should arrive at the receiving bank by end of business today. I'm going to add a priority flag to expedite it. I'll also send you a confirmation email with the updated status.", sentiment: "positive" },
    { speaker: "customer", text: "Thank you. I was really worried about the closing deadline.", sentiment: "neutral" },
    { speaker: "agent", text: "I completely understand. For future large transfers, I'd recommend setting up the recipient 48 hours in advance — that bypasses the new payee review. Would you like me to save this recipient for future use?", sentiment: "positive" },
  ],
]

const knowledgeSuggestions: Array<Omit<AiSuggestion, "id" | "timestamp" | "isNew">> = [
  { type: "knowledge", title: "Card Updater Service", text: "Remind customer that recurring payments auto-transfer to the new card via Visa/MC card updater within 1-2 billing cycles.", confidence: 0.94 },
  { type: "compliance", title: "Fraud Disclosure Required", text: "Per Reg E, inform the customer of their right to dispute within 60 days and provisional credit timeline.", confidence: 0.97 },
  { type: "empathy", title: "Acknowledge Frustration", text: "Customer sentiment is declining. Consider acknowledging the inconvenience before proceeding with the solution.", confidence: 0.88 },
  { type: "upsell", title: "Premium Card Offer", text: "Customer qualifies for the Premium Rewards Card with enhanced fraud protection and zero liability. 78% conversion rate for this profile.", confidence: 0.72 },
  { type: "procedure", title: "Verification Required", text: "Multi-factor authentication required before processing wire transfers over $25,000. Verify identity with security questions.", confidence: 0.95 },
  { type: "knowledge", title: "Refi Rate Lock", text: "Current rate lock period is 45 days. Advise customer to lock today as rates are trending upward based on Fed signals.", confidence: 0.86 },
  { type: "compliance", title: "TILA Disclosure", text: "Truth in Lending Act requires providing APR, total interest cost, and all fees in writing before loan commitment.", confidence: 0.99 },
  { type: "empathy", title: "Active Listening Cue", text: "Customer has repeated their concern twice. Paraphrase their issue back to show understanding before offering solutions.", confidence: 0.91 },
  { type: "procedure", title: "Dispute Workflow", text: "Initiate dispute via case management > fraud > unauthorized transaction. Auto-generates provisional credit request.", confidence: 0.93 },
  { type: "upsell", title: "Identity Protection Suite", text: "After fraud incidents, 62% of customers purchase our Identity Protection Suite ($9.99/mo). Natural conversation point.", confidence: 0.68 },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function useCallTranscript(callId: string | null) {
  const [state, setState] = useState<CallTranscriptState>({
    transcript: [],
    suggestions: [],
    qmScore: { greeting: 0, empathy: 0, compliance: 0, resolution: 0, closing: 0, overall: 0 },
    sentimentTimeline: [],
    isListening: false,
    callDuration: 0,
  })

  const flowRef = useRef<typeof conversationFlows[0]>([])
  const lineIndexRef = useRef(0)
  const wordIndexRef = useRef(0)
  const suggestionCountRef = useRef(0)

  const startListening = useCallback(() => {
    flowRef.current = pickRandom(conversationFlows)
    lineIndexRef.current = 0
    wordIndexRef.current = 0
    suggestionCountRef.current = 0

    setState({
      transcript: [
        { id: "sys-0", speaker: "system", text: "Call monitoring started — Live transcription active", timestamp: "0:00" },
      ],
      suggestions: [],
      qmScore: { greeting: 85, empathy: 0, compliance: 0, resolution: 0, closing: 0, overall: 17 },
      sentimentTimeline: [{ time: "0:00", score: 50 }],
      isListening: true,
      callDuration: 0,
    })
  }, [])

  const stopListening = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isListening: false,
      transcript: [
        ...prev.transcript,
        { id: `sys-end`, speaker: "system", text: "Call monitoring ended", timestamp: formatTimestamp(prev.callDuration) },
      ],
    }))
  }, [])

  useEffect(() => {
    if (!state.isListening || !callId) return

    // Word-by-word streaming at 300ms
    const wordInterval = setInterval(() => {
      setState((prev) => {
        const flow = flowRef.current
        const li = lineIndexRef.current
        const wi = wordIndexRef.current

        if (li >= flow.length) {
          // Loop conversation
          lineIndexRef.current = 0
          wordIndexRef.current = 0
          return prev
        }

        const currentLine = flow[li]
        const words = currentLine.text.split(" ")
        const newDuration = prev.callDuration + 0.3

        if (wi === 0) {
          // Start a new line as partial
          const newLine: TranscriptLine = {
            id: `line-${li}-${Date.now()}`,
            speaker: currentLine.speaker,
            text: words[0],
            timestamp: formatTimestamp(Math.floor(newDuration)),
            sentiment: currentLine.sentiment,
            isPartial: true,
          }
          wordIndexRef.current = 1
          return {
            ...prev,
            callDuration: newDuration,
            transcript: [...prev.transcript, newLine],
          }
        }

        if (wi < words.length) {
          // Append next word to current partial line
          const updatedTranscript = [...prev.transcript]
          const lastLine = { ...updatedTranscript[updatedTranscript.length - 1] }
          lastLine.text = words.slice(0, wi + 1).join(" ")
          lastLine.isPartial = wi + 1 < words.length
          updatedTranscript[updatedTranscript.length - 1] = lastLine

          wordIndexRef.current = wi + 1
          return { ...prev, callDuration: newDuration, transcript: updatedTranscript }
        }

        // Line complete — move to next
        const updatedTranscript = [...prev.transcript]
        const lastLine = { ...updatedTranscript[updatedTranscript.length - 1] }
        lastLine.isPartial = false
        updatedTranscript[updatedTranscript.length - 1] = lastLine

        lineIndexRef.current = li + 1
        wordIndexRef.current = 0
        return { ...prev, callDuration: newDuration, transcript: updatedTranscript }
      })
    }, 300)

    // AI suggestions every 8-12s
    const suggestionInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.isListening) return prev
        const idx = suggestionCountRef.current % knowledgeSuggestions.length
        const base = knowledgeSuggestions[idx]
        suggestionCountRef.current += 1

        const newSuggestion: AiSuggestion = {
          ...base,
          id: `sug-${Date.now()}`,
          timestamp: formatTimestamp(Math.floor(prev.callDuration)),
          isNew: true,
        }

        // Mark old suggestions as not new
        const updatedSuggestions = prev.suggestions.map((s) => ({ ...s, isNew: false }))

        return {
          ...prev,
          suggestions: [...updatedSuggestions, newSuggestion].slice(-6),
        }
      })
    }, 8000 + Math.random() * 4000)

    // QM score + sentiment timeline updates every 5s
    const scoreInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.isListening) return prev
        const jitter = (base: number) => Math.min(100, Math.max(0, base + (Math.random() * 10 - 4)))

        const newScore: QmScore = {
          greeting: jitter(prev.qmScore.greeting || 85),
          empathy: jitter(prev.qmScore.empathy || 70 + prev.callDuration * 0.3),
          compliance: jitter(prev.qmScore.compliance || 60 + prev.callDuration * 0.4),
          resolution: jitter(prev.qmScore.resolution || 50 + prev.callDuration * 0.5),
          closing: prev.callDuration > 30 ? jitter(prev.qmScore.closing || 60) : 0,
          overall: 0,
        }
        newScore.overall = Math.round(
          (newScore.greeting + newScore.empathy + newScore.compliance + newScore.resolution + newScore.closing) / 5,
        )

        const sentimentScore = prev.transcript.length > 0
          ? (() => {
              const last3 = prev.transcript.filter((t) => t.speaker !== "system").slice(-3)
              const scores = last3.map((t) => t.sentiment === "positive" ? 75 : t.sentiment === "negative" ? 25 : 50)
              return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50
            })()
          : 50

        return {
          ...prev,
          qmScore: newScore,
          sentimentTimeline: [
            ...prev.sentimentTimeline,
            { time: formatTimestamp(Math.floor(prev.callDuration)), score: sentimentScore + (Math.random() * 10 - 5) },
          ].slice(-20),
        }
      })
    }, 5000)

    return () => {
      clearInterval(wordInterval)
      clearInterval(suggestionInterval)
      clearInterval(scoreInterval)
    }
  }, [state.isListening, callId])

  return {
    ...state,
    startListening,
    stopListening,
  }
}
