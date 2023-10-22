import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectSchema = new Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job", // Reference to the Job model
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (freelancer)
    required: true,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer", // Reference to the Offer model
    required: true,
  },
  projectStatus: {
    type: String,
    enum: ["Submitted", "UnderReview", "Completed", "Rejected", "Progress"],
    default: "Progress", // Set an initial status
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  projectDetails: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submission: {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User who submitted the work
    },
    submittedAt: {
      type: Date, // Timestamp of when the work was submitted
    },
    projectPdf: [],
    reviewStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    revisionDetails: {
      type: String,
    },
    reviewFeedback: {
      type: String, // Feedback from the buyer on the submitted work
    },
  },
});

export const Project = mongoose.model("Project", projectSchema);
