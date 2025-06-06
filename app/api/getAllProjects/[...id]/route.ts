import { db } from "@/firebase"
import { Project, Projects } from "@/lib/types"
import { collection, deleteDoc, doc, getDocs, query, Timestamp, where } from "firebase/firestore"
import { NextResponse, NextRequest } from 'next/server'

type Proj = {
    description: string
    timeline_start: Timestamp;
    timeline_end: Timestamp;
    user_id: string;
    invoices: [];
    team_member_ids: [];
    created_time: Timestamp;
    budget: string;
    color: string;
    project_name: string;
    id: string;
}

export async function GET(req: NextRequest) {

    const id = req.url.split('/')[5]

    try {

        const data = await getDocs(query(collection(db, 'Projects'), where('user_id', '==', '123')))
        const results = data.docs;

        let arr: {
            id: string;
            title: string;
            description: string;
            user_ids: number[];
            timeline_end: string;
            status: 'in_progress' | 'applied' | 'complete';
            color: string;
        }[] = [];

        results.forEach(item => {

            const snap = item.data()
            const date = new Date(snap.timeline_end.seconds * 1000 + snap.timeline_end.nanoseconds / 1000000)

            arr.push({
                id: item.id,
                title: snap.project_name,
                description: snap.description,
                user_ids: snap.team_member_ids,
                timeline_end: date.toLocaleDateString(),
                status: snap.status,
                color: snap.color
            })
        })

        return NextResponse.json({
            status: 200,
            statusText: 'Success',
            data: arr
        })


    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: 400, statusText: 'There was an error fetching projects' + e })
    }

}

