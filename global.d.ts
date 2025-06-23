// global.d.ts
// This file declares global variables that might be injected by the runtime environment (e.g., Canvas).
// It helps TypeScript (and your IDE) recognize these variables and prevent "not declared" errors.

// Declare the __app_id global variable
declare const __app_id: string | undefined;

// Declare the __firebase_config global variable
// It's expected to be a JSON string, so we type it as string or undefined.
declare const __firebase_config: string | undefined;

// You can add other global variables here if your environment injects them
// For example, if you were using __initial_auth_token:
// declare const __initial_auth_token: string | undefined;
