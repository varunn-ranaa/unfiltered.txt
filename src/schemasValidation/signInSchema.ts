import {z} from 'zod'

export const signUpValidation = z.object({
    identifier : z.string(),
    password : z.string()
})