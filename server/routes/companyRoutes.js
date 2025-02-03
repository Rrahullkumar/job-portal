import express from 'express'
import { changeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router= express.Router()

// Register a company
router.post('/register',upload.single('image'), registerCompany)

// Company Login
router.post('/login',loginCompany)

// Get company Data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany, postJob)

// get applicants data of company
router.get('/applicants', protectCompany, getCompanyJobApplicants)

// get company job list 
router.get('/list-jobs',protectCompany, getCompanyPostedJobs)

// change application status
router.post('/change-status',protectCompany, changeJobApplicationsStatus)

// change applications visiblity
router.post('/change-visiblity', protectCompany, changeVisiblity)



export default router