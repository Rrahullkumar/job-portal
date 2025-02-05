import Job from "../models/job.js"
import mongoose from "mongoose";


//  get all jobs
export const getJobs = async (req,res) => {
    try {
        
        const jobs = await Job.find({ visible:true })
        .populate({path: 'companyId',select:'-password'})

        res.json({success:true, jobs})

    } catch (error) {
        res.json({success:false, messsage:error.message})
    }
}

// get a single job by id

// export const getJobById = async (req,res) => {
//     try {
        
//         const {id} = req.params

//         const job = await Job.findById(id)
//         .populate({
//             path:'companyId',
//             select: '-password'
//         })

//         if (!job) {
//             return res.json({
//                 success:false,
//                 message: 'Job not found'
//             })
//         }

//         res.json({
//             success:true,
//             job
//         })

//     } catch (error) {
//         res.json({success:false, message:error.message})
//     }
// }

// exp

export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Job ID" });
        }

        const job = await Job.findById(id).populate({ path: "companyId", select: "-password" });

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        res.json({ success: true, job });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
