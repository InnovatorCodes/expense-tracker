"use server";

import * as z from "zod/v4";
import { prisma} from "@/prisma/prisma";
import bcrypt from 'bcryptjs'
import { signUpSchema } from "@/schemas/authentication-schema";


export const signUp = async(data: z.infer<typeof signUpSchema>)=>{
    try{
        const validatedData=signUpSchema.parse(data);

        if(!validatedData){
            return { error: "Invalid Input Data"};
        }
        const { email, name, password, passwordConfirmation}= validatedData;
        if(password !== passwordConfirmation){
            return {error: "Passwords do not match"}
        }
        const hashedPassword= await bcrypt.hash(password, 10);
        const userExists= await prisma.user.findFirst({
            where: {
                email
            }
        })
        if(userExists) return { error: "User already exists"};
        const lowerCaseEmail =email.toLowerCase();
        const user=await prisma.user.create({
            data: {
                email: lowerCaseEmail,
                password: hashedPassword,
                name
            }
        })
        return { success: "User created successfully"}
        console.log(user.name);
    }
    catch(error){
        console.log(error)
        return {error: "An error occurred"};
    }
}