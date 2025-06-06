
import { db } from "@/firebase"
import { Project, Projects } from "@/lib/types"
import { collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore"
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

        const data = await getDoc(doc(db, 'Projects', id))
        const results = data.data()

        const months = [
            'Jan.',
            'Feb.',
            'March',
            'April',
            'May',
            'June',
            'July',
            'Aug.',
            'Sep.',
            'Oct.',
            'Nov.',
            'Dec.'
        ]

        const date = new Date(results!.created_time.seconds * 1000 + results!.created_time.nanoseconds / 1000000)
        const dateMonth = months[date.getMonth()]
        const dateDay = date.getDay();
        const dateYear = date.getFullYear();

        const startDate = new Date(results!.timeline_start.seconds * 1000 + results!.timeline_start.nanoseconds / 1000000)
        const startDateMonth = months[startDate.getMonth()]
        const startDateDay = startDate.getDay();
        const startDateYear = startDate.getFullYear()

        const endDate = new Date(results!.timeline_end.seconds * 1000 + results!.timeline_end.nanoseconds / 1000000)
        const endDateMonth = months[endDate.getMonth()]
        const endDateDay = endDate.getDay();
        const endDateYear = endDate.getFullYear()


        const info: Project = {
            attachments: results!.attachments,
            color: results!.color,
            contract_id: results!.contract_id,
            created_time: (`${dateMonth} ${dateDay}, ${dateYear}`),
            customer_info: {
                customer_address: results!.customer_info.customer_address,
                customer_company: results!.customer_info.customer_company,
                customer_email: results!.customer_info.customer_email,
                customer_name: results!.customer_info.customer_name,
                customer_phone: results!.customer_info.customer_phone
            },
            description: results!.description,
            invoices: results!.invoices,
            project_name: results!.project_name,
            status: results!.status,
            team_member_ids: results!.team_member_ids,
            timeline_start: (`${startDateMonth} ${startDateDay}, ${startDateYear}`),
            timeline_end: (`${endDateMonth} ${endDateDay}, ${endDateYear}`),
            user_id: results!.user_id,
            budget: results!.budget
        }

        return NextResponse.json({
            status: 200,
            statusText: 'Success',
            data: info
        })


    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: 400, statusText: 'There was an error fetching projects' + e })
    }

}


// import { db } from "@/firebase";
// import { Project, Projects } from "@/lib/types";
// import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";

// export const getProjectById = async (id: string) => {
//     const data = await getDoc(doc(db, 'Projects', id))
//     const results = data.data()

//     const months = [
//         'Jan.',
//         'Feb.',
//         'March',
//         'April',
//         'May',
//         'June',
//         'July',
//         'Aug.',
//         'Sep.',
//         'Oct.',
//         'Nov.',
//         'Dec.'
//     ]

//     const date = new Date(results!.created_time.seconds * 1000 + results!.created_time.nanoseconds / 1000000)
//     const dateMonth = months[date.getMonth()]
//     const dateDay = date.getDay();
//     const dateYear = date.getFullYear();

//     const startDate = new Date(results!.timeline_start.seconds * 1000 + results!.timeline_start.nanoseconds / 1000000)
//     const startDateMonth = months[startDate.getMonth()]
//     const startDateDay = startDate.getDay();
//     const startDateYear = startDate.getFullYear()

//     const endDate = new Date(results!.timeline_end.seconds * 1000 + results!.timeline_end.nanoseconds / 1000000)
//     const endDateMonth = months[endDate.getMonth()]
//     const endDateDay = endDate.getDay();
//     const endDateYear = endDate.getFullYear()


//     const info: Project = {
//         attachments: results!.attachments,
//         color: results!.color,
//         contract_id: results!.contract_id,
//         created_time: (`${dateMonth} ${dateDay}, ${dateYear}`),
//         customer_info: {
//             customer_address: results!.customer_info.customer_address,
//             customer_company: results!.customer_info.customer_company,
//             customer_email: results!.customer_info.customer_email,
//             customer_name: results!.customer_info.customer_name,
//             customer_phone: results!.customer_info.customer_phone
//         },
//         description: results!.description,
//         invoices: results!.invoices,
//         project_name: results!.project_name,
//         status: results!.status,
//         team_member_ids: results!.team_member_ids,
//         timeline_start: (`${startDateMonth} ${startDateDay}, ${startDateYear}`),
//         timeline_end: (`${endDateMonth} ${endDateDay}, ${endDateYear}`),
//         user_id: results!.user_id,
//         budget: results!.budget
//     }

//     return info;
// }