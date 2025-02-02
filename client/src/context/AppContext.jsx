import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";


// Create the Context
export const AppContext = createContext();

// Create the Context Provider
export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [searchFilter,setSearchFilter]= useState({
        title:'',
        location:''
    })

    const [isSearched,setIsSearched]= useState(false)

    const[jobs,setJobs]= useState([])

    const[showRecruiterLogin,setShowRecruiterLogin]= useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    //Function to fetch job data
    const fetchJobs= async()=>{
        setJobs(jobsData)
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
