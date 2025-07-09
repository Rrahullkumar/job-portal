import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/express";

app.use(auth());

export const clerkAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  onError: (error) => {
      throw new Error("Authentication required");
  },
});

// Debugging log
app.use((req, res, next) => {
  console.log("Clerk Auth Data:", req.auth);
  next();
});
