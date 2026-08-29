import {z} from 'zod'

export const messageValidation = z.object({
    content : z.string()
    .min(2,{message : 'message must be of 2 character'})
    .max(300,{message : 'message must be under 300 character'})
})