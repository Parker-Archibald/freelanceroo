"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { ProjectList } from "@/components/project-list"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskListView } from "@/components/task-list-view"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { getTasksByUser } from "../api/getTasks/route"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { toggleTaskStatus } from "../api/updateTasks/route"
import DeleteTaskDialog from "@/components/delete-task-dialog"
import Loader from "@/components/Loader"

interface Task {
  id: string
  title: string
  completed: boolean
  due_date: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  project_id: string
  project_color: string
  section_id: string
  date: string;
  user_id: number;
  list_order: number;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

export default function AllTaskPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [activeTab, setActiveTab] = useState("allTasks")
  const [isLoading, setIsLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState<boolean>(false)
  const [taskId, setTaskId] = useState<string>('')

  const [allTasks, setAllTasks] = useState<any>()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  let loadedTimer: ReturnType<typeof setTimeout>;

  useEffect(() => {
    getData()
    handleLoaded()
  }, [])

  const getData = async () => {
    const tasks = await getTasksByUser('123')

    setAllTasks(tasks)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleLoaded = () => {
    setLoaded(false)
    clearTimeout(loadedTimer)

    loadedTimer = setTimeout(() => {
      setLoaded(true)
    }, 2000)

  }

  // const navigateMonth = (direction: 'prev' | 'next') => {
  //   setDate(currentDate => 
  //     direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
  //   )
  // }

  const toggleTask = async (taskId: string) => {

    await toggleTaskStatus(taskId)
    const tasks = await getTasksByUser('123')

    setAllTasks(tasks)
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate && new Date(dueDate).setHours(23, 59, 59, 999) < new Date().getTime()
  }

  const handleAddTask = (data: any) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      completed: false,
      dueDate: data.dueDate,
      priority: data.priority,
      tags: [data.tag],
      project: data.project,
      section: 'To Do'
    }
    setTasks([...tasks, newTask])
    showSuccessToast()
  }


  const CalendarView = () => (
    <>
      <div className="">
        {/* Left Section */}
        <motion.div
          className="space-y-6"
          initial={!loaded ? { opacity: 0, x: -20 } : { opacity: 1 }}
          animate={!loaded && { opacity: 1, x: 0, transition: { duration: 0.5 } }}

        >
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Task List</h2>
              <Button variant="outline" size="sm" onClick={() => setIsAddTaskOpen(true)}>
                Add Task
              </Button>
            </div>

            <ScrollArea className="h-[600px] w-full">
              <motion.div
                className="gap-y-4 grid grid-cols-2 py-2 "
                // variants={container}
                // initial="hidden"
                // animate={isVisible ? "visible" : "hidden"}
                initial={!loaded ? { opacity: 0 } : { opacity: 1 }}
                animate={!loaded && {
                  opacity: 1
                }}
              >
                {allTasks?.map((task: Task, index: number) => (
                  <motion.div
                    key={task.id}
                    // variants={item}
                    initial={!loaded ? { opacity: 0, y: 100 } : { opacity: 1, y: 0 }}
                    animate={!loaded && { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 + index * 0.1 } }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
                    className={`flex items-start space-x-4 mx-4 rounded-lg border p-4 transition-colors ${task.completed ? "bg-muted/50" : ""
                      }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(e) => toggleTask(task.id)}
                      className="mt-2"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 items-center">
                          <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <motion.div
                            className="ml-auto h-3 w-3 rounded-full"
                            style={{ backgroundColor: task.project_color }}
                            initial={!loaded ? { scale: 0 } : { scale: 1 }}
                            animate={!loaded && { scale: 1, transition: { duration: 0.3, delay: 0.5 + index * 0.1 } }}
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTaskId(task.id); setIsDeleteTaskOpen(true) }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span className={isOverdue(new Date(task.due_date)) && !task.completed ? "text-destructive" : ""}>
                            {task.due_date}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${priorityColors[task.priority]} border-none`}
                        >
                          {task.priority}
                        </Badge>
                        {/* {task?.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))} */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </div>
          <DeleteTaskDialog taskId={taskId} isOpen={isDeleteTaskOpen} repull={() => getData()} handleClose={() => setIsDeleteTaskOpen(false)} />
        </motion.div>

        {/* Right Section with Calendar */}
        {/* <motion.div
          className="rounded-lg border bg-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="w-full [&_.rdp-table]:w-full [&_.rdp-cell]:w-[14.28%] [&_.rdp-head_th]:w-[14.28%]"
            />
          </div>
        </motion.div> */}
      </div>

      <motion.div
        initial={!loaded ? { opacity: 0, y: 30 } : { opacity: 1 }}
        animate={!loaded && { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } }}

      >
        <ProjectList />
      </motion.div>
    </>
  )

  const KanbanView = () => (
    <motion.div
      initial={!loaded ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
      animate={!loaded && { opacity: 1, scale: 1, transition: { duration: 0.5 } }}
    >
      <KanbanBoard
        initialTasks={allTasks}
        onTaskUpdate={setAllTasks}
        onAddTask={() => setIsAddTaskOpen(true)}
        repull={getData}
        isLoaded={loaded}
      />
    </motion.div>
  )

  const ListView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TaskListView tasks={allTasks} onTaskUpdate={setAllTasks} />
    </motion.div>
  )

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

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin')
  }

  if (isLoading) {
    return (
      <div className="">
        <Loader />
      </div>
    )
  }

  else return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4 px-8">
            <motion.h1
              className="text-2xl font-bold mb-4"
              initial={!loaded ? { opacity: 0, y: -10 } : { opacity: 1 }}
              animate={!loaded && { opacity: 1, y: 0, transition: { duration: 0.5 } }}
            >
              All Tasks
            </motion.h1>
            <Tabs
              defaultValue="allTasks"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <motion.div
                initial={!loaded ? { opacity: 0, y: 10 } : { opacity: 0 }}
                animate={!loaded && { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }}
              >
                <TabsList className="grid w-full grid-cols-3 ">
                  <TabsTrigger value="allTasks" onClick={handleLoaded}>All Tasks</TabsTrigger>
                  <TabsTrigger value="kanban" onClick={handleLoaded}>Kanban</TabsTrigger>
                  <TabsTrigger value="list" onClick={handleLoaded}>List</TabsTrigger>
                </TabsList>
              </motion.div>
              <div className="container py-6">
                <TabsContent value="allTasks" className="mt-0">
                  <CalendarView />
                </TabsContent>
                <TabsContent value="kanban" className="mt-0">
                  <KanbanView />
                </TabsContent>
                <TabsContent value="list" className="mt-0">
                  <ListView />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <AddTaskDialog
          open={isAddTaskOpen}
          onOpenChange={setIsAddTaskOpen}
          onSubmit={handleAddTask}
          repull={getData}
        />
      </div>
    </PageTransition>
  )
}