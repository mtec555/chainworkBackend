import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import { Job } from "../model/Job.js";
import { Bids } from "../model/Bid.js";
import { Offer } from "../model/Offer.js";
import { Project } from "../model/Project.js";
import Message from "../model/Message.js";
import { Notification } from "../model/Notification.js";

cloudinary.v2.config({
  cloud_name: "dirfoibin",
  api_key: "315619779683284",
  api_secret: "_N7-dED0mIjUUa3y5d5vv2qJ3Ww",
});

// Get All Jobs with Case-Insensitive Filters
export const getAllJobs = catchAsyncError(async (req, res, next) => {
  try {
    const filters = req.query; // Get the query parameters from the request

    // Build the filter object based on the query parameters
    const filterObject = {};
    if (filters.category)
      filterObject.category = { $regex: new RegExp(filters.category, "i") };
    if (filters.title)
      filterObject.title = { $regex: new RegExp(filters.title, "i") };
    if (filters.specialty)
      filterObject.specialty = { $regex: new RegExp(filters.specialty, "i") };
    if (filters.skills) {
      const skillsArray = filters.skills.split(",").map((skill) => ({
        skills: { $regex: new RegExp(skill.trim(), "i") },
      }));
      filterObject.$or = skillsArray;
    }
    if (filters.type) filterObject.type = { $in: filters.type.split(",") }; // Convert CSV to array and filter
    if (filters.minBudget && filters.maxBudget) {
      filterObject.budget = {
        $gte: parseInt(filters.minBudget),
        $lte: parseInt(filters.maxBudget),
      };
    } else if (filters.minBudget) {
      filterObject.budget = {
        $gte: parseInt(filters.minBudget),
      };
    } else if (filters.maxBudget) {
      filterObject.budget = {
        $lte: parseInt(filters.maxBudget),
      };
    }

    const allJobs = await Job.find(filterObject).sort({ createdAt: -1 });

    res.json({ message: "All Jobs", jobs: allJobs });
  } catch (error) {
    next(error);
  }
});

// Get Single Job
export const getSingleJob = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id).populate("postedBy", "-password");
    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
});

// Submit Proposal
export const submitProposal = catchAsyncError(async (req, res, next) => {
  const {
    jobId,
    bidder,
    bidPrice,
    deductionPrice,
    totalPriceAfterFee,
    additionalInfo,
    projectTimePeriod,
    proposalPdf,
  } = req.body;

  // Check if the bidder exists
  const user = await User.findById(bidder);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if the job ID exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Check if the user who posted the job is the same as the bidder
  if (job.postedBy.toString() === bidder) {
    return next(new ErrorHandler("You cannot bid on your own job", 403));
  }

  // Check if the user has already submitted a bid for this job
  const existingBid = await Bids.findOne({ job: jobId, bidder });
  if (existingBid) {
    return next(new ErrorHandler("You have already applied to this job", 409));
  }

  // Capture the current date and time
  const currentDate = new Date();

  // Create a new bid
  const newBid = new Bids({
    job: jobId,
    bidder,
    bidPrice,
    totalPriceAfterFee,
    deductionPrice,
    additionalInfo,
    projectTimePeriod,
    proposalPdf,
    submittedAt: currentDate,
  });

  // Save the bid
  await newBid.save();

  // Add the bid to the job's bids array
  job.bids.push(newBid);
  await job.save();

  res.status(201).json({
    success: true,
    message: "Bid submitted successfully",
    bid: newBid,
  });
});

// Get Single Proposal with Job Details
export const getSingleProposal = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the proposal by ID and populate the 'job' field
    const proposal = await Bids.findById(id).populate("job");

    if (!proposal) {
      return next(new ErrorHandler("Proposal not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Proposal fetched successfully",
      proposal,
    });
  } catch (error) {
    next(error);
  }
});

// Get All Proposals by Freelancer
export const getAllProposals = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params; // Get the freelancer's ID from the request parameters

    const proposals = await Bids.find({ bidder: id })
      .populate("job") // Populate the 'job' field to get complete job details
      .exec();

    res.json({ message: "All Proposals", proposals });
  } catch (error) {
    next(error);
  }
});

// Accept Job Offer
export const acceptOffer = catchAsyncError(async (req, res, next) => {
  const { offerId, jobId, freelancerId, buyerId, projectDetails } = req.body;

  // Find the offer by ID
  const offer = await Offer.findById(offerId);

  if (!offer) {
    return next(new ErrorHandler("Offer not found", 404));
  }

  // Ensure that the offer is not already accepted
  if (offer.status === "Accepted") {
    return next(new ErrorHandler("Offer has already been accepted", 404));
  }

  // Use the current date as the start date
  const startDate = new Date();

  // Create a new project based on the accepted offer
  const project = new Project({
    job: jobId,
    postedBy: buyerId, // Add the buyer's ID here
    freelancer: freelancerId,
    offer: offerId,
    projectStatus: "Progress", // You can set an initial status here
    startDate,
    projectDetails,
  });

  // Save the project to the database
  await project.save();

  // Update the status of the offer to "Accepted"
  offer.status = "Accepted";
  await offer.save();

  // Update the status of the job to "Hired"
  const job = await Job.findById(jobId);
  job.status = "Hired";
  await job.save();

  res.status(201).json({
    success: true,
    message: "Offer accepted successfully",
    project,
  });
});

// Get My All Offer
export const myAllOffers = catchAsyncError(async (req, res, next) => {
  const { freelancerId } = req.params;

  // Find all offers for the specified user
  const offers = await Offer.find({ freelancer: freelancerId })
    .populate({
      path: "job",
      model: "Job", // Replace 'Job' with the actual name of your Job model
      select: "-password", // Exclude any sensitive fields from the job model
    })
    .populate({
      path: "sender",
      model: "User", // Replace 'User' with the actual name of your User model
      select: "-password", // Exclude any sensitive fields from the user model
    });

  res.status(200).json({ success: true, offers });
});

// Get Single Offer
export const singleOffer = catchAsyncError(async (req, res, next) => {
  const { offerId } = req.params;

  const offer = await Offer.findById(offerId).populate({
    path: "job",
    select: "postedBy",
    populate: { path: "postedBy", select: "username" }, // Include only the fields you need
  });

  if (!offer) {
    return next(new ErrorHandler("Offer not found", 404));
  }

  res.status(200).json({ success: true, offer });
});

// Job Search API
export const jobSearch = catchAsyncError(async (req, res, next) => {
  const { title, category, skills, minBudget, maxBudget } = req.query;

  try {
    // Create a query object for filtering jobs
    const query = {};

    // Add filters based on the query parameters
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Case-insensitive title search
    }

    if (category) {
      query.category = category;
    }

    if (skills) {
      query.skills = { $in: skills.split(",") }; // Split skills string into an array
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) {
        query.budget.$gte = parseInt(minBudget);
      }
      if (maxBudget) {
        query.budget.$lte = parseInt(maxBudget);
      }
    }

    // Find jobs that match the query
    const jobs = await Job.find(query);

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
});

// All My Projects
export const getMyAllProjects = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    const projects = await Project.find({ freelancer: id })
      .populate({
        path: "job",
        populate: {
          path: "postedBy",
        },
      })
      .populate("postedBy");

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error,
    });
  }
});

// Submit Project Work
export const submitProjectWork = catchAsyncError(async (req, res, next) => {
  const { projectId, freelancerId, submissionDetails, projectPdf } = req.body;

  // Find the project by ID
  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  // Check if the project is in progress or under review
  if (project.projectStatus === "Rejected") {
    return next(new ErrorHandler("Project is Cancel", 400));
  }

  // Check if the project is in progress or under review
  if (project.projectStatus === "Completed") {
    return next(new ErrorHandler("Project is Complete", 400));
  }

  // Update the project's submission details
  project.submission.submittedBy = freelancerId;
  project.submission.submittedAt = new Date();
  project.projectStatus = "Submitted"; // Change project status to "Submitted"
  project.projectDetails = submissionDetails;
  project.submission.projectPdf = projectPdf;
  // console.log("-->>", project.projectPdf);
  // console.log("-->>", project);

  // Save the updated project to the database
  await project.save();

  res.status(201).json({
    success: true,
    message: "Project work submitted successfully",
    project,
  });
});

// RemoveOffer
export const removeOffer = catchAsyncError(async (req, res, next) => {
  try {
    const { offerId } = req.params;

    // Find the offer by ID
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    // Check if the offer has been accepted
    if (offer.status === "Accepted") {
      return res
        .status(400)
        .json({ success: false, message: "Accepted offers cannot be deleted" });
    }

    // Delete the offer from the database
    const deleteResult = await Offer.deleteOne({ _id: offerId });

    if (deleteResult.deletedCount === 1) {
      return res
        .status(200)
        .json({ success: true, message: "Offer deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the offer",
      error,
    });
  }
});

// Add to Favorite
// export const favorites = catchAsyncError(async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const { jobId } = req.body; // Assuming you send the job ID in the request body

//     // Find the user
//     const user = await User.findById(userId);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Find the job
//     const job = await Job.findById(jobId);

//     if (!job) {
//       return res.status(404).json({ success: false, message: "Job not found" });
//     }

//     // Check if the job is already in the user's favorites
//     if (user.favorites.includes(jobId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Job is already in favorites" });
//     }

//     // Add the job to the user's favorites
//     user.favorites.push(jobId);

//     // Save the updated user document
//     await user.save();

//     res.status(200).json({ success: true, message: "Job added to favorites" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "An error occurred", error });
//   }
// });

export const favorites = catchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { jobId } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Check if the job is already in the user's favorites
    const jobIndex = user.favorites.indexOf(jobId);

    if (jobIndex !== -1) {
      // The job is already in favorites, so remove it
      user.favorites.splice(jobIndex, 1);

      // Save the updated user document
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Job removed from favorites" });
    } else {
      // The job is not in favorites, so add it
      user.favorites.push(jobId);

      // Save the updated user document
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Job added to favorites" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An error occurred", error });
  }
});

// Remove Job From Favorite
export const removeFavoriteJob = catchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { jobId } = req.body; // Assuming you send the job ID in the request body

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the job is in the user's favorites
    const jobIndex = user.favorites.indexOf(jobId);

    if (jobIndex === -1) {
      return res
        .status(400)
        .json({ success: false, message: "Job is not in favorites" });
    }

    // Remove the job from the user's favorites
    user.favorites.splice(jobIndex, 1);

    // Save the updated user document
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Job removed from favorites" });
  } catch (error) {
    next(error);
  }
});

// Add to Favorite
export const getMyFavorites = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Find the user by their ID
    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Extract the favorite jobs from the user document
    const favoriteJobs = user.favorites;

    res.status(200).json({ success: true, favoriteJobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching favorite jobs",
      error,
    });
  }
});

// Send Notification
export const sendNotification = catchAsyncError(async (req, res, next) => {
  try {
    const { recipient, message } = req.body;

    const newNotification = new Notification({
      recipient,
      message,
    });

    await newNotification.save();

    res
      .status(201)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while sending the notification",
      error,
    });
  }
});

// Send Notification
export const getAllNotification = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId;

  try {
    // Query the database to find all notifications for the user
    const notifications = await Notification.find({ recipient: userId });

    // Send the notifications as a response
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching notifications",
      error,
    });
  }
});

// RemoveOffer
export const getAllMyMessage = catchAsyncError(async (req, res, next) => {});
