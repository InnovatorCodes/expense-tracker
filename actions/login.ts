"use server";

import * as z from 'zod/v4';
import { loginSchema } from '@/schemas/index';
import { prisma } from '@/prisma/prisma';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export const login= async (data: z.infer<typeof loginSchema>)=>{
    const validatedData=loginSchema.parse(data);
    if(!validatedData){
        return {error: "Invalid Credentials Provided"};
    }
    const {email, password}=validatedData;
    const userExists=await prisma.user.findFirst({
        where:{
            email:email
        },
    });

    if(!userExists) return { error: "User Not Found"};
    else if(!userExists.password || !userExists.email) return {error: "It looks like you signed up with Google. Please try logging in with your Google account instead."};
    
    try {
        await signIn("credentials", {
            email: userExists.email,
            password: password,
            redirectTo: "/dashboard"
        })
    }
    catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case "CredentialsSignin":
                    return {error: "Invalid Credentials"};
                default: 
                    return{error: "Confirm your Email Address"};
            }
        }
        throw(error);
    }
    return { success: "User logged in successfully!"};
}