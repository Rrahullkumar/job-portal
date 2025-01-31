import mongoose from "mongoose";

//Function to connect with MongoDB database 
const connectDB = async() =>{

    mongoose.connection.on('connected', ()=> console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`)

}

export default connectDB