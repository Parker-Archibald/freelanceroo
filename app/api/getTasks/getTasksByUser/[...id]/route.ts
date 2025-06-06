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

    const id = req.url.split('/')[6]

    try {

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



// export const getTasksByUser = async (id: string) => {
//     const results = await getDocs(query(collection(db, 'Tasks'), where('user_id', '==', id)))
//     const data = results.docs;

//     const arr: {}[] = [];

//     results.forEach(item => {

//         const d = item.data();

//         arr.push({
//             id: item.id,
//             project_id: d.project_id,
//             user_id: d.user_id,
//             title: d.title,
//             completed: d.completed,
//             due_date: d.due_date,
//             priority: d.priority,
//             tags: d.tags,
//             list_order: d.list_order,
//             section_id: d.section_id,
//             date: d.date,
//             project_color: d.project_color
//         })
//     })

//     return arr;
// }