"use client"

import { Suspense, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { APIresponse } from "@/types/apiResponse"
import { toast } from "@/components/ui/toast"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { resetPasswordValidation } from "@/schemasValidation/resetPasswordSchema"

const OTP_LENGTH = 6

function ResetVerifyCodeFormInner() {

    const params = useSearchParams()
    const username = params.get('username')

    const [isLoading, setIsLoading] = useState(false)

    const [confirmPassword, setConfirmPassword] = useState("")
    const [confirmError, setConfirmError] = useState<string | null>(null)

    const router = useRouter()

    const form = useForm<z.infer<typeof resetPasswordValidation>>({
        resolver: zodResolver(resetPasswordValidation),
        defaultValues: {
            code: '',
            newpassword: '',
        }
    })

    const onSubmit = async (data: z.infer<typeof resetPasswordValidation>) => {

        if (data.newpassword !== confirmPassword) {
            setConfirmError("Passwords do not match")
            return
        }
        setConfirmError(null)

        setIsLoading(true)
        try {
            await axios.post<APIresponse>('/api/password-resetcode-verify', {
                username,
                otp: data.code,
                newpassword: data.newpassword,
            })
            toast.add({
                type: "success",
                description: "Password reset successfully!"
            })
            router.replace('/login')
        } catch (error) {
            console.log("error in verify :", error)
            const axiosError = error as AxiosError<APIresponse>
            const errorMessage = axiosError.response?.data.message ?? "Failed to verify !"
            toast.add({
                type: "error",
                description: errorMessage,
                priority: "high"
            })
        }
        finally {
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
                        Verify your email! check the spam folder too.
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    <Controller
                        name="code"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    Enter the Code
                                </FieldLabel>
                                <InputOTP
                                    maxLength={OTP_LENGTH}
                                    value={field.value}
                                    onChange={field.onChange}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup className="gap-2">
                                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="h-12 w-12 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-lg font-medium data-[active=true]:ring-2 data-[active=true]:ring-neutral-900/10 dark:data-[active=true]:ring-neutral-100/10 data-[active=true]:border-neutral-900 dark:data-[active=true]:border-neutral-100 aria-[invalid=true]:border-red-400 dark:aria-[invalid=true]:border-red-500"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                                {fieldState.invalid && (
                                    <FieldError
                                        errors={[fieldState.error]}
                                        className="text-xs text-red-500 dark:text-red-400 font-normal"
                                    />
                                )}
                            </Field>
                        )
                        }
                    />

                    <Controller
                        name="newpassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    New Password
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

                    <Field data-invalid={!!confirmError}>
                        <FieldLabel
                            htmlFor="confirm-password"
                            className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                        >
                            Confirm Password
                        </FieldLabel>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                if (confirmError) setConfirmError(null)
                            }}
                            aria-invalid={!!confirmError}
                            placeholder="Enter a password"
                            autoComplete="new-password"
                            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-3 py-2 focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:focus-visible:ring-neutral-100/10 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 transition-colors data-[invalid=true]:border-red-400 dark:data-[invalid=true]:border-red-500"
                        />
                        {confirmError && (
                            <p className="text-xs text-red-500 dark:text-red-400 font-normal">
                                {confirmError}
                            </p>
                        )}
                    </Field>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium tracking-wide transition-colors duration-150 hover:bg-neutral-700 dark:hover:bg-neutral-300 active:bg-neutral-950 dark:active:bg-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function ResetVerifyCodeForm() {
    return (
        <Suspense fallback={<div>Loading…</div>}>
            <ResetVerifyCodeFormInner />
        </Suspense>
    )
}