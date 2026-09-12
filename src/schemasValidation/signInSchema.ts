import {z} from 'zod'

export const signInValidation = z.object({
    identifier : z.string(),
    password : z.string()
})