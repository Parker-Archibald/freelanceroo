import { db } from "@/firebase"
import { deleteDoc, doc } from "firebase/firestore"

export const deleteTaskById = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'Tasks', id))
        return true
    } catch (e) {
        console.log(e)
        return e
    }
}