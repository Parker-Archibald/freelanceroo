"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Project {
  id: string
  name: string
  color: string
}

interface TimerProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onStart: (projectData: { id: string, name: string, color: string }) => void
}

export function TimerProjectDialog({ isOpen, onClose, onStart }: TimerProjectDialogProps) {
  const [selectedProject, setSelectedProject] = useState<string>("")

  // In a real app, this would come from your project data store
  const inProgressProjects: Project[] = [
    { id: "website", name: "Website Redesign", color: "hsl(var(--chart-1))" },
    { id: "mobile-app", name: "Mobile App", color: "hsl(var(--chart-2))" },
    { id: "marketing", name: "Marketing Campaign", color: "hsl(var(--chart-3))" },
    { id: "analytics", name: "Analytics Dashboard", color: "hsl(var(--chart-4))" },
    { id: "ecommerce", name: "E-commerce Integration", color: "hsl(var(--chart-5))" },
  ]

  const handleStart = () => {
    if (selectedProject) {
      const project = inProgressProjects.find(p => p.id === selectedProject)
      if (project) {
        onStart({
          id: project.id,
          name: project.name,
          color: project.color
        })
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <RadioGroup
            value={selectedProject}
            onValueChange={setSelectedProject}
            className="space-y-3"
          >
            {inProgressProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center space-x-3 rounded-lg border p-4"
              >
                <RadioGroupItem value={project.id} id={project.id} />
                <Label htmlFor={project.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={!selectedProject}
            className="w-full"
          >
            Start Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}