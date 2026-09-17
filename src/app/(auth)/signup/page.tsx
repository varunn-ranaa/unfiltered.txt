"use client"

import  { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { signUpValidation } from "@/schemasValidation/signUpSchema"
import { useDebounceValue } from 'usehooks-ts'
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import axios, { AxiosError } from 'axios'
import { APIresponse } from "@/types/apiResponse"
import Link from "next/link"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function SignUpForm() {
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [debounceUsername] = useDebounceValue(username, 300)
    const router = useRouter()

    const form = useForm<z.infer<typeof signUpValidation>>({
        resolver: zodResolver(signUpValidation),
        defaultValues: {
            email: "",
            username: "",
            password: ""
        },
    })

    useEffect(() => {
        const checkUniqueUsername = async () => {
            if (!debounceUsername) return

            setIsCheckingUsername(true)
            setUsernameMessage('')
            try {
                const result = await axios.get(`/api/checkuniqueusername?username=${debounceUsername}`)
                setUsernameMessage(result.data.message)
            } catch (error) {
                const axiosError = error as AxiosError<APIresponse>
                setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
            } finally {
                setIsCheckingUsername(false)
            }
        }

        checkUniqueUsername()
    }, [debounceUsername])

    const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
        setIsLoading(true)
        try {
            await axios.post<APIresponse>('/api/signup', data)
            toast.add({
                type : "success",
                description : "Account created. Check your email to verify."
            })
            router.replace(`/verify?username=${data.username}`)
        } catch (error) {
            console.error("Error in SignUp", error)
            const axiosError = error as AxiosError<APIresponse>
            const errorMessage = axiosError.response?.data.message ?? "Sign up failed"
            toast.add({
                type :"error",
                description : errorMessage,
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
                        Start your secret conversations
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <Controller
                        name="username"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    Username
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter a username"
                                    autoComplete="off"
                                    onChange={(e) => {
                                        field.onChange(e)
                                        setUsername(e.target.value.trim())
                                    }}
                                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:focus-visible:ring-neutral-100/10 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 transition-colors data-[invalid=true]:border-red-400 dark:data-[invalid=true]:border-red-500"
                                />
                                {isCheckingUsername && (
                                    <FieldDescription className="text-xs text-neutral-400 dark:text-neutral-500">
                                        Checking availability…
                                    </FieldDescription>
                                )}
                                {!isCheckingUsername && usernameMessage && (
                                    <FieldDescription
                                        className={`text-xs ${
                                            usernameMessage.toLowerCase().includes("available")
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-neutral-500 dark:text-neutral-400"
                                        }`}
                                    >
                                        {usernameMessage}
                                    </FieldDescription>
                                )}
                                {fieldState.invalid && (
                                    <FieldError
                                        errors={[fieldState.error]}
                                        className="text-xs text-red-500 dark:text-red-400 font-normal"
                                    />
                                )}
                            </Field>
                        )}
                    />

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

                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    Password
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter a password"
                                    autoComplete="new-password"
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
                        {isLoading ? "Signing up…" : "Sign up"}
                    </button>
                </form>

                <div className="text-center mt-7">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Already a member?{' '}
                        <Link href="/login" className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-neutral-600 dark:hover:text-neutral-400">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}