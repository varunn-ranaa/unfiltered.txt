"use client"

import { toast } from "@/components/ui/toast";
import { APIresponse } from "@/types/apiResponse";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as z from 'zod'

const emailValidation = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
})
 
export default function ForgotPasswordForm() {

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof emailValidation>>({
    resolver: zodResolver(emailValidation),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof emailValidation>) => {
    setIsLoading(true)
    try {
      const res = await axios.post('/api/forgot-password', data)
      toast.add({
        type: "success",
        description: "Reset Code Sent. Check your email to verify."
      })
      router.replace(`/password-reset-verify?username=${encodeURIComponent(res.data.username)}`)
    } catch (error: any) {
      console.error("Error in forgot password", error)
      const axiosError = error as AxiosError<APIresponse>
      const errorMessage = axiosError.response?.data.message ?? "Failed to send reset code"
      toast.add({
        type: "error",
        description: errorMessage,
        priority: "high"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-8px_rgba(0,0,0,0.5)]">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-[2.5rem] leading-none tracking-tight text-neutral-900 dark:text-neutral-50">
            Unfiltered.txt
          </h1>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Reset your password.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="johndoe@gmail.com"
                  autoComplete="off"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:focus-visible:ring-neutral-100/10 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 transition-colors data-[invalid=true]:border-red-400 dark:data-[invalid=true]:border-red-500"
                />
                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                    className="text-xs text-red-500 dark:text-red-400 font-normal"
                  />
                )}
              </Field>
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium tracking-wide transition-colors duration-150 hover:bg-neutral-700 dark:hover:bg-neutral-300 active:bg-neutral-950 dark:active:bg-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}