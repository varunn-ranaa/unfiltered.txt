import {z} from 'zod'

export const acceptMessageValidation = z.object({
    acceptMessage : z.boolean()
})