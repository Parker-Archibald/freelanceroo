"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { format } from "date-fns"
import { AlertCircle, CheckCircle, Clock, MoreVertical, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Task } from "@/lib/types"
import { getColumnsById } from "@/app/api/kanban/route"
import DeleteTaskDialog from "./delete-task-dialog"
import { motion } from "framer-motion"
import { PageTransition } from "./page-transition"
import { updateTaskSection } from "@/app/api/updateTasks/route"
import { useToast } from "@/hooks/use-toast"

// interface Task {
//   id: string
//   title: string
//   completed: boolean
//   dueDate: Date
//   priority: 'low' | 'medium' | 'high'
//   tags: string[]
//   project: string
// }

// interface C {
//   name: string;
//   id: string;
//   user_id: string
// }

interface Column {
  name: string;
  id: string;
  user_id: string
  task_list: Task[]
}

interface KanbanBoardProps {
  initialTasks: Task[]
  onTaskUpdate: (tasks: Task[]) => void
  onAddTask: () => void
  repull: () => void
  isLoaded: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

export function KanbanBoard({ initialTasks, onTaskUpdate, onAddTask, repull, isLoaded }: KanbanBoardProps) {


  const [columns, setColumns] = useState<Column[]>([])

  // const [c, setC] = useState<C[]>([])

  const { toast } = useToast()

  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<string>('')

  const [selectedItem, setSelectedItem] = useState({})

  useEffect(() => {
    getColumns()
  }, [])

  const getColumns = async () => {
    const results = await getColumnsById('123')

    // setC(results)
    sortTasks(results)
  }

  const sortTasks = (columns: Column[]) => {
    if (initialTasks) {

      let newColumns: Column[] = columns;

      initialTasks.forEach(task => {
        columns.forEach((column, index) => {
          if (task.section_id === column.id) {
            column.task_list.push(task)
          }
        })
      })


      newColumns.map(column => {
        column.task_list.sort((a, b) => {
          if (a.list_order < b.list_order) {
            return -1
          }
          else {
            return 1
          }
        })
      })

      setColumns(newColumns)
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

  const showErrorToast = (desc: { name: string }) => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 " />
          <div className="flex-wrap flex">Error: {desc.name}!</div>
        </div>
      ),
      description: "There was a problem with your request.",
    })
  }

  const onDragEnd = async (result: { destination: { droppableId: string, index: number }, source: { droppableId: string, index: number }, draggableId: string }) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index

    ) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const selectedTask = initialTasks.find(task =>
      task.id === draggableId
    )

    const from = sourceColumn.task_list.findIndex(task => selectedTask!.id === task.id)
    const fromCol = columns.findIndex(column => column.id === sourceColumn.id)
    // destColumn.task_list.push(selectedTask!)

    selectedTask!.section_id = destination.droppableId
    selectedTask!.list_order = destination.index

    columns[fromCol].task_list.splice(from)
    destColumn.task_list.splice(destination.index, 0, selectedTask!)

    const update = await updateTaskSection(selectedTask!)

    if (update === 'true') {
      // showSuccessToast()
    }
    else {
      // showErrorToast(update)
    }
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate && new Date(dueDate).setHours(23, 59, 59, 999) < new Date().getTime()
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn: Column = {
        id: `column-${Date.now()}`,
        title: newColumnTitle.trim(),
        tasks: [],
      }
      const newColumns = [...columns, newColumn]
      setColumns(newColumns)
      localStorage.setItem('kanbanColumns', JSON.stringify(newColumns))
      setNewColumnTitle("")
      setIsAddingColumn(false)
    }
  }

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column) return

    const updatedColumns = columns.map(col => {
      if (col.id === "todo") {
        return {
          ...col,
          tasks: [...col.tasks, ...column.tasks]
        }
      }
      return col
    }).filter(col => col.id !== columnId)

    setColumns(updatedColumns)
    localStorage.setItem('kanbanColumns', JSON.stringify(updatedColumns))
  }

  const getTaskStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle,
    userSelect: 'none',
    margin: '0 0 8px 0',
    minHeight: '50px',
    transform: isDragging ? draggableStyle.transform : 'none',
  })

  const onDragStart = (start: any) => {
    setSelectedItem(start.draggableId)
    const task = initialTasks.find(t => t.id === start.draggableId)
    if (task) {
      setSelectedItem(task)
    }
  }

  return (
    <PageTransition>
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className="flex gap-6 overflow-x-auto pb-6 md:min-h-[600px]">
          {columns.map(column => (
            <motion.div
              initial={!isLoaded ? { opacity: 0, x: -20 } : { opacity: 1 }}
              animate={!isLoaded && { opacity: 1, x: 0, transition: { duration: 0.5 } }}

              key={column.id} className="flex flex-col rounded-lg border bg-card min-w-[320px] max-h-[600px]">
              <div className="p-4 border-b ">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{column.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {column.task_list?.length}
                    </span>
                    {column.task_list?.length < 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Droppable droppableId={column.id}
                renderClone={(provided, snapshot, rubric) => {

                  console.log(snapshot, provided)

                  return (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="bg-card transition-shadow mb-3 shadow-lg ring-2 ring-primary opacity-90 rounded-lg"
                    >
                      <div
                        className="p-4 space-y-3 rounded-lg border group">
                        <div className="flex items-center justify-between ">
                          <div className="flex space-x-4 items-center">
                            <h4 className="font-medium">{selectedItem.title}</h4>
                            <div
                              className="ml-auto h-3 w-3 rounded-full"
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
                              <DropdownMenuItem className="hover:cursor-pointer">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="hover:cursor-pointer" onClick={() => { setIsDeleteTaskOpen(true); setDeleteTaskId(selectedItem.id); }}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span className={isOverdue(new Date(selectedItem.due_date)) && !selectedItem.completed ? "text-destructive" : ""}>
                              {/* {format(task.dueDate, "MMM d, yyyy")} */}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`${priorityColors[selectedItem.priority]} border-none`}
                          >
                            {selectedItem.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                }}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 overflow-y-auto scrollbar-hide transition-colors min-h-[200px] ${snapshot.isDraggingOver ? "bg-muted/50" : ""
                      }`}
                    style={{
                      minHeight: '200px'
                    }}
                  >
                    {column?.task_list?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => {

                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getTaskStyle(snapshot.isDragging, provided.draggableProps.style)}
                              className={`bg-card shadow-sm transition-shadow mb-3 rounded-lg  ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary opacity-90" : ""
                                }`}

                            >
                              <motion.div
                                initial={!isLoaded ? { opacity: 0, y: 20 } : { opacity: 1 }}
                                animate={!isLoaded && { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 + index * 0.1, } }}
                                whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
                                className="p-4 space-y-3 rounded-lg border group">
                                <div className="flex items-center justify-between ">
                                  <div className="flex space-x-4 items-center">
                                    <h4 className="font-medium">{task.title}</h4>
                                    <motion.div
                                      className="ml-auto h-3 w-3 rounded-full"
                                      style={{ backgroundColor: task.project_color }}
                                      initial={!isLoaded ? { scale: 0 } : { scale: 1 }}
                                      animate={!isLoaded && { scale: 1, transition: { duration: 0.3, delay: 0.5 + index * 0.1 } }}

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
                                      <DropdownMenuItem className="hover:cursor-pointer">Edit</DropdownMenuItem>
                                      <DropdownMenuItem className="hover:cursor-pointer" onClick={() => { setIsDeleteTaskOpen(true); setDeleteTaskId(task.id); }}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    <span className={isOverdue(new Date(task.due_date)) && !task.completed ? "text-destructive" : ""}>
                                      {/* {format(task.dueDate, "MMM d, yyyy")} */}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`${priorityColors[task.priority]} border-none`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </motion.div>
                            </div>
                          )
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="mt-auto p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onAddTask}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Add Column Section */}
          <div className="min-w-[320px] rounded-lg border bg-card/50 backdrop-blur">
            {isAddingColumn ? (
              <div className="p-4 space-y-4">
                <Input
                  placeholder="Enter column title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleAddColumn}
                  >
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingColumn(false)
                      setNewColumnTitle("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-full min-h-[200px] flex flex-col gap-2"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="h-6 w-6" />
                <span>Add Column</span>
              </Button>
            )}
          </div>
        </div>
        <DeleteTaskDialog
          isOpen={isDeleteTaskOpen}
          taskId={deleteTaskId}
          handleClose={() => setIsDeleteTaskOpen(false)}
          repull={repull}
        />
      </DragDropContext>
    </PageTransition>
  )
}