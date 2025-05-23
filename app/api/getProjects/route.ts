import { db } from "@/firebase";
import { Project, Projects } from "@/lib/types";
import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";

export const getProjectsSimple = async () => {
    const data = await getDocs(query(collection(db, 'Projects'), where('user_id', '==', '123')))
    const results = data.docs;

    let arr: Projects | [] = [];
    let displayItems: {
        title: string;
        href: string;
        color: string;
    }[] = [{ title: "All Projects", href: "/projects", color: "" },]

    results.forEach((item, i) => {
        let info = item.data();
        info.id = item.id
        arr.push(info)

        let d = {
            title: info.project_name,
            href: `/projects/${info.project_name}?id=${item.id}`,
            color: info.color
        }

        displayItems[i + 1] = d
    })

    return ({
        results: arr,
        displayItems: displayItems
    })


}

export const getAllProjects = async () => {
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

    return arr
}

export const getProjectById = async (id: string) => {
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

    return info;
}