'use client'

import { toast } from "@/components/ui/toast"
import { Message } from "@/model/User"
import { acceptMessageValidation } from "@/schemasValidation/acceptMessageSchema"
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useSession } from "next-auth/react"
import axios, { AxiosError } from "axios"
import { APIresponse } from "@/types/apiResponse"
import MessageCard from "@/components/MessageCard"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCcw, Copy } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { User } from "next-auth"



export default function Dashboard() {

  const [isloading, setIsLoading] = useState(false)
  const [isSwitchloading, setIsSwitchloading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const handleDeleteMessage = async (messageId: string) => {
    const previousMessages = messages
    setMessages(messages.filter((message) => message._id.toString() !== messageId))

    try {
      await axios.delete(`/api/delete-message/${messageId}`)
    } catch (error) {
      setMessages(previousMessages)
      toast.add({
        title: 'Error',
        description: 'Failed to delete message. Please try again.',
        type: 'error'
      })
    }
  }

  const form = useForm<z.infer<typeof acceptMessageValidation>>({
    resolver: zodResolver(acceptMessageValidation),
    defaultValues: {
      acceptMessage: false
    }
  })

  const { control, watch, setValue } = form
  const acceptMessages = watch('acceptMessage')

  const { data: session } = useSession()

  const fetchAcceptingMessages = useCallback(async () => {

    setIsSwitchloading(true)
    try {
      const response = await axios.get<APIresponse>('/api/acceptingmessage')
      if (response.data.isAcceptingMessages) {
        setValue('acceptMessage', response?.data.isAcceptingMessages)
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIresponse>
      toast.add({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to fetch !',
        type: 'error'
      })
    }
    finally { setIsSwitchloading(false) }

  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchloading(true)
    try {
      const response = await axios.get<APIresponse>('/api/get-messages')

      setMessages(response.data.messages || [])

      if (refresh) {
        toast.add({
          title: 'Refreshed messages',
          description: 'Showing latest messages'
        })
      }

    } catch (error) {
      const axiosError = error as AxiosError<APIresponse>
      toast.add({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to fetch !',
        type: 'error'
      })
    } finally {
      setIsSwitchloading(false)
      setIsLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {

    if (!session || !session.user) return

    fetchMessages()
    fetchAcceptingMessages()
  }, [session, fetchMessages, fetchAcceptingMessages, setValue])

  const handleAcceptingMessageSwitch = async (newValue: boolean) => {
    const previousValue = acceptMessages
    setValue('acceptMessage', newValue)
    setIsSwitchloading(true)
    try {
      await axios.post<APIresponse>('/api/acceptingmessage', {
        acceptMessage: newValue
      })
      toast.add({
        title: 'Updated',
        description: `You are now ${newValue ? 'accepting' : 'not accepting'} messages.`
      })
    } catch (error) {
      setValue('acceptMessage', previousValue)
      const axiosError = error as AxiosError<APIresponse>
      toast.add({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to update setting.',
        type: 'error'
      })
    }
    finally {
      setIsSwitchloading(false)
    }

  }

  if (!session || !session.user) {
    return <>
        <Navbar />
        <div></div>
      </>;
  }
 
  const { username } = session.user as User;
 
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/anonymous/${username}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.add({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };


  return (
    <>
    <Navbar/>
    <div className="mx-4 my-8 max-w-4xl md:mx-8 lg:mx-auto">
      <h1 className="font-serif text-3xl tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
        Your Dashboard
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Manage your link and see what people are sending you.
      </p>

      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Your unique link
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          />
          <Button
            onClick={copyToClipboard}
            className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Controller
          name="acceptMessage"
          control={control}
          render={({ field  }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                handleAcceptingMessageSwitch(checked)
              }}
              disabled={isSwitchloading}
            />
          )}
        />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          Accepting messages: <span className="font-medium text-neutral-900 dark:text-neutral-50">{acceptMessages ? 'On' : 'Off'}</span>
        </span>
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Messages
        </h2>
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
          className="rounded-md border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
        >
          {isloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id.toString()}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No messages to display yet.
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  )
}