import Job from "../models/job.js";
import jobApplication from "../models/jobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';

// Get user data
export const getUserData = async (req, res) => {
    console.log("Clerk auth data:", req.auth);

    const userId = req.auth.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        let user = await User.findById(userId);

        if (!user) {
            console.log(`User not found in DB: ${userId}. Creating user...`);

            // Create user with Clerk data
            user = await User.create({
                _id: userId,
                name: `${req.auth.firstName} ${req.auth.lastName || ""}`,
                email: req.auth.primaryEmailAddress || "unknown@example.com",
                image: req.auth.imageUrl || "default-image-url",
                resume: "", // Optional
            });

            console.log("User created successfully:", user);
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error in getUserData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create user
export const createUser = async (req, res) => {
    const { userId, name, email, image } = req.body;

    if (!userId || !email) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const existingUser = await User.findById(userId);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const newUser = new User({
            _id: userId,
            name: name || "New User",
            email,
            image: image || "/default-avatar.png",
            resume: ""
        });

        await newUser.save();
        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply for a job
export const applyForJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.auth.userId;

    if (!jobId || !userId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const isAlreadyApplied = await jobApplication.find({ jobId, userId });

        if (isAlreadyApplied.length > 0) {
            return res.status(409).json({ success: false, message: 'Already Applied' });
        }

        const jobData = await Job.findById(jobId);

        if (!jobData) {
            return res.status(404).json({ success: false, message: 'Job Not Found' });
        }

        await jobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        });

        res.json({ success: true, message: 'Applied Successfully' });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user applied applications
export const getUserJobApplications = async (req, res) => {
    const userId = req.auth.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const applications = await jobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec();

        if (applications.length === 0) {
            return res.status(404).json({ success: false, message: 'No job applications found for this user' });
        }

        res.json({ success: true, applications });
    } catch (error) {
        console.error('Error getting user job applications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user profile (resume)
export const updateUserResume = async (req, res) => {
    const userId = req.auth.userId;
    const resumeFile = req.file;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const userData = await User.findById(userId);

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path);
            userData.resume = resumeUpload.secure_url;
        }

        await userData.save();

        res.json({ success: true, message: 'Resume Updated' });
    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
