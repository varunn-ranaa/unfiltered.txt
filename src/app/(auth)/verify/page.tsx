"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import axios, { AxiosError } from "axios"
import { verifyValidation } from "@/schemasValidation/verifyCodeSchema"
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
import { Suspense } from "react"


const OTP_LENGTH = 6

export default function VerifyCodeForm() {

    const params = useSearchParams()
    const username = params.get('username')

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    const form = useForm<z.infer<typeof verifyValidation>>({
        resolver: zodResolver(verifyValidation),
        defaultValues: {
            code: ''
        }
    })


    const onSubmit = async () => {
        setIsLoading(true)
        try {
            await axios.post<APIresponse>('/api/verify', {
                username,
                otp: form.getValues().code
            })
            toast.add({
                type: "success",
                description: "Email verified Successfully !"
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
        <Suspense fallback={<div>Loading…</div>}>
        <div className="flex justify-center items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-8px_rgba(0,0,0,0.5)]">
                <div className="mb-8 text-center">
                    <h1 className="font-serif text-[2.5rem] leading-none tracking-tight text-neutral-900 dark:text-neutral-50">
                        Unfiltered.txt
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                        Verify your email !
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
        </Suspense>
    )
}