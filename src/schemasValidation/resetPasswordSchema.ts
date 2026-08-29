import { z } from 'zod'; 


export const resetAPasswordValidation = z.object({
    password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
}); 
