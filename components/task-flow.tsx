"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  Filter,
  Circle,
  Sparkles,
  Moon,
  Sun,
  CalendarIcon,
  Clock,
  Search,
  BarChart3,
  Timer,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Award,
  Home,
  BookOpen,
  Code,
  Dumbbell,
  Coffee,
  ShoppingCart,
  Briefcase,
  Heart,
  Phone,
  Mail,
  Zap,
  X,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useMobile } from "@/hooks/use-mobile"

interface Subtask {
  id: number
  text: string
  completed: boolean
}

interface Task {
  id: number
  text: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: string
  createdAt: Date
  dueDate?: Date
  subtasks: Subtask[]
  timeSpent: number
  estimatedTime?: number
  tags: string[]
  isExpanded?: boolean
}

interface PomodoroSession {
  taskId: number
  duration: number
  completedAt: Date
}

interface TaskSuggestion {
  text: string
  category: string
  priority: "low" | "medium" | "high"
  estimatedTime?: number
  icon: React.ReactNode
  tags?: string[]
}

const defaultCategories = ["Personal", "Work", "Shopping", "Health", "Learning", "Finance", "Travel"]
const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300",
}

// Quick task suggestions
const taskSuggestions: TaskSuggestion[] = [
  {
    text: "Study at 8PM",
    category: "Learning",
    priority: "high",
    estimatedTime: 60,
    icon: <BookOpen className="h-4 w-4" />,
    tags: ["study", "evening"],
  },
  {
    text: "Upload to GitHub",
    category: "Work",
    priority: "medium",
    estimatedTime: 15,
    icon: <Code className="h-4 w-4" />,
    tags: ["coding", "github"],
  },
  {
    text: "Solve LeetCode",
    category: "Learning",
    priority: "medium",
    estimatedTime: 45,
    icon: <Code className="h-4 w-4" />,
    tags: ["coding", "practice"],
  },
  {
    text: "Take Medicine",
    category: "Health",
    priority: "high",
    estimatedTime: 5,
    icon: <Heart className="h-4 w-4" />,
    tags: ["health", "daily"],
  },
  {
    text: "Morning Workout",
    category: "Health",
    priority: "medium",
    estimatedTime: 30,
    icon: <Dumbbell className="h-4 w-4" />,
    tags: ["fitness", "morning"],
  },
  {
    text: "Buy Groceries",
    category: "Shopping",
    priority: "medium",
    estimatedTime: 45,
    icon: <ShoppingCart className="h-4 w-4" />,
    tags: ["shopping", "food"],
  },
  {
    text: "Team Meeting",
    category: "Work",
    priority: "high",
    estimatedTime: 60,
    icon: <Briefcase className="h-4 w-4" />,
    tags: ["meeting", "work"],
  },
  {
    text: "Call Mom",
    category: "Personal",
    priority: "medium",
    estimatedTime: 20,
    icon: <Phone className="h-4 w-4" />,
    tags: ["family", "call"],
  },
  {
    text: "Check Emails",
    category: "Work",
    priority: "low",
    estimatedTime: 15,
    icon: <Mail className="h-4 w-4" />,
    tags: ["email", "work"],
  },
  {
    text: "Drink Water",
    category: "Health",
    priority: "low",
    estimatedTime: 1,
    icon: <Coffee className="h-4 w-4" />,
    tags: ["health", "hydration"],
  },
  {
    text: "Review Code",
    category: "Work",
    priority: "medium",
    estimatedTime: 30,
    icon: <Code className="h-4 w-4" />,
    tags: ["coding", "review"],
  },
  {
    text: "Plan Tomorrow",
    category: "Personal",
    priority: "low",
    estimatedTime: 10,
    icon: <CalendarIcon className="h-4 w-4" />,
    tags: ["planning", "evening"],
  },
]

export default function TaskFlow() {
  const isMobile = useMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium")
  const [selectedCategory, setSelectedCategory] = useState("Personal")
  const [customCategories, setCustomCategories] = useState<string[]>(defaultCategories)
  const [selectedDueDate, setSelectedDueDate] = useState<Date>()
  const [estimatedTime, setEstimatedTime] = useState<number>()
  const [newTags, setNewTags] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "overdue">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")
  const [focusMode, setFocusMode] = useState(false)
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Pomodoro Timer State
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  // Touch/Swipe handling (mobile only)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskflow-tasks")
    const savedCategories = localStorage.getItem("taskflow-categories")
    const savedDarkMode = localStorage.getItem("taskflow-darkmode")
    const savedSessions = localStorage.getItem("taskflow-sessions")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))
      setTasks(parsedTasks)
    }

    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories))
    }

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }

    if (savedSessions) {
      setPomodoroSessions(
        JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          completedAt: new Date(session.completedAt),
        })),
      )
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("taskflow-categories", JSON.stringify(customCategories))
  }, [customCategories])

  useEffect(() => {
    localStorage.setItem("taskflow-darkmode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("taskflow-sessions", JSON.stringify(pomodoroSessions))
  }, [pomodoroSessions])

  // Pomodoro Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1)
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1)
          setTimerSeconds(59)
        } else {
          setIsTimerRunning(false)
          if (activeTaskId) {
            const newSession: PomodoroSession = {
              taskId: activeTaskId,
              duration: 25,
              completedAt: new Date(),
            }
            setPomodoroSessions((prev) => [...prev, newSession])
            setTasks((prev) =>
              prev.map((task) => (task.id === activeTaskId ? { ...task, timeSpent: task.timeSpent + 25 } : task)),
            )
          }
          setTimerMinutes(25)
          setTimerSeconds(0)
          setActiveTaskId(null)

          if (Notification.permission === "granted") {
            new Notification("Pomodoro Complete!", {
              body: "Great job! Time for a break.",
              icon: "/favicon.ico",
            })
          }
        }
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, timerMinutes, timerSeconds, activeTaskId])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "n":
              e.preventDefault()
              setIsAddTaskOpen(true)
              break
            case "f":
              e.preventDefault()
              document.getElementById("search-input")?.focus()
              break
            case "1":
              e.preventDefault()
              setActiveTab("tasks")
              break
            case "2":
              e.preventDefault()
              setActiveTab("analytics")
              break
            case "3":
              e.preventDefault()
              setActiveTab("settings")
              break
          }
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMobile])

  const addTask = (taskData?: Partial<Task>) => {
    const taskText = taskData?.text || newTask.trim()
    if (taskText !== "") {
      const task: Task = {
        id: Date.now(),
        text: taskText,
        description: taskData?.description || newTaskDescription.trim() || undefined,
        completed: false,
        priority: taskData?.priority || selectedPriority,
        category: taskData?.category || selectedCategory,
        createdAt: new Date(),
        dueDate: taskData?.dueDate || selectedDueDate,
        subtasks: [],
        timeSpent: 0,
        estimatedTime: taskData?.estimatedTime || estimatedTime,
        tags:
          taskData?.tags ||
          newTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        isExpanded: false,
      }
      setTasks([task, ...tasks])

      // Only clear form if it's manual entry
      if (!taskData) {
        setNewTask("")
        setNewTaskDescription("")
        setSelectedDueDate(undefined)
        setEstimatedTime(undefined)
        setNewTags("")
        setIsAddTaskOpen(false)
      }
    }
  }

  const addSuggestedTask = (suggestion: TaskSuggestion) => {
    const task: Task = {
      id: Date.now(),
      text: suggestion.text,
      description: undefined,
      completed: false,
      priority: suggestion.priority,
      category: suggestion.category,
      createdAt: new Date(),
      dueDate: undefined,
      subtasks: [],
      timeSpent: 0,
      estimatedTime: suggestion.estimatedTime,
      tags: suggestion.tags || [],
      isExpanded: false,
    }
    setTasks([task, ...tasks])

    // Show a brief success feedback
    const button = document.querySelector(`[data-suggestion="${suggestion.text}"]`)
    if (button) {
      button.classList.add("animate-pulse")
      setTimeout(() => {
        button.classList.remove("animate-pulse")
      }, 500)
    }
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed }
          if (updatedTask.completed) {
            updatedTask.subtasks = updatedTask.subtasks.map((subtask) => ({ ...subtask, completed: true }))
          }
          return updatedTask
        }
        return task
      }),
    )
  }

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleTaskExpansion = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task)))
  }

  const startPomodoro = (taskId: number) => {
    setActiveTaskId(taskId)
    setTimerMinutes(25)
    setTimerSeconds(0)
    setIsTimerRunning(true)
  }

  const pausePomodoro = () => {
    setIsTimerRunning(false)
  }

  const resetPomodoro = () => {
    setIsTimerRunning(false)
    setTimerMinutes(25)
    setTimerSeconds(0)
    setActiveTaskId(null)
  }

  // Touch handlers for swipe gestures (mobile only)
  const handleTouchStart = (e: React.TouchEvent, taskId: number) => {
    if (!isMobile) return
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchEnd = (taskId: number) => {
    if (!isMobile || !touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    if (!isVerticalSwipe) {
      if (isRightSwipe) {
        // Swipe right to complete
        toggleTaskCompletion(taskId)
      } else if (isLeftSwipe) {
        // Swipe left to delete
        removeTask(taskId)
      }
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    if (filter === "overdue") return task.dueDate && task.dueDate < new Date() && !task.completed
    return true
  })

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length
  const overdueCount = tasks.filter((task) => task.dueDate && task.dueDate < new Date() && !task.completed).length
  const totalTimeSpent = tasks.reduce((sum, task) => sum + task.timeSpent, 0)
  const completedToday = tasks.filter(
    (task) => task.completed && task.createdAt.toDateString() === new Date().toDateString(),
  ).length

  const getTaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return task.completed ? 100 : 0
    const completedSubtasks = task.subtasks.filter((st) => st.completed).length
    return Math.round((completedSubtasks / task.subtasks.length) * 100)
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && task.dueDate < new Date() && !task.completed
  }

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div
      className={`w-64 border-r flex flex-col ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created by <strong className="text-purple-500">Abhinav</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={activeTab === "tasks" ? "default" : "ghost"}
          onClick={() => setActiveTab("tasks")}
          className={`w-full justify-start gap-3 h-12 ${
            activeTab === "tasks"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Home className="h-5 w-5" />
          Tasks
          {totalCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveTab("analytics")}
          className={`w-full justify-start gap-3 h-12 ${
            activeTab === "analytics"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Analytics
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          onClick={() => setActiveTab("settings")}
          className={`w-full justify-start gap-3 h-12 ${
            activeTab === "settings"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Completed Today</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">{completedToday}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Progress</span>
            <span className="font-medium">{Math.round((completedCount / totalCount) * 100) || 0}%</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Overdue</span>
              <span className="font-medium text-red-600 dark:text-red-400">{overdueCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFocusMode(!focusMode)}
            className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
            title="Focus Mode"
          >
            <Target className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
            title="Quick Suggestions"
          >
            <Zap className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )

  // Add Task Form Component
  const AddTaskForm = () => (
    <div className="space-y-4">
      <Input
        placeholder="What needs to be done?"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        className={`h-12 text-base ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            addTask()
          }
        }}
      />

      <Textarea
        placeholder="Description (optional)"
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
        className={`min-h-[80px] text-base ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className={`h-12 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}>
            {customCategories.map((category) => (
              <SelectItem key={category} value={category} className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedPriority}
          onValueChange={(value: "low" | "medium" | "high") => setSelectedPriority(value)}
        >
          <SelectTrigger
            className={`h-12 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}>
            <SelectItem value="low" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
              🟢 Low Priority
            </SelectItem>
            <SelectItem value="medium" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
              🟡 Medium Priority
            </SelectItem>
            <SelectItem value="high" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
              🔴 High Priority
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-12 justify-start text-left font-normal ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDueDate ? format(selectedDueDate, "PPP") : "Set due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={selectedDueDate} onSelect={setSelectedDueDate} initialFocus />
          </PopoverContent>
        </Popover>

        <Input
          type="number"
          placeholder="Estimated time (minutes)"
          value={estimatedTime || ""}
          onChange={(e) => setEstimatedTime(Number(e.target.value) || undefined)}
          className={`h-12 text-base ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300"}`}
        />
      </div>

      <Input
        placeholder="Tags (comma separated)"
        value={newTags}
        onChange={(e) => setNewTags(e.target.value)}
        className={`h-12 text-base ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300"}`}
      />

      <Button onClick={() => addTask()} className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700">
        <Plus className="h-5 w-5 mr-2" />
        Add Task
      </Button>
    </div>
  )

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 text-gray-900"
      } ${isMobile ? "flex flex-col" : "flex"}`}
    >
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Mobile Header */}
      {isMobile && (
        <div
          className={`flex-shrink-0 px-4 py-3 border-b ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white/80"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
              >
                <Zap className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
              >
                <Target className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Credit */}
          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} text-center mt-1`}>
            Created by <strong className="text-purple-500">Abhinav</strong>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${isMobile ? "flex flex-col" : ""} overflow-hidden`}>
        {/* Desktop Header */}
        {!isMobile && (
          <div
            className={`border-b px-6 py-4 ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white/80"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === "tasks" && `${completedCount} of ${totalCount} tasks completed`}
                  {activeTab === "analytics" && "Track your productivity"}
                  {activeTab === "settings" && "Customize your experience"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+N</kbd> New Task •{" "}
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+F</kbd> Search
                  </div>
                )}
                {activeTab === "tasks" && (
                  <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={`max-w-2xl ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}>
                      <DialogHeader>
                        <DialogTitle className={darkMode ? "text-gray-100" : "text-gray-900"}>Add New Task</DialogTitle>
                      </DialogHeader>
                      <AddTaskForm />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Task Suggestions */}
        {showSuggestions && activeTab === "tasks" && (
          <div
            className={`${isMobile ? "flex-shrink-0" : ""} px-4 lg:px-6 py-3 border-b ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white/80"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Quick Add</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className={`p-1 h-6 w-6 ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${!isMobile ? "flex-wrap" : ""}`}>
              {taskSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  data-suggestion={suggestion.text}
                  onClick={() => addSuggestedTask(suggestion)}
                  className={`${isMobile ? "flex-shrink-0" : ""} flex items-center gap-2 h-10 px-3 text-xs whitespace-nowrap transition-all hover:scale-105 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-purple-500"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-400"
                  }`}
                >
                  {suggestion.icon}
                  <span>{suggestion.text}</span>
                  {suggestion.estimatedTime && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                      {suggestion.estimatedTime}m
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        {activeTaskId && (
          <div
            className={`px-4 lg:px-6 py-3 border-b ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-xl font-mono ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                  {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                </div>
                <div className={`text-sm truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {tasks.find((t) => t.id === activeTaskId)?.text}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isTimerRunning ? pausePomodoro : () => setIsTimerRunning(true)}
                  className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPomodoro}
                  className={`p-2 ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100"}`}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 overflow-hidden ${isMobile ? "flex flex-col" : ""}`}>
          {activeTab === "tasks" && (
            <div className={`h-full ${isMobile ? "flex flex-col" : ""}`}>
              {/* Search and Filter Bar */}
              <div
                className={`${isMobile ? "flex-shrink-0" : ""} px-4 lg:px-6 py-3 border-b ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white/80"}`}
              >
                <div className={`flex gap-2 ${!isMobile ? "max-w-2xl" : ""}`}>
                  <div className="relative flex-1">
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <Input
                      id="search-input"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 h-12 text-base ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300"}`}
                    />
                  </div>
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger
                      className={`${isMobile ? "w-24" : "w-32"} h-12 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300"}`}
                    >
                      <Filter className="h-4 w-4" />
                      {!isMobile && <span className="ml-2">{filter}</span>}
                    </SelectTrigger>
                    <SelectContent className={darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}>
                      <SelectItem value="all" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
                        All Tasks
                      </SelectItem>
                      <SelectItem value="active" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
                        Active
                      </SelectItem>
                      <SelectItem value="completed" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
                        Completed
                      </SelectItem>
                      <SelectItem value="overdue" className={darkMode ? "text-gray-100 hover:bg-gray-700" : ""}>
                        Overdue
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress Bar */}
              {totalCount > 0 && (
                <div
                  className={`${isMobile ? "flex-shrink-0" : ""} px-4 lg:px-6 py-2 border-b ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white/80"}`}
                >
                  <div
                    className={`flex items-center gap-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} ${!isMobile ? "max-w-2xl" : ""}`}
                  >
                    <span className="text-xs">
                      {completedCount}/{totalCount}
                    </span>
                    <div className={`flex-1 rounded-full h-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs">{Math.round((completedCount / totalCount) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className={`flex-1 overflow-y-auto px-4 lg:px-6 py-2 ${isMobile ? "" : "pb-6"}`}>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Circle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm">
                      {filter === "all" ? "Add your first task to get started!" : `No ${filter} tasks at the moment.`}
                    </p>
                  </div>
                ) : (
                  <div className={`space-y-3 ${isMobile ? "pb-20" : ""} ${!isMobile ? "max-w-4xl" : ""}`}>
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 lg:p-6 rounded-xl border transition-all duration-200 ${
                          task.completed
                            ? `${darkMode ? "bg-gray-800 border-gray-600 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`
                            : `${darkMode ? "bg-gray-800 border-gray-600 text-gray-100 hover:border-purple-500" : "bg-white border-gray-200 text-gray-900 hover:border-purple-300 hover:shadow-md"} ${isMobile ? "active:scale-95" : "hover:scale-[1.02]"}`
                        } ${isOverdue(task) ? (darkMode ? "border-red-500 bg-red-900/20" : "border-red-300 bg-red-50") : ""}`}
                        onTouchStart={isMobile ? (e) => handleTouchStart(e, task.id) : undefined}
                        onTouchMove={isMobile ? handleTouchMove : undefined}
                        onTouchEnd={isMobile ? () => handleTouchEnd(task.id) : undefined}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1 h-6 w-6 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />

                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`block cursor-pointer font-medium ${!isMobile ? "text-lg" : "text-base"} leading-6 ${
                                task.completed
                                  ? darkMode
                                    ? "text-gray-500 line-through"
                                    : "text-gray-500 line-through"
                                  : darkMode
                                    ? "text-gray-100"
                                    : "text-gray-900"
                              }`}
                            >
                              {task.text}
                            </label>

                            {task.description && (
                              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    isOverdue(task)
                                      ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300"
                                      : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                  }`}
                                >
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {format(task.dueDate, "MMM dd")}
                                </Badge>
                              )}
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {task.subtasks.length > 0 && (
                              <div className="mt-3">
                                <Progress value={getTaskProgress(task)} className="h-2" />
                                <span className="text-xs text-gray-500 mt-1">
                                  {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>{task.createdAt.toLocaleDateString()}</span>
                                {task.timeSpent > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.timeSpent}m
                                  </span>
                                )}
                                {task.estimatedTime && (
                                  <span className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />~{task.estimatedTime}m
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!task.completed && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startPomodoro(task.id)}
                                    className="text-green-600 hover:text-green-700 p-2"
                                    disabled={activeTaskId === task.id}
                                    title="Start Pomodoro"
                                  >
                                    <Timer className="h-4 w-4" />
                                  </Button>
                                )}
                                {!isMobile && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="p-2">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => toggleTaskExpansion(task.id)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => removeTask(task.id)} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Swipe Hint - Mobile Only */}
                        {isMobile && (
                          <div className="text-xs text-gray-400 text-center mt-2 opacity-50">
                            ← Swipe left to delete • Swipe right to complete →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className={`h-full overflow-y-auto p-4 lg:p-6 ${isMobile ? "pb-20" : ""}`}>
              <div className={`space-y-6 ${!isMobile ? "max-w-4xl" : ""}`}>
                <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5" />
                      Productivity Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}>
                      <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/50 rounded-lg border dark:border-purple-800">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedToday}</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Today</div>
                      </div>
                      <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(totalTimeSpent / 60)}h</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Time Spent</div>
                      </div>
                      <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{pomodoroSessions.length}</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Pomodoros</div>
                      </div>
                      <div className="text-center p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round((completedCount / totalCount) * 100) || 0}%
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">Complete</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}>
                      <div
                        className={`p-4 rounded-lg text-center ${
                          completedCount >= 10 ? "bg-yellow-100 dark:bg-yellow-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="font-medium text-sm">Task Master</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">10 tasks</div>
                      </div>
                      <div
                        className={`p-4 rounded-lg text-center ${
                          pomodoroSessions.length >= 5 ? "bg-red-100 dark:bg-red-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <div className="text-3xl mb-2">🍅</div>
                        <div className="font-medium text-sm">Pomodoro Pro</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">5 sessions</div>
                      </div>
                      <div
                        className={`p-4 rounded-lg text-center ${
                          completedToday >= 5 ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="font-medium text-sm">Daily Streak</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">5 today</div>
                      </div>
                      <div
                        className={`p-4 rounded-lg text-center ${
                          totalTimeSpent >= 300 ? "bg-purple-100 dark:bg-purple-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <div className="text-3xl mb-2">⏰</div>
                        <div className="font-medium text-sm">Time Master</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">5+ hours</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className={`h-full overflow-y-auto p-4 lg:p-6 ${isMobile ? "pb-20" : ""}`}>
              <div className={`space-y-6 ${!isMobile ? "max-w-2xl" : ""}`}>
                <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Toggle theme</div>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Focus Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Single task view</div>
                      </div>
                      <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Quick Suggestions</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Show task suggestions</div>
                      </div>
                      <Switch checked={showSuggestions} onCheckedChange={setShowSuggestions} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const data = { tasks, categories: customCategories, sessions: pomodoroSessions }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "taskflow-backup.json"
                        a.click()
                      }}
                      className="w-full h-12 text-base"
                    >
                      Export Data
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Clear all data? This cannot be undone.")) {
                          setTasks([])
                          setPomodoroSessions([])
                          localStorage.clear()
                        }
                      }}
                      className="w-full h-12 text-base"
                    >
                      Clear All Data
                    </Button>
                  </CardContent>
                </Card>

                {!isMobile && (
                  <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>New Task</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+N</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Search</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+F</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Switch to Tasks</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+1</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Switch to Analytics</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+2</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Switch to Settings</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+3</kbd>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Add Task Sheet */}
      {isMobile && (
        <Sheet open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-10"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className={`h-[80vh] rounded-t-xl ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
          >
            <SheetHeader>
              <SheetTitle className={`text-left ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                Add New Task
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-full pb-20">
              <AddTaskForm />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div
          className={`fixed bottom-0 left-0 right-0 border-t px-4 py-2 z-20 ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
        >
          <div className="flex justify-around">
            <Button
              variant={activeTab === "tasks" ? "default" : "ghost"}
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 flex flex-col items-center gap-1 h-12 ${
                activeTab === "tasks"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Tasks</span>
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 flex flex-col items-center gap-1 h-12 ${
                activeTab === "analytics"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              onClick={() => setActiveTab("settings")}
              className={`flex-1 flex flex-col items-center gap-1 h-12 ${
                activeTab === "settings"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
