"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Calendar, 
  Briefcase, 
  FileText, 
  MessageSquare,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageTransition } from "@/components/page-transition"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimerSession {
  id: string
  projectId: string
  projectName: string
  projectColor: string
  startTime: Date
  endTime: Date
  duration: string
  tasks: TimerTask[]
}

interface TimerTask {
  id: string
  title: string
  description: string
  status: string
  priority: 'low' | 'medium' | 'high'
  notes: TimerNote[]
}

interface TimerNote {
  id: string
  content: string
  timestamp: Date
  timerElapsed: string
}

// Mock data for timer sessions
const mockTimerSessions: TimerSession[] = [
  {
    id: "timer-1",
    projectId: "website",
    projectName: "Website Redesign",
    projectColor: "hsl(var(--chart-1))",
    startTime: new Date(2024, 3, 15, 9, 0),
    endTime: new Date(2024, 3, 15, 11, 30),
    duration: "02:30:00",
    tasks: [
      {
        id: "task-1",
        title: "Update landing page design",
        description: "Implement new hero section and call-to-action buttons",
        status: "In Progress",
        priority: "high",
        notes: [
          {
            id: "note-1",
            content: "Started working on the hero section layout",
            timestamp: new Date(2024, 3, 15, 9, 15),
            timerElapsed: "00:15:00"
          },
          {
            id: "note-2",
            content: "Completed hero section, moving to CTA buttons",
            timestamp: new Date(2024, 3, 15, 10, 45),
            timerElapsed: "01:45:00"
          }
        ]
      },
      {
        id: "task-2",
        title: "Optimize images for mobile",
        description: "Resize and compress images for better mobile performance",
        status: "Completed",
        priority: "medium",
        notes: [
          {
            id: "note-3",
            content: "Started image optimization process",
            timestamp: new Date(2024, 3, 15, 11, 0),
            timerElapsed: "02:00:00"
          }
        ]
      }
    ]
  },
  {
    id: "timer-2",
    projectId: "mobile-app",
    projectName: "Mobile App",
    projectColor: "hsl(var(--chart-2))",
    startTime: new Date(2024, 3, 14, 13, 0),
    endTime: new Date(2024, 3, 14, 16, 45),
    duration: "03:45:00",
    tasks: [
      {
        id: "task-3",
        title: "Implement user authentication",
        description: "Add login and registration functionality",
        status: "In Progress",
        priority: "high",
        notes: [
          {
            id: "note-4",
            content: "Setting up authentication service",
            timestamp: new Date(2024, 3, 14, 13, 30),
            timerElapsed: "00:30:00"
          },
          {
            id: "note-5",
            content: "Login form validation complete",
            timestamp: new Date(2024, 3, 14, 15, 0),
            timerElapsed: "02:00:00"
          }
        ]
      }
    ]
  },
  {
    id: "timer-3",
    projectId: "marketing",
    projectName: "Marketing Campaign",
    projectColor: "hsl(var(--chart-3))",
    startTime: new Date(2024, 3, 13, 10, 0),
    endTime: new Date(2024, 3, 13, 12, 30),
    duration: "02:30:00",
    tasks: [
      {
        id: "task-4",
        title: "Create social media graphics",
        description: "Design promotional graphics for social media platforms",
        status: "Completed",
        priority: "medium",
        notes: [
          {
            id: "note-6",
            content: "Started sketching concepts",
            timestamp: new Date(2024, 3, 13, 10, 15),
            timerElapsed: "00:15:00"
          },
          {
            id: "note-7",
            content: "Finalized Instagram post designs",
            timestamp: new Date(2024, 3, 13, 11, 45),
            timerElapsed: "01:45:00"
          }
        ]
      },
      {
        id: "task-5",
        title: "Draft email newsletter",
        description: "Write content for monthly newsletter",
        status: "In Progress",
        priority: "low",
        notes: [
          {
            id: "note-8",
            content: "Outlined main topics for newsletter",
            timestamp: new Date(2024, 3, 13, 12, 0),
            timerElapsed: "02:00:00"
          }
        ]
      }
    ]
  },
  {
    id: "timer-4",
    projectId: "website",
    projectName: "Website Redesign",
    projectColor: "hsl(var(--chart-1))",
    startTime: new Date(2024, 3, 12, 14, 0),
    endTime: new Date(2024, 3, 12, 17, 30),
    duration: "03:30:00",
    tasks: [
      {
        id: "task-6",
        title: "Implement responsive navigation",
        description: "Create mobile-friendly navigation menu",
        status: "Completed",
        priority: "high",
        notes: [
          {
            id: "note-9",
            content: "Started mobile menu implementation",
            timestamp: new Date(2024, 3, 12, 14, 30),
            timerElapsed: "00:30:00"
          },
          {
            id: "note-10",
            content: "Added hamburger menu animation",
            timestamp: new Date(2024, 3, 12, 16, 0),
            timerElapsed: "02:00:00"
          },
          {
            id: "note-11",
            content: "Completed responsive testing",
            timestamp: new Date(2024, 3, 12, 17, 15),
            timerElapsed: "03:15:00"
          }
        ]
      }
    ]
  },
  {
    id: "timer-5",
    projectId: "mobile-app",
    projectName: "Mobile App",
    projectColor: "hsl(var(--chart-2))",
    startTime: new Date(2024, 3, 11, 9, 0),
    endTime: new Date(2024, 3, 11, 13, 15),
    duration: "04:15:00",
    tasks: [
      {
        id: "task-7",
        title: "Design user profile screen",
        description: "Create UI for user profile and settings",
        status: "In Progress",
        priority: "medium",
        notes: [
          {
            id: "note-12",
            content: "Started wireframing profile screen",
            timestamp: new Date(2024, 3, 11, 9, 45),
            timerElapsed: "00:45:00"
          },
          {
            id: "note-13",
            content: "Completed initial design mockup",
            timestamp: new Date(2024, 3, 11, 12, 0),
            timerElapsed: "03:00:00"
          }
        ]
      },
      {
        id: "task-8",
        title: "Implement settings functionality",
        description: "Add user preference settings",
        status: "To Do",
        priority: "low",
        notes: [
          {
            id: "note-14",
            content: "Created task list for settings implementation",
            timestamp: new Date(2024, 3, 11, 13, 0),
            timerElapsed: "04:00:00"
          }
        ]
      }
    ]
  }
];

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export default function TimersPage() {
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>(mockTimerSessions);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  // Get unique projects for filter
  const projects = Array.from(new Set(timerSessions.map(session => session.projectName)))
    .map(name => {
      const session = timerSessions.find(s => s.projectName === name);
      return {
        id: session?.projectId || "",
        name,
        color: session?.projectColor || ""
      };
    });

  // Filter timer sessions
  const filteredSessions = timerSessions.filter(session => {
    const matchesSearch = 
      session.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tasks.some(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.notes.some(note => note.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    
    const matchesProject = projectFilter === "all" || session.projectId === projectFilter;
    
    const matchesDate = dateFilter === "all" || (() => {
      const sessionDate = new Date(session.startTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (dateFilter === "today") {
        return sessionDate.toDateString() === today.toDateString();
      } else if (dateFilter === "yesterday") {
        return sessionDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === "thisWeek") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return sessionDate >= weekStart;
      } else if (dateFilter === "thisMonth") {
        return sessionDate.getMonth() === today.getMonth() && 
               sessionDate.getFullYear() === today.getFullYear();
      }
      return true;
    })();
    
    return matchesSearch && matchesProject && matchesDate;
  });

  // Sort sessions by start time (newest first)
  const sortedSessions = [...filteredSessions].sort((a, b) => 
    b.startTime.getTime() - a.startTime.getTime()
  );

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <PageTransition>
      <div className="container py-6 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Time
        </motion.h1>

        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search timers, tasks, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <motion.div 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {sortedSessions.length > 0 ? (
              sortedSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  variants={item}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors`}
                    onClick={() => toggleSessionExpand(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: session.projectColor }}
                      />
                      <div>
                        <h3 className="font-medium">{session.projectName}</h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{format(session.startTime, "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{format(session.startTime, "h:mm a")} - {format(session.endTime, "h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        {session.duration}
                      </Badge>
                      {expandedSessions.includes(session.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSessions.includes(session.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Separator />
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">Tasks ({session.tasks.length})</h4>
                          </div>
                          <div className="space-y-3 pl-6">
                            {session.tasks.map(task => (
                              <div key={task.id} className="rounded-md border">
                                <div 
                                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                  onClick={() => toggleTaskExpand(task.id)}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium">{task.title}</h5>
                                      <Badge 
                                        variant="secondary" 
                                        className={`${priorityColors[task.priority]} border-none`}
                                      >
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{task.status}</Badge>
                                    {expandedTasks.includes(task.id) ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {expandedTasks.includes(task.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <Separator />
                                      <div className="p-3 bg-muted/20">
                                        <div className="flex items-center gap-2 mb-2">
                                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                          <h6 className="font-medium text-sm">Notes ({task.notes.length})</h6>
                                        </div>
                                        <div className="space-y-2 pl-6">
                                          {task.notes.map(note => (
                                            <div key={note.id} className="rounded border p-2 bg-background">
                                              <div className="flex justify-between items-start">
                                                <p className="text-sm">{note.content}</p>
                                                <div className="flex flex-col items-end">
                                                  <span className="text-xs text-muted-foreground">
                                                    {format(note.timestamp, "h:mm a")}
                                                  </span>
                                                  <Badge variant="outline" className="text-xs font-mono mt-1">
                                                    {note.timerElapsed}
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                variants={item}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No timer sessions found</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery || projectFilter !== "all" || dateFilter !== "all" 
                    ? "Try adjusting your filters to see more results." 
                    : "Start tracking your time by using the timer in the navigation bar."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </div>
    </PageTransition>
  );
}