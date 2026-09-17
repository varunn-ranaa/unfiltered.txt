import { z } from 'zod'; 


export const usernameValidation = z
  .string()
  .trim()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(20, { message: "Username cannot exceed 20 characters" })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "Username only contain letters, numbers, and underscores" }) 

export const signUpValidation = z.object({
  username: usernameValidation,
  
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }), 
    
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
});
