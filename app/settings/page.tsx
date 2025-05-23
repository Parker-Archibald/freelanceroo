"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Bell, 
  Moon, 
  Sun, 
  Laptop, 
  Globe, 
  Lock, 
  Mail, 
  Save,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  fontSize: z.enum(["sm", "md", "lg", "xl"], {
    required_error: "Please select a font size.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
})

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  projectUpdates: z.boolean().default(true),
  teamMessages: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
})

const timerFormSchema = z.object({
  autoStartTimer: z.boolean().default(false),
  autoStopTimer: z.boolean().default(false),
  reminderInterval: z.enum(["none", "15min", "30min", "60min"]),
  defaultProject: z.string().optional(),
  roundTimeTo: z.enum(["exact", "5min", "15min", "30min"]),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>
type TimerFormValues = z.infer<typeof timerFormSchema>

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance")

  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      fontSize: "md",
      language: "en",
    },
  })

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      projectUpdates: true,
      teamMessages: true,
      taskReminders: true,
      marketingEmails: false,
    },
  })

  const timerForm = useForm<TimerFormValues>({
    resolver: zodResolver(timerFormSchema),
    defaultValues: {
      autoStartTimer: false,
      autoStopTimer: false,
      reminderInterval: "none",
      defaultProject: "",
      roundTimeTo: "exact",
    },
  })

  function onAppearanceSubmit(data: AppearanceFormValues) {
    console.log(data)
  }

  function onNotificationsSubmit(data: NotificationsFormValues) {
    console.log(data)
  }

  function onTimerSubmit(data: TimerFormValues) {
    console.log(data)
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

  return (
    <PageTransition>
      <div className="container py-10 md:px-8 max-w-7xl mx-auto">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Settings
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs 
            defaultValue="appearance" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="timer">Timer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the appearance of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-8">
                      <motion.div 
                        className="space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div variants={item}>
                          <FormField
                            control={appearanceForm.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel>Theme</FormLabel>
                                <FormDescription>
                                  Select the theme for the dashboard.
                                </FormDescription>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-3 gap-4"
                                  >
                                    <FormItem>
                                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                          <RadioGroupItem value="light" className="sr-only" />
                                        </FormControl>
                                        <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent flex flex-col gap-2">
                                          <Sun className="h-5 w-5" />
                                          <span className="text-center text-sm font-medium">Light</span>
                                        </div>
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                          <RadioGroupItem value="dark" className="sr-only" />
                                        </FormControl>
                                        <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent flex flex-col gap-2">
                                          <Moon className="h-5 w-5" />
                                          <span className="text-center text-sm font-medium">Dark</span>
                                        </div>
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                      <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                          <RadioGroupItem value="system" className="sr-only" />
                                        </FormControl>
                                        <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent flex flex-col gap-2">
                                          <Laptop className="h-5 w-5" />
                                          <span className="text-center text-sm font-medium">System</span>
                                        </div>
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <Separator />
                        
                        <motion.div variants={item}>
                          <FormField
                            control={appearanceForm.control}
                            name="fontSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Font Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a font size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sm">Small</SelectItem>
                                    <SelectItem value="md">Medium</SelectItem>
                                    <SelectItem value="lg">Large</SelectItem>
                                    <SelectItem value="xl">Extra Large</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Set the font size for the application.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div variants={item}>
                          <FormField
                            control={appearanceForm.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="pt">Portuguese</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose the language for the user interface.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>
                      
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationsForm}>
                    <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-8">
                      <motion.div 
                        className="space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div variants={item}>
                          <FormField
                            control={notificationsForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-base">Email Notifications</FormLabel>
                                  </div>
                                  <FormDescription>
                                    Receive notifications via email.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                        </motion.div>
                        
                        <Separator />
                        
                        <motion.div variants={item}>
                          <FormField
                            control={notificationsForm.control}
                            name="pushNotifications"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-base">Push Notifications</FormLabel>
                                  </div>
                                  <FormDescription>
                                    Receive push notifications on your devices.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                        </motion.div>
                        
                        <Separator />
                        
                        <motion.div variants={item}>
                          <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                          <div className="space-y-4">
                            <FormField
                              control={notificationsForm.control}
                              name="projectUpdates"
                              render={({ field }) => (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <FormLabel>Project Updates</FormLabel>
                                    <FormDescription>
                                      Get notified about updates to your projects.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                </div>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="teamMessages"
                              render={({ field }) => (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <FormLabel>Team Messages</FormLabel>
                                    <FormDescription>
                                      Get notified about new team messages.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                </div>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="taskReminders"
                              render={({ field }) => (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <FormLabel>Task Reminders</FormLabel>
                                    <FormDescription>
                                      Receive reminders about upcoming and overdue tasks.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                </div>
                              )}
                            />
                            
                            <FormField
                              control={notificationsForm.control}
                              name="marketingEmails"
                              render={({ field }) => (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <FormLabel>Marketing Emails</FormLabel>
                                    <FormDescription>
                                      Receive emails about new features, tips, and promotions.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                </div>
                              )}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                      
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timer" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timer Settings</CardTitle>
                  <CardDescription>
                    Configure how the time tracking feature works.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...timerForm}>
                    <form onSubmit={timerForm.handleSubmit(onTimerSubmit)} className="space-y-8">
                      <motion.div 
                        className="space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div variants={item}>
                          <FormField
                            control={timerForm.control}
                            name="autoStartTimer"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-base">Auto-start Timer</FormLabel>
                                  </div>
                                  <FormDescription>
                                    Automatically start timer when you open a project.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                        </motion.div >
                        <Separator />
                        
                        <motion.div variants={item}>
                          <FormField
                            control={timerForm.control}
                            name="autoStopTimer"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-base">Auto-stop Timer</FormLabel>
                                  </div>
                                  <FormDescription>
                                    Automatically stop timer after period of inactivity.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                        </motion.div>
                        
                        <Separator />
                        
                        <motion.div variants={item}>
                          <FormField
                            control={timerForm.control}
                            name="reminderInterval"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Timer Reminders</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select reminder interval" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No reminders</SelectItem>
                                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                                    <SelectItem value="30min">Every 30 minutes</SelectItem>
                                    <SelectItem value="60min">Every hour</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Get reminded to add notes to your timer.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div variants={item}>
                          <FormField
                            control={timerForm.control}
                            name="defaultProject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Project</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select default project" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">No default project</SelectItem>
                                    <SelectItem value="website">Website Redesign</SelectItem>
                                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                                    <SelectItem value="marketing">Marketing Campaign</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Set a default project for new timers.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div variants={item}>
                          <FormField
                            control={timerForm.control}
                            name="roundTimeTo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Round Time Entries</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rounding option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="exact">Exact time (no rounding)</SelectItem>
                                    <SelectItem value="5min">Nearest 5 minutes</SelectItem>
                                    <SelectItem value="15min">Nearest 15 minutes</SelectItem>
                                    <SelectItem value="30min">Nearest 30 minutes</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Round time entries to the nearest interval.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>
                      
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
}