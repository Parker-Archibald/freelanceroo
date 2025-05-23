import { Timestamp } from "firebase/firestore";

export type Projects = [
    {
        user_id: number;
        color: string;
        contract_id: string;
        created_time: Timestamp
        customer_info: {
            customer_address: string;
            customer_company: string;
            customer_email: string;
            customer_name: string;
            customer_phone: string;
        };
        description: string;
        invoices: [];
        project_name: string;
        status: string;
        team_member_ids: [];
        timeline_start: Timestamp;
        timeline_end: Timestamp;
        id: string;
        attachments: [];
    }
]

export type Project = {
    user_id: number;
    color: string;
    contract_id: string;
    created_time: string;
    customer_info: {
        customer_address: string;
        customer_company: string;
        customer_email: string;
        customer_name: string;
        customer_phone: string;
    };
    description: string;
    invoices: [];
    project_name: string;
    status: string;
    team_member_ids: [];
    timeline_start: string;
    timeline_end: string;
    attachments: [];
    budget: string;
}

export type Task = {
    completed: boolean;
    date: string;
    due_date: string;
    id: string;
    list_order: number;
    priority: string;
    project_id: string;
    section_id: string;
    tags: [];
    title: string;
    user_id: string;
    project_color: string;
}