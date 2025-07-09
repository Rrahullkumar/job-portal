import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

// Create the Context
export const AppContext = createContext();

// Create the Context Provider
export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const { user, isLoaded } = useUser()
    const { getToken, sessionId } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: '',
    })

    const [isSearched, setIsSearched] = useState(false)

    const [jobs, setJobs] = useState([])

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])
    const [isLoadingUserData, setIsLoadingUserData] = useState(false)
    const [authError, setAuthError] = useState(false); // ✅ ADD THIS


    // Helper function to create authenticated axios instance
    const createAuthenticatedRequest = async () => {
        const token = await getToken();

        if (!token) {
            throw new Error("Auth token is not available yet");
        }

        return axios.create({
            baseURL: backendUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

    };

    //Function to fetch job data
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/jobs')

            if (data.success) {
                setJobs(data.jobs)
                // console.log(data.jobs)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch Company Data
    const fetchCompanyData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/company', { headers: { token: companyToken } })

            if (data.success) {
                setCompanyData(data.company)
                // console.log(data)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch user data
    const fetchUserData = async () => {
        console.log('=== fetchUserData called ===')
        console.log('User:', user)
        console.log('isLoaded:', isLoaded)
        console.log('backendUrl:', backendUrl)

        if (!user || !isLoaded) {
            console.log('User not loaded yet or not available')
            return
        }

        if (isLoadingUserData) {
            console.log('Already loading user data')
            return
        }

        try {
            setIsLoadingUserData(true)
            console.log('Getting authenticated request...')

            const authAxios = await createAuthenticatedRequest();

            console.log('Making request to: /api/users/user')

            // Fetch user data
            const { data } = await authAxios.get('/api/users/user');

            console.log('API Response:', data)

            if (data.success) {
                setUserData(data.user);
                console.log('User data set successfully:', data.user)
            } else if (data.message === "User Not Found") {
                console.log('User not found, creating new user...')
                console.log('User object from Clerk:', {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.primaryEmailAddress?.emailAddress,
                    imageUrl: user.imageUrl
                })

                // Create user in backend
                const createResponse = await authAxios.post('/api/users/create', {
                    userId: user.id,
                    name: user.fullName,
                    email: user.primaryEmailAddress?.emailAddress,
                    image: user.imageUrl,
                });

                console.log('Create user response:', createResponse.data)

                if (createResponse.data.success) {
                    setUserData(createResponse.data.user);
                    console.log('User created successfully:', createResponse.data.user)
                    toast.success("User created successfully!");
                } else {
                    console.error('Failed to create user:', createResponse.data.message)
                    toast.error(createResponse.data.message);
                }
            } else {
                console.error('API returned error:', data.message)
                toast.error(data.message);
            }
        } catch (error) {
            console.error('=== fetchUserData Error ===')
            console.error('Error object:', error)
            console.error('Error message:', error.message)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            console.error('Error config:', error.config)

            if (error.response?.status === 401) {
                setAuthError(true); // ✅ prevent infinite retry
                toast.error("Authentication failed. Please try logging in again.");
            } else if (error.response?.status === 404) {
                toast.error("User service not found. Please check backend connection.");
            } else if (error.response?.status === 500) {
                toast.error("Server error. Please try again later.");
            } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                toast.error("Cannot connect to server. Please check if the backend is running.");
            } else {
                toast.error(error.response?.data?.message || error.message || "An unexpected error occurred.");
            }
        } finally {
            setIsLoadingUserData(false)
        }
    };

    //Function to fetch user's applied application data
    const fetchUserApplications = async () => {
        if (!user || !isLoaded) {
            return
        }

        try {
            const authAxios = await createAuthenticatedRequest();

            const { data } = await authAxios.get('/api/users/applications')

            if (data.success) {
                setUserApplications(data.applications)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Error fetching user applications:', error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        fetchJobs()

        const storedCompanyToken = localStorage.getItem('companyToken')

        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken)
        }

    }, [])

    useEffect(() => {
        if (companyToken) {
            fetchCompanyData()
        }
    }, [companyToken])

    // Fetch user data when ready and not already loading
    useEffect(() => {
        // console.log('=== useEffect for user data ===')
        // console.log('user:', user)
        // console.log('isLoaded:', isLoaded)
        // console.log('userData:', userData)
        // console.log('isLoadingUserData:', isLoadingUserData)

        if (user && isLoaded && !userData && !isLoadingUserData && !authError) {
            // console.log('Conditions met, calling fetchUserData...')
            fetchUserData()
        }
    }, [user, isLoaded, userData, isLoadingUserData, authError])

    // Fetch applications after userData is loaded
    useEffect(() => {
        if (userData) {
            fetchUserApplications()
        }
    }, [userData])

    // Debug environment variables on first load
    useEffect(() => {
        // console.log('=== Environment Check ===')
        // console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL)
        // console.log('VITE_CLERK_PUBLISHABLE_KEY:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing')
        // console.log('Session ID:', sessionId)
    }, [])

    // Final context value and return
    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        isLoadingUserData,
        createAuthenticatedRequest
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
