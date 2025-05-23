"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Project Created",
    description: "Website Redesign project has been created",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    title: "Task Completed",
    description: "Marketing Campaign tasks have been completed",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Team Meeting",
    description: "Reminder: Team meeting starts in 30 minutes",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "4",
    title: "Project Update",
    description: "Mobile App project status has been updated",
    time: "5 hours ago",
    read: true,
  },
]

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isHovered, setIsHovered] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && unreadCount > 0 ? (
            <div className="h-6 w-6 flex items-center justify-center rounded-full border-2 border-destructive text-destructive text-xs font-bold">
              {unreadCount}
            </div>
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                  !notification.read && "bg-muted/30"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-center"
            asChild
          >
            <Link href="/notifications">View All Notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}