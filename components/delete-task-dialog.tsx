import { deleteTaskById } from "@/app/api/deleteTask/[...id]/route";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react";

interface Props {
    taskId: string;
    isOpen: boolean
    handleClose: () => void
    repull: () => void
}


export default function DeleteTaskDialog({ taskId, isOpen, handleClose, repull }: Props) {

    const { toast } = useToast()

    const showSuccessToast = () => {
        toast({
            variant: "success",
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Task Deleted!</span>
                </div>
            ),
            description: "Task Successfully deleted.",
        })
    }

    const showErrorToast = (err) => {
        toast({
            variant: "destructive",
            title: (
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>There was an error! {err}</span>
                </div>
            ),
            description: "There was a problem with your request.",
        })
    }

    const handleDelete = async () => {
        const res = await fetch(`http://localhost:3000/api/deleteTask/${taskId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId })
        });

        if (res.status === 200) {
            repull()
            handleClose()
            showSuccessToast()
        }
        else {
            showErrorToast(res.statusText)
            handleClose()
        }


    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className='text-center'>Are you sure that you want to delete this task?</DialogTitle>
                </DialogHeader>

                <Separator />

                <DialogFooter >
                    <Button variant={'destructive'} className="w-1/2 mx-auto" onClick={(e) => { e.preventDefault(); handleDelete() }}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
