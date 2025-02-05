import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
// import { clerkWebhooks } from './controllers/webhooks.js'
// import { handleClerkWebhook } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'
import { handleClerkWebhook } from './controllers/webhooks.js'


// initialize express
const app= express()

// connect to database
await connectDB()
await connectCloudinary()

//middlewares
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

//routes
app.get('/', (req,res)=>res.send("API working"))
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });
app.post('/webhooks', handleClerkWebhook)
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users', userRoutes)

// exp
app.use((req, res, next) => {
  console.log("Clerk auth object:", req.auth);
  next();
});

// //port
// const PORT = process.env.PORT || 5000

// Sentry.setupExpressErrorHandler(app);

// app.listen(PORT , ()=>{
//     console.log(`server is running on port ${PORT}`)
// })
// Async function to start server
const startServer = async () => {
  try {
      await connectDB();          // Connect to MongoDB
      await connectCloudinary();  // Connect to Cloudinary

      const PORT = process.env.PORT || 5000;
      Sentry.setupExpressErrorHandler(app);

      app.listen(PORT, () => {
          console.log(` Server is running on port ${PORT}`);
      });
  } catch (error) {
      console.error(" Server failed to start:", error);
      process.exit(1); // Exit process with failure
  }
};

// Start the server
startServer();

export default app;