// import express from 'express'
// import { applyForJob, createUser, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'
// import upload from '../config/multer.js'
// // import { clerkAuth, clerkUserContext } from './clerkMiddleware.js';
// // import { clerkAuth } from '../middleware/clerkMiddleware.js';
// // import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
// import { clerkMiddleware, requireAuth } from '@clerk/express';


// const router = express.Router()

// // Apply Clerk middleware globally
// router.use(clerkMiddleware());

// // get userData
// router.get('/user',getUserData)

// // Apply for a job
// router.post('/apply',applyForJob)

// // Get Applied jobs data
// router.get('/applications',getUserJobApplications)

// // update user profile (resume)
// router.post('/update-resume',upload.single('resume') , updateUserResume)

// // user creation
// router.post('/create', createUser);

// // user data to recheck

// // // Protect all user routes
// // router.get('/user', clerkAuth, getUserData);
// // router.post('/create', clerkAuth, createUser);
// // router.post('/apply', clerkAuth, applyForJob);
// // router.get('/applications', clerkAuth, getUserJobApplications);
// // router.post('/update-resume', clerkAuth, upload.single('resume'), updateUserResume);

// export default router

// exp....
import express from 'express';
import {
    applyForJob,
    createUser,
    getUserData,
    getUserJobApplications,
    updateUserResume
} from '../controllers/userController.js';
import upload from '../config/multer.js';
import { clerkMiddleware, requireAuth } from '@clerk/express';

const router = express.Router();

// Apply Clerk middleware globally
router.use(clerkMiddleware());

// get user data
router.get('/user', getUserData);

// Apply for a job
router.post('/apply', applyForJob);

// Get applied jobs data
router.get('/applications', getUserJobApplications);

// update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume);

// user creation
router.post('/create', createUser);

export default router;
