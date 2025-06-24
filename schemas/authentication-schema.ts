import * as z from 'zod/v4'

export const signUpSchema= z.object({
    name: z.string().max(50, "Name must not exceed 50 characters"),
    email: z.email(),
    password: z.string().min(6,"Password must be atleast 6 characters long").max(20,"Password must not exceed 20 characters"),
    passwordConfirmation: z.string().min(6,"Password must be atleast 6 characters long").max(20,"Password must not exceed 20 characters"),
})

export const loginSchema= z.object({
    email: z.email(),
    password: z.string().min(6,"Password must be atleast 6 characters long"),
})