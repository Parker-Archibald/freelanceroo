import { db } from "@/firebase"
import { Task } from "@/lib/types"
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore"


export const getColumnsById = async (user_id: string) => {
    const results = await getDocs(query(collection(db, 'Kanban Columns'), where('user_id', '==', user_id), orderBy('order')))
    const data = results.docs

    let mappedResults: { id: string, user_id: string, name: string, task_list: Task[] }[] = []

    data.forEach(column => {
        mappedResults.push({
            id: column.id,
            user_id: column.data().user_id,
            name: column.data().name.replace('-', ' '),
            task_list: []
        })
    })

    return mappedResults;
}

export const getTodoColumn = async (user_id: string) => {
    const results = await getDocs(query(collection(db, 'Kanban Columns'), where('user_id', '==', user_id), where('name', '==', 'to-do')))

    const data = results.docs
    return data[0].id
}