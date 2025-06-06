"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Clock, Users, Plus, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { getAllProjects } from "../api/getProjects/route"
import { Timestamp } from "firebase/firestore"
import Loader from "@/components/Loader"
import { useRouter } from "next/navigation"

interface Project {
  id: string;
  title: string;
  description: string;
  user_ids: number[];
  timeline_end: string;
  status: string;
  color: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete overhaul of the company website with modern design principles",
    status: "in-progress",
    color: "hsl(var(--chart-1))",
    timeline_end: new Date(2024, 3, 15).toString(),
    user_ids: [123]
  },
  // {
  //   id: "2",
  //   name: "Mobile App",
  //   description: "Development of a new mobile application for iOS and Android",
  //   status: "applied",
  //   progress: 0,
  //   color: "hsl(var(--chart-2))",
  //   teamSize: 6,
  //   lastUpdated: new Date(2024, 3, 10),
  //   dueDate: new Date(2024, 6, 15),
  // },
  // {
  //   id: "3",
  //   name: "Marketing Campaign",
  //   description: "Q2 marketing campaign for product launch",
  //   status: "completed",
  //   progress: 100,
  //   color: "hsl(var(--chart-3))",
  //   teamSize: 3,
  //   lastUpdated: new Date(2024, 3, 1),
  //   dueDate: new Date(2024, 3, 30),
  // },
  // {
  //   id: "4",
  //   name: "E-commerce Integration",
  //   description: "Integration of new payment gateway and shopping cart features",
  //   status: "in-progress",
  //   progress: 35,
  //   color: "hsl(var(--chart-4))",
  //   teamSize: 5,
  //   lastUpdated: new Date(2024, 3, 12),
  //   dueDate: new Date(2024, 5, 15),
  // },
  // {
  //   id: "5",
  //   name: "Analytics Dashboard",
  //   description: "Real-time analytics dashboard for business metrics",
  //   status: "applied",
  //   progress: 0,
  //   color: "hsl(var(--chart-5))",
  //   teamSize: 4,
  //   lastUpdated: new Date(2024, 3, 8),
  //   dueDate: new Date(2024, 6, 1),
  // },
  // {
  //   id: "6",
  //   name: "Test",
  //   description: "Real-time analytics dashboard for business metrics",
  //   status: "in-progress",
  //   progress: 0,
  //   color: "hsl(var(--chart-5))",
  //   teamSize: 4,
  //   lastUpdated: new Date(2024, 3, 8),
  //   dueDate: new Date(2024, 6, 1),
  // },
  // {
  //   id: "7",
  //   name: "Test2",
  //   description: "Real-time analytics dashboard for business metrics",
  //   status: "in-progress",
  //   progress: 0,
  //   color: "hsl(var(--chart-5))",
  //   teamSize: 4,
  //   lastUpdated: new Date(2024, 3, 8),
  //   dueDate: new Date(2024, 6, 1),
  // },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [allProjects, setAllProjects] = useState<Project[]>()
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const getData = async () => {
      const results = await fetch(`http://localhost:3000/api/getAllProjects/${'123'}`)
      const data = await results.json();
      setAllProjects(data.data)
      setIsLoading(false)
    }

    getData()

  }, [])

  const projectsByStatus = {
    applied: allProjects?.filter(p => p.status === "applied"),
    "in-progress": allProjects?.filter(p => p.status === "in_progress"),
    completed: allProjects?.filter(p => p.status === "complete"),
  }

  const statusTitles = {
    applied: "Applied To",
    "in_progress": "In Progress",
    completed: "Complete",
  }

  const handleAddProject = (data: { title: string; color: string; status: "applied" | "in-progress" | "completed" }) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: "New project description",
      status: data.status,
      color: data.color,
      timeline_end: new Date().toString(),
      user_ids: [123]
    }
    setProjects([...projects, newProject])
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <Card className="group min-w-[300px] lg:min-w-[350px] my-2 hover:cursor-pointer" onClick={() => router.push(`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}?id=${project.id}`)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <Link
                  href={`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}?id=${project.id}`}
                  className="text-lg font-semibold group-hover:underline"
                >
                  {project.title}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {project.status !== "applied" && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <Progress
                  value={2}
                  className="h-2"
                  style={{
                    "--progress-background": project.color
                  } as React.CSSProperties}
                />
                <span className="text-sm font-medium ml-2">{2}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{project?.user_ids?.length}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Due {project.timeline_end}</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`border-none`}
              style={{ backgroundColor: project.color }}
            >
              {project.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

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

  return (
    <PageTransition>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="container px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Projects
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button onClick={() => setIsAddProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </motion.div>
          </div>

          <div className="space-y-8">
            {(Object.keys(projectsByStatus) as Array<keyof typeof projectsByStatus>).map((status, index) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{statusTitles[status]}</h2>
                  <Badge variant="outline" className="font-normal">
                    {projectsByStatus[status]?.length}
                  </Badge>
                </div>
                <ScrollArea className="w-full">
                  <motion.div
                    className="flex space-x-4 pb-4 overflow-x-scroll scrollbar-hide"
                    variants={container}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                  >
                    {projectsByStatus[status]?.map((project, idx) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                      >
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </motion.div>
                </ScrollArea>
              </motion.div>
            ))}
          </div>

          <AddProjectDialog
            open={isAddProjectOpen}
            onOpenChange={setIsAddProjectOpen}
            onSubmit={handleAddProject}
          />
        </div>
      )}

    </PageTransition>
  )
}