import { db } from "@/firebase"
import { Task } from "@/lib/types";
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

export const toggleTaskStatus = async (id: string) => {
    const results = await getDoc(doc(db, 'Tasks', id));
    const data = results.data()

    if (data!.completed) {
        data!.completed = false
    }
    else {
        data!.completed = true
    }

    setDoc(doc(db, 'Tasks', id), data)
}

export const addTask = async (taskInfo: Task) => {
    await addDoc(collection(db, 'Tasks'), taskInfo)
}

export const updateTaskSection = async (task: Task) => {
    try {
        await updateDoc(doc(db, 'Tasks', task.id), task)
        return 'true'
    } catch (e) {
        return e
    }
}
