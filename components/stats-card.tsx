"use client"

import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatsCardProps {
  title: string
  value: string
  change: number
  compareText: string
}

export function StatsCard({ title, value, change, compareText }: StatsCardProps) {
  const isPositive = change >= 0
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delay to ensure animation happens after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <div className="mt-2 flex items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1
          }}
          className={cn(
            "flex items-center text-sm",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          <motion.div
            animate={isVisible ? 
              { y: [0, -4, 0], rotate: isPositive ? 0 : 180 } : 
              { y: 0, rotate: isPositive ? 0 : 180 }
            }
            transition={{ 
              y: { repeat: 0, duration: 0.5 },
              rotate: { duration: 0.5 }
            }}
            className="mr-1"
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4 rotate-180" />
            )}
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {Math.abs(change)}%
          </motion.span>
        </motion.div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="ml-2 text-sm text-muted-foreground"
        >
          {compareText}
        </motion.span>
      </div>
    </div>
  )
}