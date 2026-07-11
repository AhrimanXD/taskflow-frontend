"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type Status = "pending" | "ongoing" | "completed"

const COLUMNS: { id: Status; label: string; dotClassName: string }[] = [
  { id: "pending", label: "Pending", dotClassName: "bg-muted-foreground/40" },
  { id: "ongoing", label: "Ongoing", dotClassName: "bg-signal" },
  { id: "completed", label: "Completed", dotClassName: "bg-emerald-500" },
]

const CYCLE: Status[] = ["pending", "ongoing", "completed"]

interface MockCard {
  id: number
  title: string
  status: Status
  assignee: string
}

const STATIC_CARDS: MockCard[] = [
  { id: 1, title: "Write launch copy", status: "pending", assignee: "AM" },
  { id: 3, title: "QA the invite flow", status: "ongoing", assignee: "JS" },
  { id: 4, title: "Ship v1.2", status: "completed", assignee: "KP" },
]

function PresencePill({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 py-1 pr-2.5 pl-1 text-[10px] text-muted-foreground">
      <span className="relative flex size-4 items-center justify-center rounded-full bg-muted text-[8px] font-medium text-foreground">
        {name[0]}
        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-signal ring-2 ring-background" />
      </span>
      {name}
    </span>
  )
}

export function LiveBoardMock() {
  const reduceMotion = useReducedMotion()
  const [movingStatus, setMovingStatus] = useState<Status>("pending")
  const [showMovedLabel, setShowMovedLabel] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    const interval = setInterval(() => {
      setShowMovedLabel(true)
      const timeout = setTimeout(() => {
        setMovingStatus((prev) => CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length])
        setShowMovedLabel(false)
      }, 900)
      return () => clearTimeout(timeout)
    }, 3400)
    return () => clearInterval(interval)
  }, [reduceMotion])

  const cards: MockCard[] = [
    ...STATIC_CARDS,
    { id: 2, title: "Design empty states", status: movingStatus, assignee: "KP" },
  ]

  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          acme-corp / sprint-12
        </span>
        <div className="flex items-center gap-2">
          <PresencePill name="Ava" />
          <PresencePill name="Kim" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
        {COLUMNS.map((col) => (
          <div key={col.id}>
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <span className={cn("size-1.5 rounded-full", col.dotClassName)} />
              <span className="text-[11px] font-medium text-muted-foreground">
                {col.label}
              </span>
            </div>
            <div className="min-h-[92px] space-y-2">
              <AnimatePresence mode="popLayout">
                {cards
                  .filter((card) => card.status === col.id)
                  .map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      className="rounded-lg border border-border bg-background p-2.5 shadow-sm"
                    >
                      <p className="line-clamp-2 text-xs font-medium text-foreground">
                        {card.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] text-muted-foreground">
                          {card.assignee}
                        </span>
                        {card.id === 2 && showMovedLabel ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] font-medium text-signal"
                          >
                            Kim moved this
                          </motion.span>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
