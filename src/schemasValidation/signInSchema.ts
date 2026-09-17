import { z } from 'zod'

export const signInValidation = z.object({
    identifier: z.string().min(1, { message: "Email or Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
})