"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns"
import { Building2, Calendar, ChevronLeft, ChevronRight, Clock, Mail, MapPin, Phone, Plus, User, Users, MoreVertical, Send, Paperclip, X, FileText, Download, Contact as FileContract, Receipt, Loader2, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskListView } from '@/components/task-list-view'
import { AttachmentPreviewModal } from "@/components/attachment-preview-modal"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getProjectById } from "@/app/api/getProjectById/[...id]/route"
import { Project } from "@/lib/types"
import Loader from "@/components/Loader"

interface ProjectDetails {
  description: string
  startDate: string
  endDate: string
  budget: string
  team: string[]
  status: string
  progress: number
  color: string
}

interface CustomerContact {
  name: string
  company: string
  email: string
  phone: string
  address: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  project: string
}

interface Note {
  id: string
  content: string
  timestamp: Date
  author: string
}

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
  url?: string
}

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.string().min(1, "Budget is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerCompany: z.string().min(1, "Company name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerAddress: z.string().min(1, "Address is required"),
})

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export default function ProjectPage() {
  const params = useParams()
  const searchParms = useSearchParams()
  const id = searchParms.get('id')

  const projectName = typeof params.name === 'string' ?
    params.name.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : ''

  const [isEditing, setIsEditing] = useState(false)

  // const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
  //   description: "This project involves a complete redesign of the company's website using modern design principles and the latest web technologies. The goal is to improve user experience, increase engagement, and boost conversion rates.",
  //   startDate: "2024-04-01",
  //   endDate: "2024-06-30",
  //   budget: "$25,000",
  //   team: ["John Doe", "Jane Smith", "Mike Johnson"],
  //   status: "in-progress",
  //   progress: 65,
  //   color: "hsl(var(--chart-1))",
  // })

  // const [customerContact, setCustomerContact] = useState<CustomerContact>({
  //   name: "Sarah Wilson",
  //   company: "Tech Innovations Inc.",
  //   email: "sarah.wilson@techinnovations.com",
  //   phone: "+1 (555) 123-4567",
  //   address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
  // })

  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Initial project meeting completed. Client expressed interest in modern design elements.",
      timestamp: new Date(2024, 3, 15, 14, 30),
      author: "John Doe"
    },
    {
      id: "2",
      content: "Budget approval received from stakeholders.",
      timestamp: new Date(2024, 3, 14, 11, 15),
      author: "Jane Smith"
    }
  ])
  const [newNote, setNewNote] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "1",
      name: "project_proposal.pdf",
      size: 2500000,
      type: "application/pdf",
      uploadedAt: new Date(2024, 3, 10, 9, 30),
      uploadedBy: "John Doe",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "2",
      name: "design_mockup.jpg",
      size: 1800000,
      type: "image/jpeg",
      uploadedAt: new Date(2024, 3, 12, 14, 15),
      uploadedBy: "Jane Smith",
      url: "https://source.unsplash.com/random/800x600?website"
    },
    {
      id: "3",
      name: "team_members.csv",
      size: 45000,
      type: "text/csv",
      uploadedAt: new Date(2024, 3, 14, 11, 0),
      uploadedBy: "Mike Johnson"
    },
    {
      id: "4",
      name: "requirements_document.docx",
      size: 350000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadedAt: new Date(2024, 3, 15, 16, 45),
      uploadedBy: "Sarah Wilson"
    },
    {
      id: "5",
      name: "site_architecture.png",
      size: 1200000,
      type: "image/png",
      uploadedAt: new Date(2024, 3, 16, 10, 30),
      uploadedBy: "Mike Johnson",
      url: "https://source.unsplash.com/random/800x600?architecture"
    }
  ])

  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
  const [isGeneratingContract, setIsGeneratingContract] = useState(false)
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Note editing states
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false)
  const [isDeleteNoteAlertOpen, setIsDeleteNoteAlertOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editedNoteContent, setEditedNoteContent] = useState("")

  const [project, setProject] = useState<Project>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const getData = async () => {
      if (id) {
        const results = await getProjectById(id);
        setProject(results)

        setIsLoading(false)
      }
    }
    getData()
  }, [id])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: project?.description,
      startDate: project?.timeline_start,
      endDate: project?.timeline_end,
      budget: project?.budget,
      customerName: project?.customer_info.customer_name,
      customerCompany: project?.customer_info.customer_company,
      customerEmail: project?.customer_info.customer_email,
      customerPhone: project?.customer_info.customer_phone,
      customerAddress: project?.customer_info.customer_address,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setProjectDetails({
      ...projectDetails,
      description: values.description,
      startDate: values.startDate,
      endDate: values.endDate,
      budget: values.budget,
    })
    setCustomerContact({
      name: values.customerName,
      company: values.customerCompany,
      email: values.customerEmail,
      phone: values.customerPhone,
      address: values.customerAddress,
    })
    setIsEditing(false)
  }

  const handleAddTask = (data: any) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      completed: false,
      dueDate: data.dueDate,
      priority: data.priority,
      tags: [data.tag],
      project: projectName.toLowerCase()
    }
    setTasks([...tasks, newTask])
  }

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Math.random().toString(36).substr(2, 9),
        content: newNote.trim(),
        timestamp: new Date(),
        author: "John Doe" // This would normally come from the authenticated user
      }
      setNotes([note, ...notes])
      setNewNote("")
    }
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setEditedNoteContent(note.content)
    setIsEditNoteDialogOpen(true)
  }

  const handleDeleteNote = (note: Note) => {
    setSelectedNote(note)
    setIsDeleteNoteAlertOpen(true)
  }

  const confirmEditNote = () => {
    if (selectedNote && editedNoteContent.trim()) {
      setNotes(notes.map(note =>
        note.id === selectedNote.id
          ? { ...note, content: editedNoteContent.trim() }
          : note
      ))
      setIsEditNoteDialogOpen(false)
      setSelectedNote(null)
      setEditedNoteContent("")
    }
  }

  const confirmDeleteNote = () => {
    if (selectedNote) {
      setNotes(notes.filter(note => note.id !== selectedNote.id))
      setIsDeleteNoteAlertOpen(false)
      setSelectedNote(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          uploadedBy: "John Doe" // This would normally come from the authenticated user
        }
        setAttachments(prev => [...prev, newAttachment])
      })
    }
    setIsAttachmentDialogOpen(false)
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id))
  }

  const replaceAttachment = (id: string, file: File) => {
    setAttachments(attachments.map(attachment =>
      attachment.id === id
        ? {
          ...attachment,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        }
        : attachment
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleGenerateContract = async () => {
    setIsGeneratingContract(true)
    try {
      // Simulate contract generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In a real app, this would make an API call to generate the contract
      setIsGeneratingContract(false)
      setIsContractDialogOpen(false)
    } catch (error) {
      console.error('Error generating contract:', error)
      setIsGeneratingContract(false)
    }
  }

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true)
    try {
      // Simulate invoice generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In a real app, this would make an API call to generate the invoice
      setIsGeneratingInvoice(false)
      setIsInvoiceDialogOpen(false)
    } catch (error) {
      console.error('Error generating invoice:', error)
      setIsGeneratingInvoice(false)
    }
  }

  const openAttachmentPreview = (attachment: Attachment) => {
    setSelectedAttachment(attachment)
    setIsPreviewModalOpen(true)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileText className="h-4 w-4 text-muted-foreground" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4 text-muted-foreground" />
    if (type === 'text/csv') return <FileText className="h-4 w-4 text-muted-foreground" />
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return <FileText className="h-4 w-4 text-muted-foreground" />
    return <FileText className="h-4 w-4 text-muted-foreground" />
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

  const CalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Task List</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddTaskOpen(true)}>
              Add Task
            </Button>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={item}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
                  className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${task.completed ? "bg-muted/50" : ""
                    }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => { }}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>
                          {format(task.dueDate, "MMM d, yyyy")}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {task.priority}
                      </Badge>
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </ScrollArea>
        </div>
      </motion.div>

      <motion.div
        className="rounded-lg border bg-card p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-center w-full">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(newDate) => newDate && setSelectedDate(newDate)}
            className="w-full [&_.rdp-table]:w-full [&_.rdp-cell]:w-[14.28%] [&_.rdp-head_th]:w-[14.28%]"
          />
        </div>
      </motion.div>
    </div>
  )

  const KanbanView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <KanbanBoard
        initialTasks={tasks}
        onTaskUpdate={setTasks}
        onAddTask={() => setIsAddTaskOpen(true)}
      />
    </motion.div>
  )

  const ListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 text-center"
    >
      <TaskListView tasks={tasks} onTaskUpdate={setTasks} />
    </motion.div>
  )

  if (isLoading) {
    return <Loader />
  }

  return (
    <PageTransition>
      <div className="container px-4 py-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project?.color }}
              />
              {project?.project_name}
            </h1>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className={`${statusColors[project?.status]} border-none`}
              >
                {project?.status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Created on {project?.created_time}
              </div>
            </div>
          </motion.div>
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button onClick={() => setIsAttachmentDialogOpen(true)}>
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Files
            </Button>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Project"}
            </Button>
          </motion.div>
        </div>


        {/* Editing info */}
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={item}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Project description"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. $10,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Customer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p>{project?.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{project?.timeline_start}</span>
                        <span>-</span>
                        <span>{project?.timeline_end}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Budget</h3>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span>{project?.budget}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Team</h3>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {/* <span>{project.team.join(", ")}</span> */}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Progress value={20} className="h-2" />
                        <span className="text-sm font-medium ml-2">{20}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsContractDialogOpen(true)}>
                      <FileContract className="h-4 w-4 mr-2" />
                      Generate Contract
                    </Button>
                    <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(true)}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{project?.customer_info.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{project?.customer_info.customer_company}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <p>{project?.customer_info.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p>{project?.customer_info.customer_phone}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p>{project?.customer_info.customer_address}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          variants={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="calendar">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar">
              <CalendarView />
            </TabsContent>
            <TabsContent value="kanban">
              <KanbanView />
            </TabsContent>
            <TabsContent value="list">
              <ListView />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notes</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addNote} disabled={!newNote.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{note.author}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-muted-foreground">
                              {format(note.timestamp, "MMM d, yyyy 'at' h:mm a")}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteNote(note)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attachments</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAttachmentDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add File
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(attachment.type)}
                        <div>
                          <p
                            className="font-medium hover:underline cursor-pointer"
                            onClick={() => openAttachmentPreview(attachment)}
                          >
                            {attachment.name}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{formatFileSize(attachment.size)}</span>
                            <span className="mx-2">•</span>
                            <span>{format(attachment.uploadedAt, "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAttachmentPreview(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Input for Attachments */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />

        {/* Add Task Dialog */}
        <AddTaskDialog
          open={isAddTaskOpen}
          onOpenChange={setIsAddTaskOpen}
          onSubmit={handleAddTask}
        />

        {/* Contract Generation Dialog */}
        <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Contract</DialogTitle>
              <DialogDescription>
                This will generate a contract document based on the project details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Contract Details</h3>
                <p className="text-sm text-muted-foreground">
                  The contract will include project scope, timeline, deliverables, and payment terms.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContractDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateContract} disabled={isGeneratingContract}>
                {isGeneratingContract ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Contract</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Generation Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Invoice</DialogTitle>
              <DialogDescription>
                This will generate an invoice based on the project details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Invoice Details</h3>
                <p className="text-sm text-muted-foreground">
                  The invoice will include project name, client details, amount, and payment terms.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateInvoice} disabled={isGeneratingInvoice}>
                {isGeneratingInvoice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Invoice</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={isEditNoteDialogOpen} onOpenChange={setIsEditNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={editedNoteContent}
                onChange={(e) => setEditedNoteContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmEditNote}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Note Alert */}
        <AlertDialog open={isDeleteNoteAlertOpen} onOpenChange={setIsDeleteNoteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Attachment Preview Modal */}
        <AttachmentPreviewModal
          attachment={selectedAttachment}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onDelete={removeAttachment}
          onReplace={replaceAttachment}
        />
      </div>
    </PageTransition>
  )
}