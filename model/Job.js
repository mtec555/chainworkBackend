import mongoose from "mongoose";
import { Bids } from "./Bid.js";
const Schema = mongoose.Schema;

const jobSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  specialty: String,

  estimateTime: String,
  budget: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projectPdf: [
    {
      type: String,
    },
  ],
  projectPdf: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
  },
  skills: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid", // Reference to the Bid model
    },
  ],
  status: {
    type: String,
    default: "No Hire", // You can set an initial status
  },
});

export const Job = mongoose.model("Job", jobSchema);
