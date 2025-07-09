import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import NavBar from '../components/NavBar'
import kconvert from 'k-convert'
import moment from 'moment'
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'

const ApplyJob = () => {

  const { id } = useParams()

  const { getToken } = useAuth()
  const { user, isLoaded } = useUser() // Add isLoaded to check if user data is ready

  const navigate = useNavigate()

  const [jobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(null)

  const { jobs, backendUrl, userData, userApplications, fetchUserApplications, fetchUserData } = useContext(AppContext)

  const fetchJob = async () => {

    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)

      if (data.success) {
        setJobData(data.job)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyHandler = async () => {
    try {

      // Check if Clerk user is loaded first
      if (!isLoaded) {
        return toast.error('Please wait, loading user data...')
      }

      // Check if user is authenticated via Clerk
      if (!user) {
        return toast.error('Please login to apply for jobs')
      }

      // Check if userData from context is available
      if (!userData || Object.keys(userData).length === 0) {
        // Try to fetch user data if it's not available
        console.log('User data not available, attempting to fetch...')
        await fetchUserData()
        
        // If still not available after fetch attempt, show error
        if (!userData || Object.keys(userData).length === 0) {
          return toast.error('Unable to load user profile. Please try again.')
        }
      }

      if (!userData?.resume) {
        navigate('/applications')
        return toast.error('Upload Resume to apply')
      }

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/users/apply',
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserApplications()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error('Apply handler error:', error)
      toast.error(error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(item => item.jobId._id === jobData._id)
    setIsAlreadyApplied(hasApplied)

  }

  useEffect(() => {
    fetchJob(); // Ensure ID is clean
  }, [id]);

  useEffect(() => {
    if (userApplications.length > 0 && jobData) {
      checkAlreadyApplied()
    }
  }, [jobData, userApplications, id])

  // Add debug logging
  useEffect(() => {
    console.log('User from Clerk:', user)
    console.log('User data from context:', userData)
    console.log('Is Clerk loaded:', isLoaded)
  }, [user, userData, isLoaded])

  return jobData ? (
    <>
      <NavBar />
      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-ful'>
          <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl'>
            <div className='flex flex-col md:flex-row items-center '>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border border-transparent' src={jobData.companyId.image} />
              <div className='text-center md:text-left text-neutral-700 '>
                <h1 className='text-2xl sm:text-4xl font-medium '>{jobData.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img src={assets.suitcase_icon} />
                    {jobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
              <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded hover:cursor-pointer hover:bg-blue-700'>{isAlreadyApplied ? 'Already Applied' : 'Apply Now'}</button>
              <p className='mt-1 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p>
            </div>

          </div>

          <div className='flex flex-col lg:flex-row justify-between items-start'>
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4 '>Job Description</h2>
              <div className='rich-text' dangerouslySetInnerHTML={{ __html: jobData.description }}></div>
              <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded hover:cursor-pointer hover:bg-blue-700 mt-10'>{isAlreadyApplied ? 'Already Applied' : 'Apply Now'}</button>
            </div>
            {/* Right Section More jobs */}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 space-y-5'>
              <h2>More jobs from {jobData.companyId.name}</h2>
              {jobs.filter(job => job._id !== jobData._id && job.companyId._id === jobData.companyId._id)
                .filter(job => {
                  // Set of Applied jobIds
                  const appliedJobsIds = new Set(userApplications.map(app => app.jobId && app.jobId._id))
                  // Return true if the User has not already applied for this job
                  return !appliedJobsIds.has(job._id)
                }).slice(0, 4)
                .map((job, index) => <JobCard key={index} job={job} />)}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob