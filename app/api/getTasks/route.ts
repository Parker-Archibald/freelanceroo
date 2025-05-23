import { db } from "@/firebase"
import { Task } from "@/lib/types";
import { collection, getDocs, query, where } from "firebase/firestore"


export const getTasksByUser = async (id: string) => {
    const results = await getDocs(query(collection(db, 'Tasks'), where('user_id', '==', id)))
    const data = results.docs;

    const arr: {}[] = [];

    results.forEach(item => {

        const d = item.data();

        arr.push({
            id: item.id,
            project_id: d.project_id,
            user_id: d.user_id,
            title: d.title,
            completed: d.completed,
            due_date: d.due_date,
            priority: d.priority,
            tags: d.tags,
            list_order: d.list_order,
            section_id: d.section_id,
            date: d.date,
            project_color: d.project_color
        })
    })

    return arr;
}

export const getTasksByProjectId = async (id: string) => {
    const results = await getDocs(query(collection(db, 'Tasks'), where('project_id', '==', id)))
    const data = results.docs;
    let final: Task[] | [] = []

    data.forEach((item, index) => {
        let d = item.data()
        let task: Task = {
            completed: d.completed,
            date: d.date,
            due_date: d.due_date,
            id: d.id,
            list_order: d.list_order,
            priority: d.priority,
            project_id: d.project_id,
            section_id: d.section_id,
            tags: d.tags,
            title: d.title,
            user_id: d.user_id,
            project_color: d.project_color
        }
        final = [...final, task]
        final[index].id = item.id
    })

    return final
}