"use client"

import { useState, useEffect } from "react"
import { Clock, MessageSquare, ChevronDown, ListFilter } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Projects } from "@/lib/types"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"

interface Project {
  name: string
  progress: number
  members: number
  messages: number
  timeAgo: string
  color: string
}

const projects: Project[] = [
  {
    name: "Website Redesign",
    progress: 75,
    members: 4,
    messages: 28,
    timeAgo: "2 days ago",
    color: "hsl(var(--chart-1))"
  },
  {
    name: "Mobile App Design",
    progress: 45,
    members: 3,
    messages: 15,
    timeAgo: "5 days ago",
    color: "hsl(var(--chart-2))"
  },
  {
    name: "Marketing Campaign",
    progress: 90,
    members: 2,
    messages: 42,
    timeAgo: "1 day ago",
    color: "hsl(var(--chart-3))"
  }
]

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const statusColors = {
  'applied': "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  'in_progress': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  'complete': "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

type projTasks = {
  project_id: string;
  total_tasks: number;
  completed_tasks: number;
}[]

export function ProjectsOverview({ p, t }) {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonth])
  const [progressValues, setProgressValues] = useState<number[]>(projects.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)
  const [proj, setProj] = useState<[] | Projects>([])
  const [tasks, setTasks] = useState<projTasks>([])
  const [canViewCompleted, setCanViewCompleted] = useState(false)
  const [viewPercent, setViewPercent] = useState(true)

  const router = useRouter();

  useEffect(() => {
    // Delay to ensure animation happens after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Animate progress bars to their actual values
      setProgressValues(projects.map(project => project.progress))
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (p) {
      setProj(p)
    }
  }, [p])

  useEffect(() => {
    if (t && p) {

      let projTaskdata: projTasks = [];

      p.forEach(proj => {
        projTaskdata.push({
          project_id: proj.id,
          completed_tasks: 0,
          total_tasks: 0
        })
      })

      t.forEach(task => {
        projTaskdata.forEach(project => {
          if (project.project_id === task.project_id) {
            project.total_tasks++;
            if (task.completed) {
              project.completed_tasks++;
            }
          }
        })
      })

      setTasks(projTaskdata)
    }
  }, [t])


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Projects Overview</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ListFilter className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="hover:cursor-pointer space-x-2 group hover:bg-zinc-900 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={() => setCanViewCompleted(!canViewCompleted)}>
              <Checkbox checked={canViewCompleted} />
              <span>Completed Projects</span>
            </div>
            <div className="hover:cursor-pointer space-x-2 group hover:bg-zinc-900 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={() => setViewPercent(!viewPercent)}>
              <Checkbox checked={viewPercent} />
              <span>View as Percent</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>
      <motion.div
        className={`flex space-x-8 overflow-x-scrol scrollbar-hide ${!canViewCompleted ? '-ml-8' : 'pl-0'}`}
        variants={container}
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
      >
        {proj?.map((project, index) => (
          <div key={project.id} className={`${project.status === 'complete' && !canViewCompleted ? 'hidden' : 'w-1/3'}`}>
            {project.status !== 'complete' && (
              <motion.div
                key={`${project.id}${index}`}
                className='rounded-lg border p-6 group hover:cursor-pointer'
                variants={item}
                whileHover={{ scale: 1.05, backgroundColor: '#18181b' }}
                onClick={() => router.push(`/projects/${project.project_name.toLowerCase().replace(/\s+/g, '-')}?id=${project.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <Badge
                      variant="secondary"
                      className={`${statusColors[project?.status]} border-none capitalize`}
                    >{project.status.replace('_', ' ')}</Badge>
                    <h3 className="text-xl font-semibold group-hover:underline">{project.project_name}</h3>
                  </div>
                </div>

                {tasks.map((task: any) => {
                  if (task.project_id === project.id) {
                    return (
                      <div key={task.id} className="space-y-2 mb-6">
                        <div className="flex justify-between items-center">

                          <Progress
                            value={(task.completed_tasks / task.total_tasks) * 100}
                            className="h-2"
                            style={{
                              "--progress-background": project.color,
                              transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            } as React.CSSProperties}
                          />
                          {task.completed_tasks === 0 ? (
                            <div>
                              {viewPercent ? (
                                <span className="text-sm font-medium ml-2">0%</span>
                              ) : (
                                <span className="text-sm font-medium ml-2">0/{task.total_tasks}</span>
                              )}
                            </div>
                          ) : (
                            <div>
                              {viewPercent ? (
                                <span className="text-sm font-medium ml-2">{((task.completed_tasks / task.total_tasks) * 100).toFixed(0)}%</span>
                              ) : (
                                <span className="text-sm font-medium ml-2">{task.completed_tasks}/{task.total_tasks}</span>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    )
                  }
                })}

                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex -space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    {/* {Array.from({ length: project.members }).map((_, i) => (
                  <Avatar key={i} className="border-2 border-background">
                    <AvatarFallback className="bg-secondary">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))} */}
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-4 text-muted-foreground"
                    initial={{ opacity: 0, x: 10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {/* <span className="text-sm">{project.messages}</span> */}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {/* <span className="text-sm">{project.timeAgo}</span> */}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {project.status === 'complete' && canViewCompleted ? (
              <motion.div
                key={project.id}
                className="rounded-lg border p-6 group hover:cursor-pointer "
                variants={item}
                whileHover={{ scale: 1.05, backgroundColor: '#18181b' }}
                onClick={() => router.push(`/projects/${project.project_name.toLowerCase().replace(/\s+/g, '-')}?id=${project.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <Badge
                      variant="secondary"
                      className={`${statusColors[project?.status]} border-none capitalize`}
                    >{project.status.replace('_', ' ')}</Badge>
                    <h3 className="text-xl font-semibold group-hover:underline">{project.project_name}</h3>
                  </div>
                </div>

                {tasks.map((task: any) => {
                  if (task.project_id === project.id) {
                    return (
                      <div key={task.id} className="space-y-2 mb-6">
                        <div className="flex justify-between items-center">

                          <Progress
                            value={(task.completed_tasks / task.total_tasks) * 100}
                            className="h-2"
                            style={{
                              "--progress-background": project.color,
                              transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                            } as React.CSSProperties}
                          />
                          {task.total_tasks === 0 ? (
                            <span className="text-sm font-medium ml-2">0%</span>
                          ) : (
                            <span className="text-sm font-medium ml-2">{((task.completed_tasks / task.total_tasks) * 100).toFixed(0)}%</span>
                          )}

                        </div>
                      </div>
                    )
                  }
                })}

                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex -space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    {/* {Array.from({ length: project.members }).map((_, i) => (
                    <Avatar key={i} className="border-2 border-background">
                      <AvatarFallback className="bg-secondary">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))} */}
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-4 text-muted-foreground"
                    initial={{ opacity: 0, x: 10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {/* <span className="text-sm">{project.messages}</span> */}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {/* <span className="text-sm">{project.timeAgo}</span> */}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <span></span>
            )}


          </div>
        ))}
      </motion.div>
    </div>
  )
}