import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

export const clerkAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY, // Add this line
  onError: (error) => {
    throw new Error("Authentication required");
  },
});