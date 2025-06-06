"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  MessageSquare,
  Calendar
} from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { Projects } from '@/lib/types'
import { getProjectsSimple } from "@/app/api/getProjectById/[...id]/route"

interface NavItem {
  title: string
  href?: string
  icon?: React.ReactNode
  submenu?: { title: string; href: string; color?: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "All Tasks",
    href: "/tasks",
    icon: <ListTodo className="h-5 w-5" />,
  },
  {
    title: "My Schedule",
    href: "/schedule",
    icon: <Calendar className="h-5 w-5" />,
  }
]

const defaultSecondaryNavItems: NavItem[] = [
  {
    title: "Projects",
    icon: <FolderKanban className="h-5 w-5" />,
    submenu: [],
  },
  {
    title: "Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    submenu: [
      { title: "All Chats", href: "/messages", color: "" },
      { title: "John Doe", href: "/messages?id=john-doe", color: "" },
      { title: "Jane Smith", href: "/messages?id=jane-smith", color: "" },
      { title: "Mike Johnson", href: "/messages?id=mike-johnson", color: "" },
      { title: "Sarah Wilson", href: "/messages?id=sarah-wilson", color: "" },
      { title: "Alex Brown", href: "/messages?id=alex-brown", color: "" },
      { title: "Emily Davis", href: "/messages?id=emily-davis", color: "" },
      { title: "David Miller", href: "/messages?id=david-miller", color: "" },
      { title: "Lisa Taylor", href: "/messages?id=lisa-taylor", color: "" },
    ],
  },
  {
    title: "Members",
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { title: "Active Members", href: "/members/active" },
      { title: "Pending", href: "/members/pending" },
      { title: "Archived", href: "/members/archived" },
    ],
  },
]

interface SideNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SideNav({ isOpen, onOpenChange }: SideNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [secondaryNavItems, setSecondaryNavItems] = useState(defaultSecondaryNavItems)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const [allProjects, setAllProjects] = useState<Projects | []>([])

  useEffect(() => {
    // getProjects()

    const testGetProj = async () => {
      const results = await fetch(`/api/getProjectsSimple/${'123'}`)
      const data = await results.json()

      setAllProjects(data.data.results)

      defaultSecondaryNavItems[0].submenu = data.data.displayItems;
      setSecondaryNavItems(defaultSecondaryNavItems)
    }

    testGetProj()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '5rem' : '16rem'
    )
    return () => {
      document.documentElement.style.setProperty('--sidebar-width', '16rem')
    }
  }, [isCollapsed])

  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const handleAddProject = (data: { name: string; color: string }) => {
    const newProject = {
      title: data.name,
      href: `/projects/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
      color: data.color,
    }

    setSecondaryNavItems(items =>
      items.map(item =>
        item.title === "Projects"
          ? {
            ...item,
            submenu: [...(item.submenu || []), newProject],
          }
          : item
      )
    )
  }

  const isActive = (href: string) => {
    if (href === pathname) return true

    // Special case for messages with query params
    if (href.startsWith('/messages?id=') && pathname === '/messages') {
      const urlParams = new URLSearchParams(href.split('?')[1])
      const id = urlParams.get('id')

      // Check if the current URL has the same id parameter
      const currentUrl = new URL(window.location.href)
      return currentUrl.searchParams.get('id') === id
    }

    return false
  }

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // For messages links with query params, prevent default navigation
    if (href.startsWith('/messages?id=') && pathname === '/messages') {
      e.preventDefault()
      router.push(href, { scroll: false })
      onOpenChange(false) // Close mobile sidebar if open
    }
  }

  if (!session) {
    return null
  }

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-background border-r transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{
          width: isCollapsed ? 'var(--sidebar-width)' : 'var(--sidebar-width)'
        }}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          {!isCollapsed && <span className="text-xl font-bold">Your Logo</span>}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2 p-4">
          {/* Primary Navigation */}
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link key={item.title} href={item.href || "#"}>
                <Button
                  variant={isActive(item.href || "") ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Button>
              </Link>
            ))}
          </div>

          {/* Separator */}
          {!isCollapsed && <Separator className="my-4" />}

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <div key={item.title} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full",
                    isCollapsed ? "justify-center px-2" : "justify-between"
                  )}
                  onClick={() => !isCollapsed && toggleSubmenu(item.title)}
                >
                  <span className="flex items-center">
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.title}</span>}
                  </span>
                  {!isCollapsed && item.submenu && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedItems.includes(item.title) && "rotate-180"
                      )}
                    />
                  )}
                </Button>
                {!isCollapsed && expandedItems.includes(item.title) && item.submenu && (
                  <div className="ml-6 space-y-1">
                    {/* {item.title === "Messages" && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground mb-2"
                        onClick={() => {}}
                        asChild
                      >
                        <Link href="/messages/new">
                          <Plus className="h-4 w-4 mr-2" />
                          New Conversation
                        </Link>
                      </Button>
                    )} */}
                    <ScrollArea className={item.title === "Messages" ? "h-[300px]" : ""}>
                      <div className="space-y-1 pr-2">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className='space-y-2 flex flex-col'
                            onClick={(e) => handleNavigation(e, subitem.href)}
                          >
                            <Button
                              variant={
                                isActive(subitem.href) ? "secondary" : "ghost"
                              }
                              className="w-full justify-start group"
                            >
                              <span className="flex-1 text-start">{subitem.title}</span>
                              {subitem.color && (
                                <div
                                  className="h-3 w-3 rounded-full ml-2 transition-transform group-hover:scale-110"
                                  style={{ backgroundColor: subitem.color }}
                                />
                              )}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                    {item.title === "Projects" && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground border-t border-border/50 mt-2 pt-2"
                        onClick={() => setIsAddProjectOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <AddProjectDialog
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        onSubmit={handleAddProject}
      />
    </>
  )
}