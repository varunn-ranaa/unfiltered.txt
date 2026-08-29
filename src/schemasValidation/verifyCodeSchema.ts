import {z} from 'zod'

export const verifyValidation = z.object({
    code : z.string().min(6,{message : 'Code must be of 6 digits'})
})