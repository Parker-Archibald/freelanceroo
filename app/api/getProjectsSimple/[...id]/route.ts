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
        const data = await getDocs(query(collection(db, 'Projects'), where('user_id', '==', id)))
        const results = data.docs;

        let arr: Proj[] = [];
        let displayItems: {
            title: string;
            href: string;
            color: string;
        }[] = [{ title: "All Projects", href: "/projects", color: "" },]

        results.forEach((item, i) => {
            console.log(item.data())
            let info: {
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
                status: string;
            } = {
                description: item.data().description,
                timeline_start: item.data().timeline_start,
                timeline_end: item.data().timeline_end,
                user_id: item.data().user_id,
                invoices: item.data().invoices,
                team_member_ids: item.data().team_member_ids,
                created_time: item.data().created_time,
                budget: item.data().budget,
                color: item.data().color,
                project_name: item.data().project_name,
                id: '',
                status: item.data().status
            };
            info.id = item.id
            arr.push(info)

            let d = {
                title: info.project_name,
                href: `/projects/${info.project_name}?id=${item.id}`,
                color: info.color
            }

            displayItems[i + 1] = d
        })

        return NextResponse.json({
            status: 200,
            statusText: 'Success',
            data: {
                results: arr,
                displayItems: displayItems
            }
        })


    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: 400, statusText: 'There was an error fetching projects' + e })
    }

}

// export const getProjectsSimple = async () => {
//     const data = await getDocs(query(collection(db, 'Projects'), where('user_id', '==', '123')))
//     const results = data.docs;

//     let arr: Projects | [] = [];
//     let displayItems: {
//         title: string;
//         href: string;
//         color: string;
//     }[] = [{ title: "All Projects", href: "/projects", color: "" },]

//     results.forEach((item, i) => {
//         let info = item.data();
//         info.id = item.id
//         arr.push(info)

//         let d = {
//             title: info.project_name,
//             href: `/projects/${info.project_name}?id=${item.id}`,
//             color: info.color
//         }

//         displayItems[i + 1] = d
//     })

//     return ({
//         results: arr,
//         displayItems: displayItems
//     })


// }