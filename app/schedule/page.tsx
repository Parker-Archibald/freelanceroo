"use client"

import { useState, useEffect } from "react"
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isWithinInterval } from "date-fns"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  X,
  CalendarDays,
  CalendarRange,
  Plus,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PageTransition } from "@/components/page-transition"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface ScheduleTask {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  location?: string
  attendees?: string[]
  project: {
    id: string
    name: string
    color: string
  }
  priority: 'low' | 'medium' | 'high'
}

// Mock data for schedule tasks
const initialTasks: ScheduleTask[] = [
  {
    id: "task-1",
    title: "Team Standup",
    description: "Daily team standup meeting to discuss progress and blockers",
    startTime: "09:00",
    endTime: "09:30",
    date: "2024-04-15",
    location: "Conference Room A",
    attendees: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"],
    project: {
      id: "website",
      name: "Website Redesign",
      color: "hsl(var(--chart-1))"
    },
    priority: "medium"
  },
  {
    id: "task-2",
    title: "Client Meeting",
    description: "Review website redesign progress with the client",
    startTime: "11:00",
    endTime: "12:30",
    date: "2024-04-15",
    location: "Zoom Call",
    attendees: ["John Doe", "Jane Smith", "Client Team"],
    project: {
      id: "website",
      name: "Website Redesign",
      color: "hsl(var(--chart-1))"
    },
    priority: "high"
  },
  {
    id: "task-3",
    title: "Design Review",
    description: "Review and provide feedback on the latest design mockups",
    startTime: "14:00",
    endTime: "15:30",
    date: "2024-04-15",
    location: "Design Lab",
    attendees: ["Jane Smith", "Design Team"],
    project: {
      id: "mobile-app",
      name: "Mobile App",
      color: "hsl(var(--chart-2))"
    },
    priority: "medium"
  },
  {
    id: "task-4",
    title: "Marketing Strategy",
    description: "Develop marketing strategy for the upcoming product launch",
    startTime: "10:00",
    endTime: "11:30",
    date: "2024-04-16",
    location: "Marketing Office",
    attendees: ["Marketing Team", "Product Team"],
    project: {
      id: "marketing",
      name: "Marketing Campaign",
      color: "hsl(var(--chart-3))"
    },
    priority: "high"
  },
  {
    id: "task-5",
    title: "Development Sprint Planning",
    description: "Plan the next development sprint and assign tasks",
    startTime: "13:00",
    endTime: "14:30",
    date: "2024-04-16",
    location: "Conference Room B",
    attendees: ["Development Team", "Product Manager"],
    project: {
      id: "mobile-app",
      name: "Mobile App",
      color: "hsl(var(--chart-2))"
    },
    priority: "medium"
  },
  {
    id: "task-6",
    title: "User Testing",
    description: "Conduct user testing sessions for the new features",
    startTime: "15:00",
    endTime: "17:00",
    date: "2024-04-16",
    location: "User Lab",
    attendees: ["UX Team", "Test Participants"],
    project: {
      id: "mobile-app",
      name: "Mobile App",
      color: "hsl(var(--chart-2))"
    },
    priority: "high"
  },
  {
    id: "task-7",
    title: "Content Review",
    description: "Review and approve content for the website",
    startTime: "09:30",
    endTime: "11:00",
    date: "2024-04-17",
    location: "Content Studio",
    attendees: ["Content Team", "Marketing Team"],
    project: {
      id: "website",
      name: "Website Redesign",
      color: "hsl(var(--chart-1))"
    },
    priority: "medium"
  },
  {
    id: "task-8",
    title: "Backend Development",
    description: "Work on API integration for the mobile app",
    startTime: "13:00",
    endTime: "17:00",
    date: "2024-04-17",
    location: "Development Office",
    attendees: ["Backend Team"],
    project: {
      id: "mobile-app",
      name: "Mobile App",
      color: "hsl(var(--chart-2))"
    },
    priority: "high"
  },
  {
    id: "task-9",
    title: "Social Media Planning",
    description: "Plan social media content for the next month",
    startTime: "10:00",
    endTime: "12:00",
    date: "2024-04-18",
    location: "Marketing Office",
    attendees: ["Social Media Team"],
    project: {
      id: "marketing",
      name: "Marketing Campaign",
      color: "hsl(var(--chart-3))"
    },
    priority: "medium"
  },
  {
    id: "task-10",
    title: "Executive Review",
    description: "Present project progress to executive team",
    startTime: "14:00",
    endTime: "15:30",
    date: "2024-04-18",
    location: "Executive Boardroom",
    attendees: ["Project Managers", "Executive Team"],
    project: {
      id: "website",
      name: "Website Redesign",
      color: "hsl(var(--chart-1))"
    },
    priority: "high"
  },
  {
    id: "task-11",
    title: "Team Building",
    description: "Team building activity and lunch",
    startTime: "12:00",
    endTime: "14:00",
    date: "2024-04-19",
    location: "City Park",
    attendees: ["All Teams"],
    project: {
      id: "company",
      name: "Company Events",
      color: "hsl(var(--chart-4))"
    },
    priority: "low"
  },
  {
    id: "task-12",
    title: "Weekly Retrospective",
    description: "Review the week's progress and discuss improvements",
    startTime: "15:00",
    endTime: "16:30",
    date: "2024-04-19",
    location: "Conference Room A",
    attendees: ["All Teams"],
    project: {
      id: "company",
      name: "Company Events",
      color: "hsl(var(--chart-4))"
    },
    priority: "medium"
  },
  // Additional tasks for the week
  {
    id: "task-13",
    title: "Code Review",
    description: "Review pull requests and code changes",
    startTime: "11:00",
    endTime: "12:00",
    date: "2024-04-17",
    location: "Development Office",
    attendees: ["Development Team"],
    project: {
      id: "website",
      name: "Website Redesign",
      color: "hsl(var(--chart-1))"
    },
    priority: "medium"
  },
  {
    id: "task-14",
    title: "UI Component Library",
    description: "Work on standardizing UI components",
    startTime: "14:30",
    endTime: "16:00",
    date: "2024-04-18",
    location: "Design Lab",
    attendees: ["Design Team", "Frontend Developers"],
    project: {
      id: "design-system",
      name: "Design System",
      color: "hsl(var(--chart-5))"
    },
    priority: "high"
  },
  {
    id: "task-15",
    title: "Analytics Review",
    description: "Review website analytics and user behavior",
    startTime: "09:00",
    endTime: "10:30",
    date: "2024-04-19",
    location: "Data Room",
    attendees: ["Analytics Team", "Marketing Team"],
    project: {
      id: "analytics",
      name: "Analytics Dashboard",
      color: "hsl(265, 89%, 78%)"
    },
    priority: "medium"
  },
  {
    id: "task-16",
    title: "Client Onboarding",
    description: "Onboard new client to the platform",
    startTime: "13:30",
    endTime: "15:00",
    date: "2024-04-15",
    location: "Client Success Room",
    attendees: ["Client Success Team", "New Client"],
    project: {
      id: "client-success",
      name: "Client Success",
      color: "hsl(142, 76%, 36%)"
    },
    priority: "high"
  },
  {
    id: "task-17",
    title: "Product Roadmap Planning",
    description: "Plan product features for next quarter",
    startTime: "10:00",
    endTime: "12:00",
    date: "2024-04-17",
    location: "Strategy Room",
    attendees: ["Product Team", "Executive Team"],
    project: {
      id: "product",
      name: "Product Strategy",
      color: "hsl(330, 81%, 60%)"
    },
    priority: "high"
  },
  {
    id: "task-18",
    title: "Security Audit",
    description: "Review security protocols and implementations",
    startTime: "14:00",
    endTime: "16:00",
    date: "2024-04-19",
    location: "Security Office",
    attendees: ["Security Team", "Development Team"],
    project: {
      id: "security",
      name: "Security Compliance",
      color: "hsl(190, 95%, 39%)"
    },
    priority: "high"
  },
  {
    id: "task-19",
    title: "Budget Review",
    description: "Review project budgets and forecasts",
    startTime: "11:30",
    endTime: "13:00",
    date: "2024-04-18",
    location: "Finance Department",
    attendees: ["Finance Team", "Project Managers"],
    project: {
      id: "finance",
      name: "Financial Planning",
      color: "hsl(231, 48%, 48%)"
    },
    priority: "medium"
  },
  {
    id: "task-20",
    title: "Vendor Meeting",
    description: "Meet with potential new vendors",
    startTime: "09:30",
    endTime: "11:00",
    date: "2024-04-16",
    location: "Meeting Room C",
    attendees: ["Procurement Team", "Vendors"],
    project: {
      id: "procurement",
      name: "Vendor Management",
      color: "hsl(43, 74%, 66%)"
    },
    priority: "low"
  }
];

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

// Generate time slots from 8:00 to 18:00 in 30-minute increments
const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

// Available projects for task creation
const availableProjects = [
  { id: "website", name: "Website Redesign", color: "hsl(var(--chart-1))" },
  { id: "mobile-app", name: "Mobile App", color: "hsl(var(--chart-2))" },
  { id: "marketing", name: "Marketing Campaign", color: "hsl(var(--chart-3))" },
  { id: "company", name: "Company Events", color: "hsl(var(--chart-4))" },
  { id: "design-system", name: "Design System", color: "hsl(var(--chart-5))" },
  { id: "analytics", name: "Analytics Dashboard", color: "hsl(265, 89%, 78%)" },
  { id: "client-success", name: "Client Success", color: "hsl(142, 76%, 36%)" },
  { id: "product", name: "Product Strategy", color: "hsl(330, 81%, 60%)" },
  { id: "security", name: "Security Compliance", color: "hsl(190, 95%, 39%)" },
  { id: "finance", name: "Financial Planning", color: "hsl(231, 48%, 48%)" },
  { id: "procurement", name: "Vendor Management", color: "hsl(43, 74%, 66%)" },
];

// Form schema for adding a new task
const addTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  priority: z.enum(["low", "medium", "high"]),
  attendees: z.string().optional(),
});

export default function SchedulePage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [tasks, setTasks] = useState<ScheduleTask[]>(initialTasks);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDayForNewTask, setSelectedDayForNewTask] = useState<Date | null>(null);

  // Form for adding a new task
  const addTaskForm = useForm<z.infer<typeof addTaskSchema>>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      projectId: "",
      priority: "medium",
      attendees: "",
    },
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Update form values when a day and time slot are selected for a new task
  useEffect(() => {
    if (selectedDayForNewTask && selectedTimeSlot) {
      const dateString = format(selectedDayForNewTask, "yyyy-MM-dd");
      const endTimeHour = parseInt(selectedTimeSlot.split(":")[0]);
      const endTimeMinute = parseInt(selectedTimeSlot.split(":")[1]);
      
      // Calculate end time (default to 1 hour after start time)
      let newEndTimeHour = endTimeHour + 1;
      let newEndTimeMinute = endTimeMinute;
      
      // Format end time
      const endTime = `${newEndTimeHour.toString().padStart(2, "0")}:${newEndTimeMinute.toString().padStart(2, "0")}`;
      
      addTaskForm.setValue("date", dateString);
      addTaskForm.setValue("startTime", selectedTimeSlot);
      addTaskForm.setValue("endTime", endTime);
    }
  }, [selectedDayForNewTask, selectedTimeSlot, addTaskForm]);

  const handlePrevWeek = () => {
    if (viewMode === "week") {
      setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const handleNextWeek = () => {
    if (viewMode === "week") {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === "week") {
      setViewMode("day");
    }
  };

  const handleTaskClick = (task: ScheduleTask) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleAddTask = (day: Date, timeSlot: string) => {
    setSelectedDayForNewTask(day);
    setSelectedTimeSlot(timeSlot);
    setIsAddTaskOpen(true);
  };

  const onAddTaskSubmit = (data: z.infer<typeof addTaskSchema>) => {
    // Find the selected project
    const selectedProject = availableProjects.find(project => project.id === data.projectId);
    
    if (!selectedProject) {
      console.error("Selected project not found");
      return;
    }
    
    // Create a new task
    const newTask: ScheduleTask = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      project: {
        id: selectedProject.id,
        name: selectedProject.name,
        color: selectedProject.color,
      },
      priority: data.priority,
      attendees: data.attendees ? data.attendees.split(',').map(a => a.trim()) : [],
    };
    
    // Add the new task to the tasks array
    setTasks([...tasks, newTask]);
    
    // Reset form and close dialog
    addTaskForm.reset();
    setIsAddTaskOpen(false);
    setSelectedTimeSlot(null);
    setSelectedDayForNewTask(null);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Get tasks for the current view (week or day)
  const getTasksForView = () => {
    if (viewMode === "day") {
      return tasks.filter(task => 
        task.date === format(selectedDate, "yyyy-MM-dd")
      );
    } else {
      const weekStart = currentWeekStart;
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      
      return tasks.filter(task => {
        const taskDate = parseISO(task.date);
        return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
      });
    }
  };

  // Calculate task position and height for day view
  const getTaskStyle = (task: ScheduleTask) => {
    const startHour = parseInt(task.startTime.split(":")[0]);
    const startMinute = parseInt(task.startTime.split(":")[1]);
    const endHour = parseInt(task.endTime.split(":")[0]);
    const endMinute = parseInt(task.endTime.split(":")[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const duration = endTime - startTime;
    
    // Calculate position from top (8:00 AM is the start)
    const startFromTop = startTime - (8 * 60);
    const topPosition = (startFromTop / 30) * 40; // Each 30-min slot is 40px high
    
    // Calculate height based on duration
    const height = (duration / 30) * 40;
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      backgroundColor: task.project.color,
    };
  };

  // Calculate task position and size for week view
  const getWeekTaskStyle = (task: ScheduleTask, dayIndex: number) => {
    const startHour = parseInt(task.startTime.split(":")[0]);
    const startMinute = parseInt(task.startTime.split(":")[1]);
    const endHour = parseInt(task.endTime.split(":")[0]);
    const endMinute = parseInt(task.endTime.split(":")[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const duration = endTime - startTime;
    
    // Calculate position from top (8:00 AM is the start)
    const startFromTop = startTime - (8 * 60);
    const topPosition = (startFromTop / 30) * 40; // Each 30-min slot is 40px high
    
    // Calculate height based on duration
    const height = (duration / 30) * 40;
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      backgroundColor: task.project.color,
    };
  };

  const WeekView = () => (
    <div className="grid grid-cols-8 gap-1 mt-4">
      {/* Time slots column */}
      <div className="pr-2">
        <div className="h-10"></div> {/* Empty cell for header alignment */}
        {timeSlots.map((timeSlot, index) => (
          <div 
            key={timeSlot} 
            className={`h-10 flex items-center justify-end pr-2 text-sm text-muted-foreground ${
              index % 2 === 0 ? 'font-medium' : 'text-xs'
            }`}
          >
            {index % 2 === 0 && timeSlot}
          </div>
        ))}
      </div>

      {/* Days columns */}
      {weekDays.map((day, dayIndex) => (
        <div key={dayIndex} className="relative">
          <div 
            className={`h-10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 rounded-md transition-colors ${
              isSameDay(day, selectedDate) ? 'bg-muted' : ''
            }`}
            onClick={() => handleDayClick(day)}
          >
            <div className="text-sm font-medium">{format(day, "EEE")}</div>
            <div className={`text-lg ${isSameDay(day, today) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center' : ''}`}>
              {format(day, "d")}
            </div>
          </div>

          <div className="relative">
            {/* Time slot grid */}
            {timeSlots.map((timeSlot, slotIndex) => (
              <div 
                key={`${dayIndex}-${slotIndex}`} 
                className={`h-10 border-t ${
                  slotIndex % 2 === 0 ? 'border-border' : 'border-border/30'
                } hover:bg-muted/30 cursor-pointer transition-colors`}
                onClick={() => handleAddTask(day, timeSlot)}
              ></div>
            ))}

            {/* Tasks */}
            {tasks
              .filter(task => task.date === format(day, "yyyy-MM-dd"))
              .map((task, taskIndex) => (
                <div
                  key={task.id}
                  className="absolute left-1 right-1 rounded-md p-1 overflow-hidden text-xs text-white shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                  style={getWeekTaskStyle(task, dayIndex)}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="truncate">{task.startTime} - {task.endTime}</div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const DayView = () => (
    <div className="grid grid-cols-1 gap-1 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
        <Badge variant={isSameDay(selectedDate, today) ? "default" : "outline"}>
          {isSameDay(selectedDate, today) ? "Today" : format(selectedDate, "EEEE")}
        </Badge>
      </div>

      <div className="grid grid-cols-[80px_1fr] gap-2">
        {/* Time slots */}
        <div className="space-y-[30px]">
          {timeSlots.map((timeSlot, index) => (
            <div 
              key={timeSlot} 
              className={`h-10 flex items-center justify-end pr-2 text-sm text-muted-foreground ${
                index % 2 === 0 ? 'font-medium' : 'text-xs'
              }`}
            >
              {index % 2 === 0 && timeSlot}
            </div>
          ))}
        </div>

        {/* Tasks container */}
        <div className="relative">
          {/* Time slot grid */}
          {timeSlots.map((timeSlot, slotIndex) => (
            <div 
              key={slotIndex} 
              className={`h-10 border-t ${
                slotIndex % 2 === 0 ? 'border-border' : 'border-border/30'
              } hover:bg-muted/30 cursor-pointer transition-colors`}
              onClick={() => handleAddTask(selectedDate, timeSlot)}
            ></div>
          ))}

          {/* Tasks */}
          {getTasksForView().map((task, taskIndex) => (
            <div
              key={task.id}
              className="absolute left-1 right-1 rounded-md p-2 overflow-hidden text-white shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              style={getTaskStyle(task)}
              onClick={() => handleTaskClick(task)}
            >
              <div className="font-medium">{task.title}</div>
              <div className="text-sm">{task.startTime} - {task.endTime}</div>
              {task.location && (
                <div className="text-xs flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {task.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="container py-6 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={viewMode === "day" ? "bg-muted" : ""}
              onClick={() => setViewMode("day")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={viewMode === "week" ? "bg-muted" : ""}
              onClick={() => setViewMode("week")}
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              Week
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => {
              setSelectedDate(today);
              setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
            }}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-lg font-medium">
            {viewMode === "week" ? (
              <>
                {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
              </>
            ) : (
              format(selectedDate, "MMMM d, yyyy")
            )}
          </div>
        </motion.div>

        <motion.div 
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4">
              {viewMode === "week" ? <WeekView /> : <DayView />}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Task Detail Sheet */}
        <Sheet open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Task Details</SheetTitle>
              <SheetDescription>
                View details about the selected task
              </SheetDescription>
            </SheetHeader>
            {selectedTask && (
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <div 
                    className="h-2 w-16 rounded-full mb-2"
                    style={{ backgroundColor: selectedTask.project.color }}
                  ></div>
                  <h3 className="text-xl font-semibold">{selectedTask.title}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`${priorityColors[selectedTask.priority]} border-none`}
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground">
                        {format(parseISO(selectedTask.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedTask.startTime} - {selectedTask.endTime}
                      </p>
                    </div>
                  </div>

                  {selectedTask.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{selectedTask.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Project</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: selectedTask.project.color }}
                        ></div>
                        <p className="text-muted-foreground">{selectedTask.project.name}</p>
                      </div>
                    </div>
                  </div>

                  {selectedTask.attendees && selectedTask.attendees.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <div className="space-y-1 mt-1">
                          {selectedTask.attendees.map((attendee, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">
                        {(() => {
                          const startHour = parseInt(selectedTask.startTime.split(":")[0]);
                          const startMinute = parseInt(selectedTask.startTime.split(":")[1]);
                          const endHour = parseInt(selectedTask.endTime.split(":")[0]);
                          const endMinute = parseInt(selectedTask.endTime.split(":")[1]);
                          
                          const startTime = startHour * 60 + startMinute;
                          const endTime = endHour * 60 + endMinute;
                          const durationMinutes = endTime - startTime;
                          
                          const hours = Math.floor(durationMinutes / 60);
                          const minutes = durationMinutes % 60;
                          
                          return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}${hours > 0 && minutes > 0 ? ' ' : ''}${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTask.description}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
                    Close
                  </Button>
                  <Button>
                    Edit Task
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task or event in your schedule
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addTaskForm}>
              <form onSubmit={addTaskForm.handleSubmit(onAddTaskSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={addTaskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addTaskForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={addTaskForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addTaskForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addTaskForm.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableProjects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  <span>{project.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTaskForm.control}
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
                    control={addTaskForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Meeting location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTaskForm.control}
                    name="attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attendees</FormLabel>
                        <FormControl>
                          <Input placeholder="Comma-separated list of attendees" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate multiple attendees with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={addTaskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Task description" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Task</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}