"use client"

import { useState, useEffect } from "react"
import { addDays, format, startOfWeek, subWeeks, addWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AddTaskDialog } from "@/components/add-task-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, MoreVertical, Plus, Calendar as CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Task } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toggleTaskStatus } from "@/app/api/updateTasks/route"

// interface Task {
//   id: string
//   name: string
//   completed: boolean
//   color: string
//   dueDate: Date
//   priority: 'low' | 'medium' | 'high'
//   project: string
//   tags: string[]
// }

// const initialTasks: Task[] = [
//   { id: "1", title: "Update landing page design", completed: false, color: "hsl(var(--chart-1))", dueDate: new Date(), priority: 'high', project: 'website', tags: ['design'] },
//   { id: "2", title: "Review marketing strategy", completed: true, color: "hsl(var(--chart-2))", dueDate: new Date(), priority: 'medium', project: 'marketing', tags: ['strategy'] },
//   { id: "3", title: "Client meeting preparation", completed: false, color: "hsl(var(--chart-3))", dueDate: new Date(), priority: 'high', project: 'design', tags: ['meeting'] },
//   { id: "4", title: "Content writing for blog", completed: false, color: "hsl(var(--chart-4))", dueDate: new Date(), priority: 'low', project: 'marketing', tags: ['content'] },
//   { id: "5", title: "Social media planning", completed: true, color: "hsl(var(--chart-5))", dueDate: new Date(), priority: 'medium', project: 'marketing', tags: ['social'] },
// ]

type Props = {
  t: Task[] | undefined;
  repullTasks: (user_id: string) => void
}

export function QuickTasks({ t, repullTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [initialLoad, setInitialLoad] = useState<boolean>(true)

  const router = useRouter();

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

  useEffect(() => {
    // Delay to ensure animation happens after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setInitialLoad(false)
  }, [])

  useEffect(() => {
    if (t) {

      const tasksForSelectedDate = t.filter((task: Task) => new Date(task.due_date).toDateString() === selectedDate.toDateString())

      setTasks(tasksForSelectedDate)
    }
  }, [t, selectedDate])

  const toggleTask = async (taskId: string) => {

    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))

    await toggleTaskStatus(taskId)
    repullTasks(tasks[0].user_id)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(currentDate =>
      direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1)
    )
  }

  // const handleAddTask = (data: any) => {
  //   const newTask: Task = {
  //     id: Math.random().toString(36).substr(2, 9),
  //     name: data.title,
  //     completed: false,
  //     color: `hsl(var(--chart-${Math.floor(Math.random() * 5) + 1}))`,
  //     dueDate: data.dueDate,
  //     priority: data.priority,
  //     project: data.project,
  //     tags: [data.tag]
  //   }
  //   setTasks([...tasks, newTask])
  // }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Quick Tasks</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAddTaskOpen(true)} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/schedule')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.h3
            className="text-lg"
            initial={{ y: -5, opacity: 0 }}
            animate={isVisible ? { y: 0, opacity: 1 } : { y: -5, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {format(selectedDate, 'MMMM d, yyyy')}
          </motion.h3>
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : { x: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <motion.div
              key={day}
              className="text-sm text-muted-foreground"
              initial={{ y: -10, opacity: 0 }}
              animate={isVisible ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date, index) => (
            <motion.div
              key={date.toISOString()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1, transition: { duration: 0.3, delay: 0.2 + index * 0.05 } } : { scale: 0.8, opacity: 0, transition: { duration: 0.3, delay: 0.2 + index * 0.05 } }}
              whileHover={{ scale: 1.1 }}
            >
              <Button
                variant={format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'default' : 'ghost'}
                className="h-10 w-full"
                onClick={() => setSelectedDate(date)}
              >
                {format(date, 'd')}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <ScrollArea className="h-fill max-h-[275px]">
        <div className="h-full">
          {tasks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mt-10 m-1">
              {tasks.map((task: Task, index: number) => (
                <motion.div
                  key={task.id}
                  className="rounded-lg w-full group relative "
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  {task.title.length > 8 && (
                    <span className="absolute -top-10 bg-zinc-900 w-max left-0 p-1 rounded-md text-sm border opacity-0 transition-opacity
                    group-hover:opacity-100 duration-300 delay-300" >
                      {task.title}
                    </span>
                  )}
                  <motion.div
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.1)", backgroundColor: '#18181b' }}
                    className={`p-4 flex items-center space-x-2 rounded-lg h-full w-full border overflow-x-hidden
                      ${task.priority === 'high' && 'bg-gradient-to-r from-destructive via-zinc-950 to-zinc-950'}`}
                  >

                    {/* ${task.priority === 'medium' && 'bg-gradient-to-r from-yellow-500 via-zinc-950 to-zinc-950'}
                    ${task.priority === 'low' && 'bg-gradient-to-r from-green-500 via-zinc-950 to-zinc-950'} */}
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className={`${task.completed ? "line-through text-muted-foreground" : ""}  line-clamp-1`}>
                      {task.title}
                    </div>
                    <div className="w-fit">
                      <motion.div
                        className="ml-auto h-3 w-3 rounded-full"
                        style={{ backgroundColor: task.project_color }}
                        initial={{ scale: 0 }}
                        animate={isVisible ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>

                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              key="noTasks"
              className="flex items-center p-4 w-full justify-center h-full text-muted flex-col space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <p>No tasks due for this date.</p>
            </motion.div>
          )}
        </div>
      </ScrollArea >

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        repull={repullTasks}
      />
    </div >
  )
}