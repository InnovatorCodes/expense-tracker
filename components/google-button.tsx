"use client";

import { googleAuthenticate } from "@/actions/google-signin";
import { useActionState } from "react";
import { FcGoogle} from 'react-icons/fc';
import { Button } from "./ui/button";

export const GoogleLogin=()=>{
    const [errorMsgGoogle, dispatchGoogle]=useActionState(googleAuthenticate,undefined);
    return (
        <form action={dispatchGoogle}>
            <Button 
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 hover:cursor-pointer border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <FcGoogle /> Sign In with Google
            </Button>
            <p>{errorMsgGoogle}</p>
        </form>
    )
}