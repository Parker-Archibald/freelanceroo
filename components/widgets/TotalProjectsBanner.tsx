import React from 'react'
import { motion } from "framer-motion"
import { StatsCard } from '../stats-card'
import { Projects, Task } from "@/lib/types"

type Props = {
    projects: Projects | [];
    inProgressProjects: number;
    completedCounter: number;
}

function TotalProjectsBanner({ projects, inProgressProjects, completedCounter }: Props) {

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    }

    return (
        <motion.div
            className="rounded-lg border bg-card p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-4 md:divide-x"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={fadeInUp}>
                    <StatsCard
                        title="Total Projects"
                        value={`${projects.length.toString()} Projects`}
                        change={12.5}
                        compareText="Compared to last month"
                    />
                </motion.div>
                <motion.div className="md:pl-6" variants={fadeInUp}>
                    <StatsCard
                        title="In Progress"
                        value={`${inProgressProjects} projects`}
                        change={-8.4}
                        compareText="Compared to last month"
                    />
                </motion.div>
                <motion.div className="md:pl-6" variants={fadeInUp}>
                    <StatsCard
                        title="Completed Projects"
                        value={`${completedCounter} Projects`}
                        change={3.0}
                        compareText="Compared to last month"
                    />
                </motion.div>
                <motion.div className="md:pl-6" variants={fadeInUp}>
                    <StatsCard
                        title="Total Working Hours"
                        value="143 Hours"
                        change={-2.3}
                        compareText="Compared to last month"
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default TotalProjectsBanner
