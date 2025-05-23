"use client"

import { Progress } from "@/components/ui/progress"

interface Project {
  name: string
  progress: number
  color: string
}

const projects: Project[] = [
  { name: "Website", progress: 75, color: "hsl(var(--chart-1))" },
  { name: "Design", progress: 45, color: "hsl(var(--chart-2))" },
  { name: "Marketing", progress: 90, color: "hsl(var(--chart-3))" },
]

export function ProjectList() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.name}
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{project.name}</h3>
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Progress 
                  value={project.progress} 
                  className="h-2 flex-1 mr-4"
                  style={{ 
                    "--progress-background": project.color
                  } as React.CSSProperties}
                />
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}