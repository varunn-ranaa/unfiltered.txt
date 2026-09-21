"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInValidation } from "@/schemasValidation/signInSchema"
import { useForm, Controller } from "react-hook-form"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { Suspense } from "react"


const SIGN_IN_ERROR_MESSAGES: Record<string, string> = {
    invalid_input: "Please enter a valid email/username and password",
    user_not_found: "No account found with that email/username",
    unverified_user: "Please verify your email before logging in",
    invalid_password: "Incorrect password",
    no_password_set: "This account uses Google sign-in. Use Signin with Google, or set a password via Forgot Password.",
    CredentialsSignin: "Invalid credentials",
    Configuration: "Something went wrong. Try again.",
    account_exists: "An account with this email already exists. Please log in with your password.",
    google_email_not_verified: "Please verify you google email first",
    no_email_from_google: "Google didn't share an email with us. Please try again or use manual sign-in.",
    account_exists_but_not_verified: "An account with this email exists but isn't verified yet. Please check your email for the verification code.",
}



export default function SignInForm() {

    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const error = searchParams.get("error")
        if (error) {
            const message = SIGN_IN_ERROR_MESSAGES[error] ?? "Something went wrong signing in with Google."
            toast.add({ type: "error", description: message, priority: "high" })
            router.replace("/login")
        }
    }, [searchParams, router])

    const form = useForm<z.infer<typeof signInValidation>>({
        resolver: zodResolver(signInValidation),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signInValidation>) => {
        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                redirect: false,
                identifier: data.identifier,
                password: data.password,
            })
            if (result?.error) {
                const specficCode = (result as { code: string }).code
                const message = SIGN_IN_ERROR_MESSAGES[specficCode ?? result.error] ?? "Invalid credentials"
                toast.add({ type: "error", description: message, priority: "high" })
            } else if (result?.url) {
                toast.add({ type: "success", description: `Welcome, ${data.identifier}` })
                router.replace('/dashboard')
                router.refresh()
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

    const onGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
        await signIn('google', { callbackUrl: '/dashboard' })
    } finally {
        setIsGoogleLoading(false)
    }
}

    return (
        <div className="flex justify-center items-center h-screen bg-neutral-100 dark:bg-neutral-950 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-8px_rgba(0,0,0,0.5)]">
                <div className="mb-8 text-center">
                    <h1 className="font-serif text-[2.5rem] leading-none tracking-tight text-neutral-900 dark:text-neutral-50">
                        Unfiltered.txt
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                        Start your secret conversations
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
                        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
                    </svg>
                    {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
                </button>

                <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">or</span>
                    <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    <Controller
                        name="identifier"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
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
                                    autoComplete="current-password"
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

                    <div className="text-right -mt-2">
                        <Link href="/forgot-password" className="text-xs text-neutral-500 dark:text-neutral-400 underline underline-offset-4 hover:text-neutral-700 dark:hover:text-neutral-200">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium tracking-wide transition-colors duration-150 hover:bg-neutral-700 dark:hover:bg-neutral-300 active:bg-neutral-950 dark:active:bg-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <div className="text-center mt-7">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        No account?{' '}
                        <Link href="/signup" className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-neutral-600 dark:hover:text-neutral-400">
                            Create
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}