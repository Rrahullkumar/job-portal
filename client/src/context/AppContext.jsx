import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";


// Create the Context
export const AppContext = createContext();

// Create the Context Provider
export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const {user} = useUser()
    const {getToken}= useAuth()

    const [searchFilter,setSearchFilter]= useState({
        title:'',
        location:'',
    })

    const [isSearched,setIsSearched]= useState(false)

    const[jobs,setJobs]= useState([])

    const[showRecruiterLogin,setShowRecruiterLogin]= useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const[userData, setUserData] = useState(null)
    const[userApplications, setUserApplications] = useState([])

    //Function to fetch job data
    const fetchJobs= async()=>{
        try {

            const{data} = await axios.get(backendUrl+ '/api/jobs')

            if (data.success) {
                setJobs(data.jobs)
                console.log(data.jobs)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
        // setJobs(jobsData)
    }

    // Function to fetch Company Data
    const fetchCompanyData = async () => {
        try {
            
            const{data} = await axios.get(backendUrl + '/api/company/company', {headers:{token:companyToken}})

            if (data.success) {
                setCompanyData(data.company)
                console.log(data)
            } else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch user data
    const fetchUserData = async ()=>{
        try {

            const token = await getToken();

            const { data }= await axios.get(backendUrl+ '/api/users/user',
                {headers:{Authorization:`Bearer ${token}`},})

                if (data.success) {
                    setUserData(data.user);
                } else if (data.message === 'User Not Found') {
                    // Create user if not found
                    const createResponse = await axios.post(
                        backendUrl + '/api/users/create',
                        {
                            userId: user.id,
                            name: user.fullName,
                            email: user.primaryEmailAddress?.emailAddress,
                            image: user.imageUrl,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
        
                    if (createResponse.data.success) {
                        setUserData(createResponse.data.user);
                    } else {
                        toast.error(createResponse.data.message);
                    }
                } else {
                    toast.error(data.message);
                }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchJobs()

        const storedCompanyToken = localStorage.getItem('companyToken')

        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken)
        }

    },[])

    useEffect(()=>{
        if (companyToken) {
            fetchCompanyData()
        }
    },[companyToken])

    useEffect(()=>{
        if (user) {
            fetchUserData()
        }
    },[user])

    // Define your context value
    const value = {
        setSearchFilter,searchFilter,
        isSearched, setIsSearched,
        jobs,setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken,setCompanyToken,
        companyData,setCompanyData,
        backendUrl
    };

    return (
        // Use AppContext.Provider here
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
