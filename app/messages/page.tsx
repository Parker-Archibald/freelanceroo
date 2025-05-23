"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Search, Plus, MoreVertical, Send, Paperclip, Phone, Video, Info, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: Date
  unread: number
  online: boolean
  isGroup?: boolean
  members?: string[]
  lastSeen?: Date
}

interface Message {
  id: string
  content: string
  timestamp: Date
  sender: "user" | "contact"
  read: boolean
  attachments?: {
    name: string
    url: string
    type: string
    size: number
  }[]
}

const initialConversations: Conversation[] = [
  {
    id: "john-doe",
    name: "John Doe",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&1",
    lastMessage: "Can you send me the latest design files?",
    timestamp: new Date(2024, 3, 15, 14, 30),
    unread: 2,
    online: true,
  },
  {
    id: "jane-smith",
    name: "Jane Smith",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&2",
    lastMessage: "The meeting is scheduled for tomorrow at 10 AM.",
    timestamp: new Date(2024, 3, 15, 12, 45),
    unread: 0,
    online: true,
  },
  {
    id: "mike-johnson",
    name: "Mike Johnson",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&3",
    lastMessage: "I've completed the task you assigned.",
    timestamp: new Date(2024, 3, 15, 10, 15),
    unread: 0,
    online: false,
    lastSeen: new Date(2024, 3, 15, 10, 15),
  },
  {
    id: "sarah-wilson",
    name: "Sarah Wilson",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&4",
    lastMessage: "Let's discuss the project timeline.",
    timestamp: new Date(2024, 3, 14, 16, 20),
    unread: 0,
    online: false,
    lastSeen: new Date(2024, 3, 14, 16, 20),
  },
  {
    id: "website-team",
    name: "Website Team",
    avatar: "",
    lastMessage: "Alex: We need to finalize the homepage design.",
    timestamp: new Date(2024, 3, 14, 15, 10),
    unread: 5,
    online: false,
    isGroup: true,
    members: ["John Doe", "Jane Smith", "Alex Brown", "You"]
  },
  {
    id: "alex-brown",
    name: "Alex Brown",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&5",
    lastMessage: "I'll send you the report by EOD.",
    timestamp: new Date(2024, 3, 14, 11, 30),
    unread: 0,
    online: true,
  },
  {
    id: "emily-davis",
    name: "Emily Davis",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&6",
    lastMessage: "Thanks for your help!",
    timestamp: new Date(2024, 3, 13, 17, 45),
    unread: 0,
    online: false,
    lastSeen: new Date(2024, 3, 13, 17, 45),
  },
  {
    id: "david-miller",
    name: "David Miller",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&7",
    lastMessage: "Let me know when you're available for a call.",
    timestamp: new Date(2024, 3, 13, 14, 20),
    unread: 0,
    online: true,
  },
  {
    id: "lisa-taylor",
    name: "Lisa Taylor",
    avatar: "https://source.unsplash.com/random/200x200/?portrait&8",
    lastMessage: "I've shared the document with you.",
    timestamp: new Date(2024, 3, 12, 10, 15),
    unread: 0,
    online: false,
    lastSeen: new Date(2024, 3, 12, 10, 15),
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    avatar: "",
    lastMessage: "Jane: Let's finalize the campaign strategy.",
    timestamp: new Date(2024, 3, 11, 16, 30),
    unread: 0,
    online: false,
    isGroup: true,
    members: ["Jane Smith", "Mike Johnson", "Lisa Taylor", "You"]
  },
]

const messagesByContact: Record<string, Message[]> = {
  "john-doe": [
    {
      id: "1",
      content: "Hey, how's the project going?",
      timestamp: new Date(2024, 3, 15, 9, 30),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "It's going well! I've completed the initial designs.",
      timestamp: new Date(2024, 3, 15, 9, 35),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "Great! Can you send me the latest design files?",
      timestamp: new Date(2024, 3, 15, 14, 30),
      sender: "contact",
      read: true,
    },
  ],
  "jane-smith": [
    {
      id: "1",
      content: "Hi, just wanted to remind you about our meeting tomorrow.",
      timestamp: new Date(2024, 3, 15, 11, 20),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "Thanks for the reminder! What time was it again?",
      timestamp: new Date(2024, 3, 15, 11, 25),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "The meeting is scheduled for tomorrow at 10 AM.",
      timestamp: new Date(2024, 3, 15, 12, 45),
      sender: "contact",
      read: true,
    },
  ],
  "mike-johnson": [
    {
      id: "1",
      content: "Hey, I've been working on the task you assigned.",
      timestamp: new Date(2024, 3, 14, 15, 10),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "How's it coming along?",
      timestamp: new Date(2024, 3, 14, 15, 15),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "I've completed the task you assigned.",
      timestamp: new Date(2024, 3, 15, 10, 15),
      sender: "contact",
      read: true,
      attachments: [
        {
          name: "final_report.pdf",
          url: "#",
          type: "application/pdf",
          size: 2500000,
        },
      ],
    },
  ],
  "sarah-wilson": [
    {
      id: "1",
      content: "Hi there! I wanted to discuss the project timeline with you.",
      timestamp: new Date(2024, 3, 14, 14, 30),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "Sure, what aspects of the timeline did you want to discuss?",
      timestamp: new Date(2024, 3, 14, 15, 45),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "Let's discuss the project timeline.",
      timestamp: new Date(2024, 3, 14, 16, 20),
      sender: "contact",
      read: true,
    },
  ],
  "alex-brown": [
    {
      id: "1",
      content: "I'm working on the quarterly report.",
      timestamp: new Date(2024, 3, 14, 10, 15),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "Great! When do you think it will be ready?",
      timestamp: new Date(2024, 3, 14, 10, 20),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "I'll send you the report by EOD.",
      timestamp: new Date(2024, 3, 14, 11, 30),
      sender: "contact",
      read: true,
    },
  ],
  "emily-davis": [
    {
      id: "1",
      content: "I need some help with the client presentation.",
      timestamp: new Date(2024, 3, 13, 14, 20),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "Of course! What do you need help with specifically?",
      timestamp: new Date(2024, 3, 13, 14, 30),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "Thanks for your help!",
      timestamp: new Date(2024, 3, 13, 17, 45),
      sender: "contact",
      read: true,
    },
  ],
  "david-miller": [
    {
      id: "1",
      content: "Do you have time for a quick call today?",
      timestamp: new Date(2024, 3, 13, 11, 10),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "I'm in meetings most of the day. How about tomorrow?",
      timestamp: new Date(2024, 3, 13, 12, 5),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "Let me know when you're available for a call.",
      timestamp: new Date(2024, 3, 13, 14, 20),
      sender: "contact",
      read: true,
    },
  ],
  "lisa-taylor": [
    {
      id: "1",
      content: "I've been working on the document you requested.",
      timestamp: new Date(2024, 3, 12, 9, 30),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "That's great! Is it ready for review?",
      timestamp: new Date(2024, 3, 12, 9, 45),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "I've shared the document with you.",
      timestamp: new Date(2024, 3, 12, 10, 15),
      sender: "contact",
      read: true,
      attachments: [
        {
          name: "project_proposal.docx",
          url: "#",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 1800000,
        },
      ],
    },
  ],
  "website-team": [
    {
      id: "1",
      content: "Hi team, we need to discuss the website redesign.",
      timestamp: new Date(2024, 3, 14, 10, 30),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "I've prepared some initial mockups.",
      timestamp: new Date(2024, 3, 14, 11, 15),
      sender: "user",
      read: true,
      attachments: [
        {
          name: "homepage_mockup.jpg",
          url: "#",
          type: "image/jpeg",
          size: 3500000,
        },
      ],
    },
    {
      id: "3",
      content: "We need to finalize the homepage design.",
      timestamp: new Date(2024, 3, 14, 15, 10),
      sender: "contact",
      read: true,
    },
  ],
  "marketing-team": [
    {
      id: "1",
      content: "Let's discuss the upcoming marketing campaign.",
      timestamp: new Date(2024, 3, 11, 14, 20),
      sender: "contact",
      read: true,
    },
    {
      id: "2",
      content: "I've prepared a draft of the campaign strategy.",
      timestamp: new Date(2024, 3, 11, 15, 10),
      sender: "user",
      read: true,
    },
    {
      id: "3",
      content: "Let's finalize the campaign strategy.",
      timestamp: new Date(2024, 3, 11, 16, 30),
      sender: "contact",
      read: true,
    },
  ],
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get('id') || ''
  
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Initialize selected conversation from URL parameter
  useEffect(() => {
    if (contactId) {
      const conversation = conversations.find(c => c.id === contactId)
      if (conversation) {
        setSelectedConversation(conversation)
        markAsRead(conversation.id)
      }
    } else {
      setSelectedConversation(null)
    }
  }, [contactId])

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const contactMessages = messagesByContact[selectedConversation.id] || []
      setMessages(contactMessages)
    } else {
      setMessages([])
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const markAsRead = (id: string) => {
    setConversations(conversations.map(conversation => 
      conversation.id === id ? { ...conversation, unread: 0 } : conversation
    ))
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    markAsRead(conversation.id)
    
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set('id', conversation.id)
    window.history.pushState({}, '', url.toString())
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date(),
        sender: "user",
        read: false,
      }
      
      // Update messages
      const updatedMessages = [...messages, newMsg]
      setMessages(updatedMessages)
      
      // Update conversation last message
      setConversations(conversations.map(conversation => 
        conversation.id === selectedConversation.id 
          ? { 
              ...conversation, 
              lastMessage: newMessage.trim(),
              timestamp: new Date()
            } 
          : conversation
      ))
      
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (timestamp >= today) {
      return format(timestamp, "h:mm a")
    } else if (timestamp >= yesterday) {
      return "Yesterday"
    } else if (timestamp.getFullYear() === now.getFullYear()) {
      return format(timestamp, "MMM d")
    } else {
      return format(timestamp, "MMM d, yyyy")
    }
  }

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, "h:mm a")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const messageAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <PageTransition>
      <div className="container py-6 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Messages
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild>
              <Link href="/messages/new">
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 h-[calc(90vh-220px)] overflow-y-hidden"
          >
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <motion.div 
                    className="space-y-0"
                    variants={container}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                  >
                    {filteredConversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        variants={item}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                        className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : conversation.unread > 0 ? 'bg-muted/30' : ''
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="relative">
                          {conversation.isGroup ? (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">{conversation.name.split(' ').map(word => word[0]).join('')}</span>
                            </div>
                          ) : (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.avatar} alt={conversation.name} />
                              <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatTimestamp(conversation.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 flex flex-col h-[calc(90vh-220px)] overflow-y-hidden"
          >
            <Card>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-card">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="relative">
                        {selectedConversation.isGroup ? (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">{selectedConversation.name.split(' ').map(word => word[0]).join('')}</span>
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                            <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        {selectedConversation.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                        )}
                      </div>
                      <div>
                        <h2 className="font-medium">{selectedConversation.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.online 
                            ? "Online" 
                            : selectedConversation.lastSeen 
                              ? `Last seen ${format(selectedConversation.lastSeen, "MMM d, h:mm a")}` 
                              : selectedConversation.isGroup 
                                ? `${selectedConversation.members?.length} members` 
                                : "Offline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                          <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Block contact</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <motion.div 
                      className="space-y-4"
                      variants={container}
                      initial="hidden"
                      animate="visible"
                    >
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          variants={messageAnimation}
                          custom={index}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.content}
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 rounded-md p-2 ${
                                      message.sender === "user" ? "bg-primary/80" : "bg-background"
                                    }`}
                                  >
                                    <div className="flex-shrink-0">
                                      {attachment.type.startsWith("image/") ? (
                                        <FileImage className="h-5 w-5" />
                                      ) : (
                                        <Paperclip className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                                      <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                                    </div>
                                    <Button
                                      variant={message.sender === "user" ? "secondary" : "outline"}
                                      size="sm"
                                      className="flex-shrink-0"
                                    >
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div
                              className={`text-xs mt-1 ${
                                message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {formatMessageTime(message.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </motion.div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-4 border-t bg-card">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <motion.div 
                    className="text-center space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-muted/30 rounded-full p-6 inline-flex"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <MessageIcon className="h-12 w-12 text-muted-foreground" />
                    </motion.div>
                    <motion.h3 
                      className="text-lg font-medium"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Select a conversation
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground max-w-md"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      Choose a conversation from the list or start a new one to begin messaging.
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Button asChild>
                        <Link href="/messages/new">
                          <Plus className="h-4 w-4 mr-2" />
                          New Conversation
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function FileImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="10" cy="13" r="2" />
      <path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22" />
    </svg>
  )
}