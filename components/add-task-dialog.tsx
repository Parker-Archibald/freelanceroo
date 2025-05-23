"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getAllProjects } from "@/app/api/getProjects/route"
import { addTask } from "@/app/api/updateTasks/route"
import { getTodoColumn } from "@/app/api/kanban/route"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  priority: z.enum(["low", "medium", "high"]),
  project: z.string().min(1, "Project is required"),
  tag: z.string().min(1, "Tag is required"),
})

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: z.infer<typeof formSchema>) => void
  repull: () => void;
}

export function AddTaskDialog({ open, onOpenChange, repull }: AddTaskDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      project: "",
      tag: "",
    },
  })

  const [projects, setProjects] = useState<{
    id: string;
    title: string;
    description: string;
    user_ids: number[];
    timeline_end: string;
    status: 'in_progress' | 'applied' | 'complete';
    color: string;
  }[]>([])

  const [selectedProject, setSelectedProject] = useState({})
  const [taskTitle, setTaskTitle] = useState('')
  const [todoColumnId, setTodoColumnId] = useState<string>('')

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {

    const month = data.dueDate.getMonth()
    const day = data.dueDate.getDate()
    const year = data.dueDate.getFullYear()

    const due_date = `${month + 1}/${day}/${year}`

    const currMonth = new Date().getMonth()
    const currDay = new Date().getDate()
    const currYear = new Date().getFullYear()

    const currDate = `${currMonth + 1}/${currDay}/${currYear}`

    let project_color = ''

    projects.forEach(project => {
      if (project.id === data.project) {
        project_color = project.color
      }
    })

    const newTask = {
      completed: false,
      date: currDate,
      due_date: due_date,
      list_order: 500,
      priority: data.priority,
      project_color: project_color,
      project_id: data.project,
      section_id: todoColumnId,
      tags: [],
      title: data.title,
      user_id: '123'
    }

    await addTask(newTask)

    repull()
    form.reset()
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      const getData = async () => {
        const projectList = await getAllProjects()
        setProjects(projectList)

        const todoColumn = await getTodoColumn('123')
        setTodoColumnId(todoColumn)
      }

      getData()
    }
  }, [open])

  const updateSelectedProject = (project_id: string) => {
    projects.forEach(project => {
      setSelectedProject({
        title: project.title,
        color: project.color,
        id: project.id
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} className='hover:cursor-pointer'>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}