"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TimerDialog } from "@/components/timer-dialog"
import { TimerProjectDialog } from "@/components/timer-project-dialog"

interface TimerState {
  isRunning: boolean
  startTime: string | null
  projectId: string | null
  projectName: string | null
  projectColor: string | null
}

export function Timer() {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("00:00:00")
  const [showStopButton, setShowStopButton] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [finalDuration, setFinalDuration] = useState("")
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null)
  const [currentProjectColor, setCurrentProjectColor] = useState<string | null>(null)

  // Load timer state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('timerState')
    if (savedState) {
      const state: TimerState = JSON.parse(savedState)
      if (state.isRunning && state.startTime) {
        setStartTime(new Date(state.startTime))
        setIsRunning(true)
        setCurrentProjectId(state.projectId)
        setCurrentProjectName(state.projectName)
        setCurrentProjectColor(state.projectColor)
      }
    }
  }, [])

  // Save timer state when it changes
  useEffect(() => {
    if (isRunning && startTime) {
      const state: TimerState = {
        isRunning: true,
        startTime: startTime.toISOString(),
        projectId: currentProjectId,
        projectName: currentProjectName,
        projectColor: currentProjectColor
      }
      localStorage.setItem('timerState', JSON.stringify(state))
    } else {
      localStorage.removeItem('timerState')
    }
  }, [isRunning, startTime, currentProjectId, currentProjectName, currentProjectColor])

  // Update timer display
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRunning && startTime) {
      const updateDisplay = () => {
        const now = new Date()
        const diff = now.getTime() - startTime.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCurrentTime(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        )
      }

      // Update immediately and then every second
      updateDisplay()
      intervalId = setInterval(updateDisplay, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning, startTime])

  // Handle beforeunload event to ensure timer state is saved
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRunning && startTime) {
        const state: TimerState = {
          isRunning: true,
          startTime: startTime.toISOString(),
          projectId: currentProjectId,
          projectName: currentProjectName,
          projectColor: currentProjectColor
        }
        localStorage.setItem('timerState', JSON.stringify(state))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isRunning, startTime, currentProjectId, currentProjectName, currentProjectColor])

  const startTimer = (projectData: { id: string, name: string, color: string }) => {
    const newStartTime = new Date()
    setIsRunning(true)
    setStartTime(newStartTime)
    setCurrentProjectId(projectData.id)
    setCurrentProjectName(projectData.name)
    setCurrentProjectColor(projectData.color)
  }

  const stopTimer = () => {
    if (startTime) {
      const endTime = new Date()
      const diff = endTime.getTime() - startTime.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setFinalDuration(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }
    setIsRunning(false)
    setStartTime(null)
    setCurrentTime("00:00:00")
    setIsDialogOpen(true)
    localStorage.removeItem('timerState')
  }

  if (!isRunning) {
    return (
      <>
        <Button onClick={() => setIsProjectDialogOpen(true)}>Start Timer</Button>
        <TimerDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          duration={finalDuration}
          projectId={currentProjectId || ""}
          projectName={currentProjectName || "No Project"}
          projectColor={currentProjectColor || "hsl(var(--muted-foreground))"}
        />
        <TimerProjectDialog
          isOpen={isProjectDialogOpen}
          onClose={() => setIsProjectDialogOpen(false)}
          onStart={startTimer}
        />
      </>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowStopButton(true)}
      onMouseLeave={() => setShowStopButton(false)}
    >
      {showStopButton ? (
        <Button
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive/10"
          onClick={stopTimer}
        >
          Stop Timer
        </Button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2">
          {currentProjectName && (
            <div 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: currentProjectColor || "hsl(var(--muted-foreground))" }}
            />
          )}
          <div className="text-base font-mono">{currentTime}</div>
        </div>
      )}
      <TimerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        duration={finalDuration}
        projectId={currentProjectId || ""}
        projectName={currentProjectName || "No Project"}
        projectColor={currentProjectColor || "hsl(var(--muted-foreground))"}
      />
    </div>
  )
}