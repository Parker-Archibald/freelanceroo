
import { db } from "@/firebase"
import { deleteDoc, doc } from "firebase/firestore"
import { NextResponse, NextRequest } from 'next/server'

export async function PUT(req: NextRequest) {

    const id = req.url.split('/')[5]

    try {
        const test = await deleteDoc(doc(db, 'Tasks', id))
        console.log(test)
        return NextResponse.json({ status: 200, statusText: 'Success' })
    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: 400, statusText: 'There was an error with your request ' + e })
    }

}