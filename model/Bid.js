import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bidSchema = new Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job", // Reference to the Job model
    required: true,
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  bidPrice: {
    type: Number,
    required: true,
  },
  totalPriceAfterFee: {
    type: Number,
    required: true,
  },
  deductionPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "accept"], // Specify bid status
    default: "pending", // Set the default status to "sent"
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date
  },
  submittedAt: String,
  projectTimePeriod: String,
  additionalInfo: String,
});

export const Bids = mongoose.model("Bid", bidSchema);
