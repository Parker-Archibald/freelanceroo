import React from 'react'
import { Button } from '../ui/button'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { motion } from "framer-motion"

function UrgentTasks() {
    return (
        <motion.div
            className="rounded-lg border bg-card p-6 shadow-sm h-[calc(60%-1.5rem)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <h2 className="text-lg font-semibold mb-4">Urgent Tasks</h2>
            <p className="text-muted-foreground mb-4"></p>
            <div className="flex flex-col gap-3">
                <Button className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Show Success Toast
                </Button>
                <Button variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Show Error Toast
                </Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600">
                    <Info className="h-4 w-4 mr-2" />
                    Show Warning Toast
                </Button>
            </div>
        </motion.div>
    )
}

export default UrgentTasks
