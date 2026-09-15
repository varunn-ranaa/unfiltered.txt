"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteChatProps {
  onDelete: () => void;
}

export default function DeleteChat({ onDelete }: DeleteChatProps) {

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete message"
            className="h-7 w-7 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:text-neutral-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}