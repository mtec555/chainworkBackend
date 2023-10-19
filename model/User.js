import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GalleryItemSchema = new Schema({
  publicId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  companyname: {
    type: String,
  },
  freelancerTitle: {
    type: String,
  },
  freelancerDes: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  role: {
    type: String,
    enum: ["buyer", "freelancer"], // Specify possible roles
    default: "buyer", // Set the default role to "buyer"
    required: true,
  },
  skills: [
    {
      type: String,
    },
  ],
  bio: String,
  hourlyRate: {
    type: String,
    default: "0.00",
  },
  responseTime: {
    type: String,
    default: "0.00",
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job", // Reference to the Job model
    },
  ],
  totalSpent: {
    type: Number,
    default: 0,
  },
  totalHired: {
    type: String,
    default: "0",
  },
  jobsCompleted: {
    type: String,
    default: "0",
  },
  phoneNumber: {
    type: String,
  },
  fcmToken: {
    type: String,
    default: "",
  },
  languages: [String],
  workHours: {
    type: String,
    default: "0.00",
  },
  country: {
    type: String,
    default: "Add Country",
  },
  profilImage: {
    type: String,
    default:
      "https://res.cloudinary.com/dirfoibin/image/upload/v1692959666/v1yzsrscplo3klmsmldp.png",
  },
  companyImage: {
    type: String,
    default:
      "https://res.cloudinary.com/dirfoibin/image/upload/v1692959666/v1yzsrscplo3klmsmldp.png",
  },
  postedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
});

export const User = mongoose.model("User", userSchema);
