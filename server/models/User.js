import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "/default-avatar.png"
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
