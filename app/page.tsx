"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/stats-card"
import { QuickTasks } from "@/components/widgets/quick-tasks"
import { ProjectsOverview } from "@/components/widgets/projects-overview"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Info, Router } from "lucide-react"
import { useEffect, useState } from "react"
import { Projects, Task } from "@/lib/types"
import { redirect } from "next/navigation"
import Loader from "@/components/Loader"
import TotalProjectsBanner from "@/components/widgets/TotalProjectsBanner"
import Today from '../components/widgets/Today'
import UrgentTasks from "@/components/widgets/urgent-tasks"

export default function Home() {
  const { data: session, status } = useSession()

  const { toast } = useToast()
  const [projects, setProjects] = useState<Projects | []>([])
  const [inProgressProjects, setInProgressProjects] = useState<number>(0)
  const [completedCounter, setCompletedCounter] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [taskPerUser, setTaskPerUser] = useState<Task[] | []>([])

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const results = await fetch(`/api/getProjectsSimple/${'123'}`)
      const data = await results.json();

      const finData = data.data

      setProjects(data.data.results)

      let inProgressCounter = 0
      let completedCounter = 0

      finData.results.forEach((proj: { status: string, id: string }) => {
        if (proj.status === 'in_progress') {
          inProgressCounter++
        }
        else if (proj.status === 'complete') {
          completedCounter++
        }
      })

      setInProgressProjects(inProgressCounter)
      setCompletedCounter(completedCounter)

      getTasks('123')

    }

    const getTasks = async (id: string) => {
      const results = await fetch(`/api/getTasks/getTasksByUser/${id}`)
      const data = await results.json();
      setTaskPerUser(data.data)
      setTimeout(() => {
        setIsLoading(false)
      }, 2500)
    }

    getData()


  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const showSuccessToast = () => {
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Success!</span>
        </div>
      ),
      description: "Your action was completed successfully.",
    })
  }

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Error!</span>
        </div>
      ),
      description: "There was a problem with your request.",
    })
  }

  const showWarningToast = () => {
    toast({
      variant: "warning",
      title: (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Warning!</span>
        </div>
      ),
      description: "This action might have unexpected consequences.",
    })
  }

  const repullTasks = async (id: string) => {
    const results = await fetch(`http://localhost:3000/api/getTasks/getTasksByUser/${id}`)
    const data = await results.json();
    setTaskPerUser(data.data)
    setTimeout(() => {
      setIsLoading(false)
    }, 2500)
  }

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin')
  }

  return (
    <div className="container px-4 py-4 -mt-16 max-w-7xl mx-auto">

      {/* Loading */}

      {isLoading ? (
        <div className="relative">
          <Loader />
        </div>
      ) : (
        <div>
          <motion.h1
            className="text-2xl font-bold mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <div className="space-y-6">

            {/* Total Projects Banner */}
            <TotalProjectsBanner projects={projects} inProgressProjects={inProgressProjects} completedCounter={completedCounter} />

            <motion.div
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col gap-6">
                {/* Today Widget */}

                <Today p={projects} t={taskPerUser} />

                <UrgentTasks />

              </div>
              <QuickTasks t={taskPerUser} repullTasks={(user_id: string) => repullTasks(user_id)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ProjectsOverview p={projects} t={taskPerUser} />
            </motion.div>
          </div>
        </div>
      )}



    </div>
  )
}