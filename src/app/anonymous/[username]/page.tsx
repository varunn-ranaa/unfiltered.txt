'use client'

import { toast } from '@/components/ui/toast'
import { messageValidation } from '@/schemasValidation/messageSchema'
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { APIresponse } from '@/types/apiResponse'
import { Loader2, Mic, MicOff, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useCompletion } from '@ai-sdk/react'
import {  CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type paramsProps = {
  username: string
}


export default function AnonymousMessage() {

  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  const { completion,
          complete,
         isLoading: isSuggesting,
          error
        } = useCompletion({
          api: '/api/suggest-messages',
          streamProtocol: 'text',
        })

  const params = useParams<paramsProps>()
  const username = params.username


  const form = useForm<z.infer<typeof messageValidation>>({
    resolver: zodResolver(messageValidation),
    defaultValues: {
      content: ''
    }
  })

  const onSubmit = async (data: { content: string }) => {
    const userData = { username: username, ...data }
    try {
      setIsLoading(true)
      await axios.post<APIresponse>('/api/send-message', userData)
      toast.add({
        type: 'success',
        title: 'Message sent successfully !',
      })
      form.reset()
    } catch (error) {
      console.log('Error in send-message', error)
      const axiosError = error as AxiosError<APIresponse>
      const errorMessage = axiosError.response?.data.message ?? "Failed to send message"
      toast.add({
        type: "error",
        description: errorMessage,
        priority: "high"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.unspokenPunctuation = true

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string
      const current = form.getValues('content')
      const merged = current ? `${current} ${transcript}` : transcript

      form.setValue('content', merged, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error)
      toast.add({
        type: 'error',
        description: 'Could not capture voice input. Please try again.',
        priority: 'high',
      })
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [form])

  const handleMicClick = () => {
    const recognition = recognitionRef.current

    if (!recognition) {
      toast.add({
        type: 'error',
        description: 'Voice input is not supported in this browser.',
        priority: 'high',
      })
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  const parseStringMessages = (messageString: string): string[] => {
    return messageString
      .split('||')
      .map((message) => message.trim())
      .filter(Boolean)
  }

  const handleMessageClick = (message: string) => {
    form.setValue('content', message, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const handleGenerateSuggestionMessages = () => {
    try {
      complete('');
    } catch (err) {
      console.log(err)
      toast.add({
        type: 'error',
        title: 'Failed to generate messages.'
      })
    }
  }

  const suggestions = parseStringMessages(completion)

  return (
    <div className="mx-4 my-8 max-w-2xl md:mx-8 lg:mx-auto">

      <h1 className="font-serif text-3xl tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
        Send an anonymous message
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        to <span className="font-medium text-neutral-700 dark:text-neutral-300">@{username}</span>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <Controller
          name='content'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Message
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Type your message here"
                autoComplete="off"
                rows={5}
                className="rounded-lg border border-neutral-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-900 transition-colors resize-none data-[invalid=true]:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs text-red-500 font-normal"
                />
              )}
            </Field>
          )}
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-md bg-neutral-900 text-white text-sm font-medium tracking-wide transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLoading ? "Sending…" : "Send message"}
          </button>
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={isRecording ? "Stop recording" : "Record voice message"}
            className={`shrink-0 rounded-md border p-3 transition-colors duration-150 ${
              isRecording
                ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
            }`}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      <Separator className="my-8" />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-neutral-900 dark:text-neutral-50">
            Need inspiration?
          </h2>
          <button
            type="button"
            onClick={handleGenerateSuggestionMessages}
            disabled={isSuggesting}
            aria-label="Suggest ai message"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isSuggesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isSuggesting ? "Generating…" : "Suggest messages"}
          </button>
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Click on any message below to use it.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-500">{error.message}</p>
        ) : suggestions.length > 0 ? (
          <Card className="mt-4 border-neutral-200 dark:border-neutral-800">
            <CardContent className="flex flex-col gap-2 pt-6">
              {suggestions.map((message, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start whitespace-normal py-2.5 text-left font-normal"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : (
          <p className="mt-4 text-sm text-neutral-400 dark:text-neutral-500">
            No suggestions yet — click "Suggest messages" to generate some.
          </p>
        )}
      </div>

      <Separator className="my-8" />

      <div className="text-center pb-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Want your own message board?
        </p>
        <Link href={'/signup'}>
          <button className="mt-3 rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200">
            Create your account
          </button>
        </Link>
      </div>
    </div>
  )
}