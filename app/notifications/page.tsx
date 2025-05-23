"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Bell, Check, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"

interface Notification {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "info" | "success" | "warning" | "error"
  read: boolean
  category: "project" | "task" | "team" | "system"
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Project Created",
    description: "Website Redesign project has been created and assigned to your team.",
    timestamp: new Date(2024, 3, 15, 14, 30),
    type: "success",
    read: false,
    category: "project"
  },
  {
    id: "2",
    title: "Task Completed",
    description: "All tasks in the Marketing Campaign project have been completed ahead of schedule.",
    timestamp: new Date(2024, 3, 15, 13, 45),
    type: "success",
    read: false,
    category: "task"
  },
  {
    id: "3",
    title: "Team Meeting Reminder",
    description: "Weekly team sync meeting starts in 30 minutes. Don't forget to prepare your updates.",
    timestamp: new Date(2024, 3, 15, 12, 0),
    type: "info",
    read: true,
    category: "team"
  },
  {
    id: "4",
    title: "Project Update Required",
    description: "The Mobile App project needs status update. Please review and update the progress.",
    timestamp: new Date(2024, 3, 15, 10, 15),
    type: "warning",
    read: true,
    category: "project"
  },
  {
    id: "5",
    title: "System Maintenance",
    description: "Scheduled system maintenance will occur tonight at 2 AM EST. Please save your work.",
    timestamp: new Date(2024, 3, 15, 9, 0),
    type: "error",
    read: true,
    category: "system"
  }
]

const typeColors = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesCategory = categoryFilter === "all" || notification.category === categoryFilter
    const matchesRead = readFilter === "all" || 
                       (readFilter === "read" && notification.read) ||
                       (readFilter === "unread" && !notification.read)
    
    return matchesSearch && matchesType && matchesCategory && matchesRead
  })

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <PageTransition>
      <div className="container py-6 space-y-6 px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button onClick={markAllAsRead} variant="outline" className="space-x-2">
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="flex flex-col md:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <motion.div 
            className="space-y-1"
            variants={container}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={item}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.03)" }}
                className={cn(
                  "flex items-start space-x-4 p-4 hover:bg-muted/50 transition-colors rounded-lg cursor-pointer",
                  !notification.read && "bg-muted/30"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{notification.title}</p>
                      <Badge 
                        variant="secondary"
                        className={cn("capitalize", typeColors[notification.type])}
                      >
                        {notification.type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {notification.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(notification.timestamp, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </div>
    </PageTransition>
  )
}