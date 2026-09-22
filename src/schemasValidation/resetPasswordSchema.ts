import { z } from 'zod'; 


export const resetPasswordValidation =  z.object(
      {
              code: z.string().length(6, `Code must be 6 digits`),
              newpassword: z.string()
                  .min(6, { message: "Password must be at least 6 characters long" })
                  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" }),
      })
