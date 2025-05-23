"use client"

import { useState, useRef } from "react"
import { format } from "date-fns"
import {
  MoreHorizontal,
  Plus,
  ChevronDown,
  Check,
  Calendar,
  Tag,
  Clock,
  X,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  project: string
  section?: string
}

interface TaskListViewProps {
  tasks: Task[]
  onTaskUpdate: (updatedTasks: Task[]) => void
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

export function TaskListView({ tasks, onTaskUpdate }: TaskListViewProps) {
  const [sections, setSections] = useState<string[]>(['To Do', 'In Progress', 'Completed'])
  const [columns, setColumns] = useState<string[]>(['Status', 'Priority', 'Due Date', 'Tags'])
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [activeCell, setActiveCell] = useState<{ taskId: string, column: string } | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditingTaskStatus, setIsEditingTaskStatus] = useState(false)
  const [isEditingTaskPriority, setIsEditingTaskPriority] = useState(false)
  const [isEditingTaskDueDate, setIsEditingTaskDueDate] = useState(false)
  const [isEditingTaskTags, setIsEditingTaskTags] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")

  // Group tasks by section
  const tasksBySection = tasks.reduce((acc, task) => {
    const section = task.section || 'To Do'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Add missing sections
  sections.forEach(section => {
    if (!tasksBySection[section]) {
      tasksBySection[section] = []
    }
  })

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)))

  const handleAddColumn = () => {
    if (newColumnName.trim() && !columns.includes(newColumnName.trim())) {
      setColumns([...columns, newColumnName.trim()])
      setNewColumnName("")
      setIsAddColumnOpen(false)
    }
  }

  const handleAddSection = () => {
    if (newSectionName.trim() && !sections.includes(newSectionName.trim())) {
      setSections([...sections, newSectionName.trim()])
      setNewSectionName("")
      setIsAddSectionOpen(false)
    }
  }

  const handleRemoveColumn = (column: string) => {
    setColumns(columns.filter(c => c !== column))
  }

  const handleRemoveSection = (section: string) => {
    // Move tasks from this section to 'To Do'
    const updatedTasks = tasks.map(task =>
      task.section === section ? { ...task, section: 'To Do' } : task
    )
    onTaskUpdate(updatedTasks)

    // Remove the section
    setSections(sections.filter(s => s !== section))
  }

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed
        // If task is completed, move to Completed section, otherwise to In Progress
        const section = completed ? 'Completed' : 'In Progress'
        return { ...task, completed, section }
      }
      return task
    })
    onTaskUpdate(updatedTasks)
  }

  const handleCellClick = (taskId: string, column: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setEditingTask(task)
    setActiveCell({ taskId, column })

    switch (column) {
      case 'Status':
        setIsEditingTaskStatus(true)
        break
      case 'Priority':
        setIsEditingTaskPriority(true)
        break
      case 'Due Date':
        setIsEditingTaskDueDate(true)
        setSelectedDate(task.dueDate)
        break
      case 'Tags':
        setIsEditingTaskTags(true)
        break
      default:
        // For custom columns, we could add custom handling here
        break
    }
  }

  const updateTaskStatus = (section: string) => {
    if (!editingTask) return

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id) {
        const completed = section === 'Completed'
        return { ...task, section, completed }
      }
      return task
    })

    onTaskUpdate(updatedTasks)
    setIsEditingTaskStatus(false)
    setActiveCell(null)
  }

  const updateTaskPriority = (priority: 'low' | 'medium' | 'high') => {
    if (!editingTask) return

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id) {
        return { ...task, priority }
      }
      return task
    })

    onTaskUpdate(updatedTasks)
    setIsEditingTaskPriority(false)
    setActiveCell(null)
  }

  const updateTaskDueDate = () => {
    if (!editingTask || !selectedDate) return

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id) {
        return { ...task, dueDate: selectedDate }
      }
      return task
    })

    onTaskUpdate(updatedTasks)
    setIsEditingTaskDueDate(false)
    setActiveCell(null)
  }

  const addTagToTask = () => {
    if (!editingTask || !newTag.trim()) return

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id && !task.tags.includes(newTag.trim())) {
        return { ...task, tags: [...task.tags, newTag.trim()] }
      }
      return task
    })

    onTaskUpdate(updatedTasks)
    setNewTag("")
  }

  const removeTagFromTask = (tag: string) => {
    if (!editingTask) return

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id) {
        return { ...task, tags: task.tags.filter(t => t !== tag) }
      }
      return task
    })

    onTaskUpdate(updatedTasks)
  }

  // Filter tasks based on selected filters
  const filterTasks = (sectionTasks: Task[]) => {
    return sectionTasks.filter(task => {
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "completed" && task.completed) ||
        (statusFilter === "incomplete" && !task.completed)

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter)

      return matchesStatus && matchesPriority && matchesTag
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddSectionOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddColumnOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tag</label>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionTasks = tasksBySection[section] || []
            const filteredSectionTasks = filterTasks(sectionTasks)

            return (
              <div key={section} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{section}</h3>
                    <Badge variant="outline">{filteredSectionTasks.length}</Badge>
                  </div>

                  {section !== 'To Do' && section !== 'In Progress' && section !== 'Completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSection(section)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="border rounded-md overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[auto,1fr] bg-muted/50">
                    <div className="p-2 border-r border-b flex items-center justify-center">
                      <Checkbox className="opacity-0 pointer-events-none" />
                    </div>
                    <div className="grid border-b" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(150px, 1fr))` }}>
                      {columns.map((column, index) => (
                        <div
                          key={column}
                          className={`p-2 font-medium text-sm flex items-center justify-between ${index < columns.length - 1 ? 'border-r' : ''}`}
                        >
                          {column}
                          {column !== 'Status' && column !== 'Priority' && column !== 'Due Date' && column !== 'Tags' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => handleRemoveColumn(column)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Body */}
                  {filteredSectionTasks.length > 0 ? (
                    filteredSectionTasks.map((task) => (
                      <div key={task.id} className="grid grid-cols-[auto,1fr] hover:bg-muted/30">
                        <div className="p-2 border-r flex items-center justify-center">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                          />
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(150px, 1fr))` }}>
                          {columns.map((column, index) => (
                            <div
                              key={`${task.id}-${column}`}
                              className={`p-2 ${index < columns.length - 1 ? 'border-r' : ''} cursor-pointer hover:bg-muted/50`}
                              onClick={() => handleCellClick(task.id, column)}
                            >
                              {column === 'Status' && (
                                <Badge variant={task.completed ? "default" : "outline"}>
                                  {task.section || (task.completed ? 'Completed' : 'To Do')}
                                </Badge>
                              )}

                              {column === 'Priority' && (
                                <Badge
                                  variant="secondary"
                                  className={`${priorityColors[task.priority]} border-none`}
                                >
                                  {task.priority}
                                </Badge>
                              )}

                              {column === 'Due Date' && (
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {task.dueDate}
                                </div>
                              )}

                              {column === 'Tags' && (
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Custom columns can be handled here */}
                              {column !== 'Status' && column !== 'Priority' && column !== 'Due Date' && column !== 'Tags' && (
                                <div className="text-sm text-muted-foreground italic">
                                  Click to edit
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No tasks in this section
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Column Name</label>
              <Input
                placeholder="Enter column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Name</label>
              <Input
                placeholder="Enter section name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Status Popover */}
      <Popover open={isEditingTaskStatus} onOpenChange={setIsEditingTaskStatus}>
        <PopoverContent
          align="start"
          className="w-56"
          style={{
            position: 'absolute',
            left: activeCell ? `${document.getElementById(`${activeCell.taskId}-${activeCell.column}`)?.getBoundingClientRect().left}px` : 0,
            top: activeCell ? `${document.getElementById(`${activeCell.taskId}-${activeCell.column}`)?.getBoundingClientRect().bottom}px` : 0,
          }}
        >
          <div className="space-y-2">
            {sections.map(section => (
              <div
                key={section}
                className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => updateTaskStatus(section)}
              >
                {editingTask?.section === section && <Check className="h-4 w-4" />}
                <span className={editingTask?.section === section ? "font-medium" : ""}>
                  {section}
                </span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Task Priority Popover */}
      <Popover open={isEditingTaskPriority} onOpenChange={setIsEditingTaskPriority}>
        <PopoverContent
          align="start"
          className="w-56"
        >
          <div className="space-y-2">
            {(['low', 'medium', 'high'] as const).map(priority => (
              <div
                key={priority}
                className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => updateTaskPriority(priority)}
              >
                {editingTask?.priority === priority && <Check className="h-4 w-4" />}
                <Badge
                  variant="secondary"
                  className={`${priorityColors[priority]} border-none`}
                >
                  {priority}
                </Badge>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Task Due Date Popover */}
      <Popover open={isEditingTaskDueDate} onOpenChange={setIsEditingTaskDueDate}>
        <PopoverContent
          align="start"
          className="w-auto p-0"
        >
          <div className="p-2">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={updateTaskDueDate}>
                Update
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Task Tags Popover */}
      <Popover open={isEditingTaskTags} onOpenChange={setIsEditingTaskTags}>
        <PopoverContent
          align="start"
          className="w-72"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Tags</label>
              <div className="flex flex-wrap gap-2">
                {editingTask?.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => removeTagFromTask(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {editingTask?.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Add New Tag</label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter tag name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={addTagToTask}>
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Common Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags
                  .filter(tag => !editingTask?.tags.includes(tag))
                  .map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setNewTag(tag)
                        addTagToTask()
                      }}
                    >
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}