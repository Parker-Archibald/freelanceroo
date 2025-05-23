"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, Check } from "lucide-react"
import { motion } from "framer-motion"

interface TimerDialogProps {
  isOpen: boolean
  onClose: () => void
  duration: string
  projectId?: string
  projectName?: string
  projectColor?: string
}

export function TimerDialog({ 
  isOpen, 
  onClose, 
  duration, 
  projectId = "", 
  projectName = "No Project", 
  projectColor = "hsl(var(--muted-foreground))" 
}: TimerDialogProps) {
  const [note, setNote] = useState("")
  const [savedNotes, setSavedNotes] = useState<{content: string, timestamp: Date}[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleAddNote = () => {
    if (note.trim()) {
      setIsSaving(true)
      // Simulate saving to database
      setTimeout(() => {
        setSavedNotes([...savedNotes, { content: note, timestamp: new Date() }])
        setNote("")
        setIsSaving(false)
      }, 500)
    }
  }

  const handleFinish = () => {
    // In a real app, this would save the timer session with all notes
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Timer Completed</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: projectColor }}
              />
              <span className="font-medium">{projectName}</span>
            </div>
            <Badge variant="outline" className="font-mono text-lg">
              {duration}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a note about what you worked on:</label>
            <Textarea
              placeholder="What did you accomplish during this time?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!note.trim() || isSaving} 
              className="w-full"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Clock className="h-4 w-4" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </div>
          
          {savedNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notes:</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {savedNotes.map((savedNote, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{savedNote.content}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(savedNote.timestamp, "h:mm a")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleFinish} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Finish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}