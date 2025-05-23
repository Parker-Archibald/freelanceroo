"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  Upload, 
  Camera, 
  Pencil,
  Save,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }),
  phone: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  github: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  twitter: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  projectUpdates: z.boolean().default(true),
  teamMessages: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

interface Skill {
  id: string
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
}

interface Experience {
  id: string
  company: string
  position: string
  startDate: Date
  endDate: Date | null
  description: string
  current: boolean
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profileImage, setProfileImage] = useState<string>("https://source.unsplash.com/random/200x200/?portrait")
  const [isEditingImage, setIsEditingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "React", level: "expert" },
    { id: "2", name: "TypeScript", level: "advanced" },
    { id: "3", name: "Node.js", level: "intermediate" },
    { id: "4", name: "UI/UX Design", level: "beginner" },
    { id: "5", name: "Next.js", level: "advanced" },
  ])

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "Tech Innovations Inc.",
      position: "Senior Frontend Developer",
      startDate: new Date(2022, 0, 1),
      endDate: null,
      description: "Leading the frontend development team, implementing new features, and improving performance.",
      current: true,
    },
    {
      id: "2",
      company: "Digital Solutions Ltd.",
      position: "Frontend Developer",
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2021, 11, 31),
      description: "Developed responsive web applications using React and TypeScript.",
      current: false,
    },
    {
      id: "3",
      company: "Creative Web Agency",
      position: "Junior Developer",
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2019, 11, 31),
      description: "Assisted in the development of client websites and web applications.",
      current: false,
    },
  ])

  const defaultValues: Partial<ProfileFormValues> = {
    name: "Parker Archibald",
    email: "parker.archibald@example.com",
    bio: "Senior Frontend Developer with 5+ years of experience in building responsive and performant web applications. Passionate about creating intuitive user interfaces and delivering exceptional user experiences.",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    jobTitle: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    website: "https://parkerarchibald.com",
    github: "https://github.com/parkerarchibald",
    linkedin: "https://linkedin.com/in/parkerarchibald",
    twitter: "https://twitter.com/parkerarchibald",
  }

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      projectUpdates: true,
      teamMessages: true,
      taskReminders: true,
      marketingEmails: false,
    },
    mode: "onChange",
  })

  function onProfileSubmit(data: ProfileFormValues) {
    console.log(data)
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    console.log(data)
  }

  function onNotificationSubmit(data: NotificationFormValues) {
    console.log(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
    setIsEditingImage(false)
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
          Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div 
            className="md:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <motion.div 
                  className="relative mb-4"
                  whileHover={{ scale: 1.05 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profileImage} alt="Profile" />
                    <AvatarFallback>
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => setIsEditingImage(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.h2 
                  className="text-xl font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  Parker Archibald
                </motion.h2>
                <motion.p 
                  className="text-sm text-muted-foreground mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  Senior Frontend Developer
                </motion.p>
                <Separator className="my-4" />
                <motion.div 
                  className="w-full space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Tech Innovations Inc.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Joined {format(new Date(2020, 0, 1), "MMMM yyyy")}</span>
                  </div>
                </motion.div>
                <Separator className="my-4" />
                <motion.div 
                  className="w-full space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <h3 className="text-sm font-medium">Skills</h3>
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    variants={container}
                    initial="hidden"
                    animate="visible"
                  >
                    {skills.map((skill) => (
                      <motion.div key={skill.id} variants={item}>
                        <Badge variant="outline" className="capitalize">
                          {skill.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
                <Separator className="my-4" />
                <motion.div 
                  className="w-full space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <h3 className="text-sm font-medium">Connect</h3>
                  <div className="flex justify-between">
                    <Button variant="outline" size="icon">
                      <Globe className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="md:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information and how others see you on the platform.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                          <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item} className="md:col-span-2">
                              <FormField
                                control={profileForm.control}
                                name="bio"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Tell us about yourself"
                                        className="min-h-[120px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          </motion.div>

                          <Separator />

                          <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="jobTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your job title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="company"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your company" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          </motion.div>

                          <Separator />

                          <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="website"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your website URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="github"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>GitHub</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your GitHub URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="linkedin"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>LinkedIn</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your LinkedIn URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={profileForm.control}
                                name="twitter"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Twitter</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your Twitter URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                          >
                            <Button type="submit">
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Experience</CardTitle>
                      <CardDescription>
                        Your work experience and employment history.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <motion.div 
                          className="space-y-6"
                          variants={container}
                          initial="hidden"
                          animate="visible"
                        >
                          {experiences.map((experience) => (
                            <motion.div 
                              key={experience.id} 
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              variants={item}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{experience.position}</h3>
                                  <p className="text-sm text-muted-foreground">{experience.company}</p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(experience.startDate, "MMM yyyy")} - {experience.current ? "Present" : format(experience.endDate as Date, "MMM yyyy")}
                                </div>
                              </div>
                              <p className="mt-2 text-sm">{experience.description}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="security">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and security preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-8">
                          <motion.div 
                            className="space-y-6"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div variants={item}>
                              <FormField
                                control={securityForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Enter your current password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={securityForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Enter your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={securityForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                          >
                            <Button type="submit">Update Password</Button>
                          </motion.div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications and updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...notificationForm}>
                        <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-8">
                          <motion.div 
                            className="space-y-6"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="emailNotifications"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Email Notifications</FormLabel>
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
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="pushNotifications"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Push Notifications</FormLabel>
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
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="projectUpdates"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Project Updates</FormLabel>
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
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="teamMessages"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Team Messages</FormLabel>
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
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="taskReminders"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Task Reminders</FormLabel>
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
                            </motion.div>
                            <motion.div variants={item}>
                              <FormField
                                control={notificationForm.control}
                                name="marketingEmails"
                                render={({ field }) => (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Marketing Emails</FormLabel>
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
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                            >
                              <Button type="submit">Save Preferences</Button>
                            </motion.div>
                          </motion.div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Hidden file input for profile image */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Image upload dialog */}
      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}