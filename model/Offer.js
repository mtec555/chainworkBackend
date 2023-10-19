import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OfferSchema = new Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job", // Reference to the Job model
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (assuming a 'User' model for freelancers)
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (sender)
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  deadline: {
    type: String, // Store the deadline as a Date
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"], // You can define possible status values
    default: "Pending", // Set the default status to "Pending"
  },
});

export const Offer = mongoose.model("Offer", OfferSchema);
