// import jwt from 'jsonwebtoken'
// import Company from '../models/Company.js'

// export const protectCompany= async (req,res,next)=>{

//     const token= req.headers.token

//     if (!token) {
//         return res.json({success:false, message:'Not authorized, Login again'})
//     }

//     try {
        
//         const decoded= jwt.verify(token, process.env.JWT_SECRET)

//         req.company= await Company.findById(decoded.id).select('-password')

//         next()

//     } catch (error) {
//         res.json({success:false, message:error.message})
//     }

// }

// exp...
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import express from 'express';

const app = express();

// Apply Clerk middleware globally
app.use(clerkMiddleware());

// Middleware to protect company routes
export const protectCompany = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, Login again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.company = await Company.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Middleware to protect user routes using Clerk
export const protectUser = (req, res, next) => {
    requireAuth()(req, res, next);
};

// Legacy requireAuth to emit an error rather than redirecting
export const legacyRequireAuth = (req, res, next) => {
    if (!req.auth?.userId) {
        return next(new Error('Unauthenticated'));
    }
    next();
};

