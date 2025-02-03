import express from 'express'
import { applyForJob, createUser, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'
import upload from '../config/multer.js'
// import { clerkAuth, clerkUserContext } from './clerkMiddleware.js';
import { clerkAuth } from '../middleware/clerkMiddleware.js';

const router = express.Router()

// get userData
router.get('/user',getUserData)

// Apply for a job
router.post('/apply',applyForJob)

// Get Applied jobs data
router.get('/applications',getUserJobApplications)

// update user profile (resume)
router.post('/update-resume',upload.single('resume') , updateUserResume)

// user creation
router.post('/create', createUser);

// user data to recheck
router.get('/user', clerkAuth, getUserData);

export default router