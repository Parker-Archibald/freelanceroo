"use client"

import { useState, useEffect } from "react"
import { Calendar, MoreVertical, ListFilter, CheckSquare } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Projects, Task } from "@/lib/types"
import { getTasksByProjectId } from "@/app/api/getTasks/route"
import Loader from "../Loader"
import { Checkbox } from "../ui/checkbox"

type Props = {
    p: Projects | [];
    t: Task[] | []
}

export default function Today({ p, t }: Props) {
    // const [progressValues, setProgressValues] = useState<number[]>(projects.map(() => 0))
    const [isVisible, setIsVisible] = useState(false)
    const [allTasks, setAllTasks] = useState<{
        projId: string;
        completed_tasks: number;
        total_tasks: number;
    }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [canViewCompleted, setCanViewCompleted] = useState<boolean>(false)
    const [viewPercent, setViewPercent] = useState(true)

    // useEffect(() => {
    //   // Delay to ensure animation happens after component mount
    //   const timer = setTimeout(() => {
    //     setIsVisible(true)
    //     // setProgressValues(projects.map(project => project.progress))
    //   }, 500)

    //   return () => clearTimeout(timer)
    // }, [])

    useEffect(() => {

        setIsLoading(true)

        let allTaskData: {
            projId: string;
            completed_tasks: number;
            totalTasks: number
        }[] = []

        const getTasks = async (id: string) => {
            const results: Task[] = t

            let pushable = {
                projId: id,
                completed_tasks: 0,
                totalTasks: 0
            }

            results.forEach(task => {
                if (task.project_id === id) {
                    if (task.completed) {
                        pushable.completed_tasks++
                    }

                    pushable.totalTasks++
                }

            })


            allTaskData.push(pushable)
            setIsVisible(true)
        }

        if (p && t) {

            p.forEach((project: { id: string }) => {
                getTasks(project.id)
            })

            setAllTasks(allTaskData)
            setIsLoading(false)

        }

    }, [p, t])

    if (isLoading) {
        return <Loader />
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold">Today</h2>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 7 Days
                    </div>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <ListFilter className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="hover:cursor-pointer space-x-2 group hover:bg-zinc-900 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => setCanViewCompleted(!canViewCompleted)}>
                                <Checkbox checked={canViewCompleted} />
                                <span>Completed Projects</span>
                            </div>
                            <div className="hover:cursor-pointer space-x-2 group hover:bg-zinc-900 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => setViewPercent(!viewPercent)}>
                                <Checkbox checked={viewPercent} />
                                <span>View as Percent</span>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="hover:cursor-pointer">View details</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="space-y-6">
                {p.map((project: { project_name: string, color: string, id: string, status: string }, index: number) => (
                    <div key={project.id}>
                        {project.status !== 'complete' && (
                            <motion.div
                                key={project.id}
                                className="space-y-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.2 + 0.5,
                                    ease: "easeOut"
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{project.project_name}</span>
                                    <motion.span
                                        className="text-sm text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                                    >
                                        {allTasks?.map((task: { projId: string, completed_tasks: number, totalTasks: number }, index: number) => {
                                            if (task.projId === project.id) {
                                                if (task.completed_tasks === 0) {
                                                    if (viewPercent) {
                                                        return (
                                                            <div key={index}>{task.completed_tasks}%</div>
                                                        )
                                                    }
                                                    else {
                                                        return (
                                                            <div key={index}>{task.completed_tasks}/{task.totalTasks}</div>
                                                        )
                                                    }
                                                }
                                                else {
                                                    if (!viewPercent) {
                                                        return (
                                                            <div key={index}>{task.completed_tasks} / {task.totalTasks}</div>
                                                        )
                                                    }
                                                    else {
                                                        return (
                                                            <div key={index}>{((task.completed_tasks / task.totalTasks) * 100).toFixed(0)}%</div>
                                                        )
                                                    }
                                                }
                                            }
                                        })}
                                    </motion.span>
                                </div>
                                {allTasks?.map((task: { projId: string, completed_tasks: number, totalTasks: number }, index: number) => {
                                    if (task.projId === project.id) {
                                        if (task.totalTasks > 0) {
                                            return (
                                                <Progress
                                                    value={((task.completed_tasks / task.totalTasks) * 100)}
                                                    key={index}
                                                    className="h-2"
                                                    style={{
                                                        "--progress-background": project.color,
                                                        transition: "all 1s cubic-bezier(0.65, 0, 0.35, 1)"
                                                    } as React.CSSProperties}
                                                />
                                            )
                                        }
                                        else return (
                                            <Progress
                                                value={0}
                                                key={index}
                                                className="h-2"
                                                style={{
                                                    "--progress-background": project.color,
                                                    transition: "all 1s cubic-bezier(0.65, 0, 0.35, 1)"
                                                } as React.CSSProperties}
                                            />
                                        )
                                    }
                                })}
                            </motion.div>
                        )}

                        {project.status === 'complete' && canViewCompleted && (
                            <motion.div
                                key={project.id}
                                className="space-y-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut"
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{project.project_name}</span>
                                    <motion.span
                                        className="text-sm text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                                    >
                                        {allTasks?.map((task: { projId: string, completed_tasks: number, totalTasks: number }, index: number) => {
                                            if (task.projId === project.id) {
                                                if (task.completed_tasks === 0) {
                                                    return (
                                                        <div key={index}>{task.completed_tasks}%</div>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <div key={index}>{((task.completed_tasks / task.totalTasks) * 100).toFixed(0)}%</div>
                                                    )
                                                }
                                            }
                                        })}
                                    </motion.span>
                                </div>
                                {allTasks?.map((task: { projId: string, completed_tasks: number, totalTasks: number }, index: number) => {
                                    if (task.projId === project.id) {
                                        if (task.totalTasks > 0) {
                                            return (
                                                <Progress
                                                    value={(task.completed_tasks / task.totalTasks) * 100}
                                                    key={index}
                                                    className="h-2"
                                                    style={{
                                                        "--progress-background": project.color,
                                                        transition: "all 1s cubic-bezier(0.65, 0, 0.35, 1)"
                                                    } as React.CSSProperties}
                                                />
                                            )
                                        }
                                        else return (
                                            <Progress
                                                value={0}
                                                key={index}
                                                className="h-2"
                                                style={{
                                                    "--progress-background": project.color,
                                                    transition: "all 1s cubic-bezier(0.65, 0, 0.35, 1)"
                                                } as React.CSSProperties}
                                            />
                                        )
                                    }
                                })}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}