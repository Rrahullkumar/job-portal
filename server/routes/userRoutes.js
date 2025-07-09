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

// exp..........
// import express from 'express';
// import {
//     applyForJob,
//     createUser,
//     getUserData,
//     getUserJobApplications,
//     updateUserResume
// } from '../controllers/userController.js';
// import upload from '../config/multer.js';
// import { clerkMiddleware, requireAuth } from '@clerk/express';

// const router = express.Router();

// // Apply Clerk middleware globally
// router.use(clerkMiddleware());

// // get user data
// router.get('/user', getUserData);

// // Apply for a job
// router.post('/apply', applyForJob);

// // Get applied jobs data
// router.get('/applications', getUserJobApplications);

// // update user profile (resume)
// router.post('/update-resume', upload.single('resume'), updateUserResume);

// // user creation
// router.post('/create', createUser);

// export default router;

// 8-3-25
import express from 'express';
import {
    applyForJob,
    createUser,
    getUserData,
    getUserJobApplications,
    updateUserResume
} from '../controllers/userController.js';
import upload from '../config/multer.js';
import { clerkClient } from '@clerk/express';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Custom authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify the token with Clerk
        const user = await clerkClient.verifyToken(token);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }

        // Attach user info to request
        req.userId = user.sub; // Clerk user ID
        req.user = user;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
};

// Protected routes
router.get('/user', requireAuth(), getUserData);
router.post('/apply', requireAuth(), applyForJob);
router.get('/applications', requireAuth(), getUserJobApplications);
router.post('/update-resume', requireAuth(), upload.single('resume'), updateUserResume);

// Public route (no authentication needed for initial user creation)
router.post('/create', requireAuth(), createUser);

export default router;