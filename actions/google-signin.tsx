"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function googleAuthenticate(){
    try{
        await signIn('google',
            {
                redirectTo: '/dashboard',
            }
        );
    }
    catch(error){
        if(error instanceof AuthError){
            return 'Google Sign In Failed';
        }
        throw error;
    }
}