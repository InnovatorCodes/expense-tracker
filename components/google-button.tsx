"use client";

import { useActionState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { googleAuthenticate } from "@/actions/google-signin";
import { FormError } from "@/components/form-error";
import { Button } from "./ui/button";

export const GoogleLogin = ({ callbackUrl }: { callbackUrl?: string }) => {
  const [error, dispatch, isPending] = useActionState(
    googleAuthenticate,
    undefined,
  );
  return (
    <form action={dispatch} className="space-y-3">
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle />
        )}
        Sign in with Google
      </Button>
      <FormError message={error} />
    </form>
  );
};
