"use client"

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import DeleteChat from "./DeleteChat"
import { Message } from "@/model/User"
import axios from "axios"
import { toast } from "@/components/ui/toast"

type MessageCardProps = {
    message: Message,
    onMessageDelete: (messageId: string) => void
}

export default function MessageCard({ message, onMessageDelete }: MessageCardProps) {

    const createdAt = message.createdAt ? new Date(message.createdAt) : null

    return (
        <Card className="relative border-neutral-200 dark:border-neutral-800">
            <CardContent className="pr-10">
                <p className="text-base text-black-900 dark:text-neutral-100">
                    {message.context || "No message content"}
                </p>
                {createdAt && (
                    <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                        {createdAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </CardContent>
            <div className="absolute right-2 top-2">
                <DeleteChat onDelete={() => onMessageDelete(message._id.toString())} />
            </div>
        </Card>
    )
}