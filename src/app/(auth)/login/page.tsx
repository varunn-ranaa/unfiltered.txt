"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInValidation } from "@/schemasValidation/signInSchema"
import { useForm, Controller } from "react-hook-form"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"

const SIGN_IN_ERROR_MESSAGES: Record<string, string> = {
    invalid_input: "Please enter a valid email/username and password",
    user_not_found: "No account found with that email/username",
    unverified_user: "Please verify your email before logging in",
    invalid_password: "Incorrect password",
    CredentialsSignin: "Invalid credentials",
    Configuration: "Something went wrong. Try again.",
}



export default function SignInForm() {

    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof signInValidation>>({
        resolver: zodResolver(signInValidation),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signInValidation>) => {
         console.log("onSubmit fired with:", data)
        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                redirect: false,
                identifier: data.identifier,
                password: data.password
            })

            if (result?.error) {
                const specficCode  = (result as { code : string}).code
                const message = SIGN_IN_ERROR_MESSAGES[ specficCode ??  result.error] ?? "Invalid credentials"
                toast.add({ type: "error", description: message, priority: "high" })
            } else if (result?.url) {
                toast.add({ type: "success", description: `Welcome, ${data.identifier}` })
                router.replace('/dashboard')
            } else {
                toast.add({ type: "error", description: "Unexpected error. Try again.", priority: "high" })
            }
        } catch (error) {
            console.log("error in sign in :", error)
            toast.add({ type: "error", description: "Something went wrong. Try again.", priority: "high" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-neutral-100 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.10)]">
                <div className="mb-8 text-center">
                    <h1 className="font-serif text-[2.5rem] leading-none tracking-tight text-neutral-900">
                        Unfiltered.txt
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500">
                        Start your secret conversations
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    <Controller
                        name="identifier"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600"
                                >
                                    Email/Username
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="text"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter Email or Username"
                                    autoComplete="off"
                                    className="rounded-lg border border-neutral-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-900 transition-colors data-[invalid=true]:border-red-400"
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

                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600"
                                >
                                    Password
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter a password"
                                    autoComplete="current-password"
                                    className="rounded-lg border border-neutral-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-900 transition-colors data-[invalid=true]:border-red-400"
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 rounded-md bg-neutral-900 text-white text-sm font-medium tracking-wide transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <div className="text-center mt-7">
                    <p className="text-sm text-neutral-500">
                        No account?{' '}
                        <Link href="/signup" className="text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
                            Create
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
