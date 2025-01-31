import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";


// Create the Context
export const AppContext = createContext();

// Create the Context Provider
export const AppContextProvider = (props) => {

    const [searchFilter,setSearchFilter]= useState({
        title:'',
        location:''
    })

    const [isSearched,setIsSearched]= useState(false)

    const[jobs,setJobs]= useState([])

    const[showRecruiterLogin,setShowRecruiterLogin]= useState(false)

    //Function to fetch job data
    const fetchJobs= async()=>{
        setJobs(jobsData)
    }

    useEffect(()=>{
        fetchJobs()
    },[])

    // Define your context value
    const value = {
        setSearchFilter,searchFilter,
        isSearched, setIsSearched,
        jobs,setJobs,
        showRecruiterLogin, setShowRecruiterLogin
    };

    return (
        // Use AppContext.Provider here
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
