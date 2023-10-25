import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/User.js";
import { Review } from "../model/Review.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import stripe from "stripe";
import { Job } from "../model/Job.js";
import { Bids } from "../model/Bid.js";
import { Offer } from "../model/Offer.js";
import { Project } from "../model/Project.js";
import Chat from "../model/Chat.js";
import Message from "../model/Message.js";
import nodemailer from "nodemailer";
import JobCategory from "../model/Category.js";

cloudinary.v2.config({
  cloud_name: "dirfoibin",
  api_key: "315619779683284",
  api_secret: "_N7-dED0mIjUUa3y5d5vv2qJ3Ww",
});
const stripeInstance = stripe("sk_test_BHlJPzC6PloLo7ELEKksI1uy00LlQbLa2X");

// Register
export const RegisterBuyer = catchAsyncError(async (req, res, next) => {
  const { username, email, password, confirmPassword, role } = req.body;

  // Check if passwords match \hey
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 401));
  }

  // Check if user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists", 409));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newUser,
  });
});

// Login Buyer
export const LoginBuyer = catchAsyncError(async (req, res, next) => {
  const { email, password, fcmToken } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  // console.log(fcmToken);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  // console.log(fcmToken);
  if (fcmToken) {
    user.fcmToken = fcmToken;
    await user.save();
  }
  res.status(201).json({ success: true, message: "Login Successful", user });
});

// Send Email
export const sendEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new ErrorHandler("User Not Found", 409));
    }

    const verificationCode = Math.floor(10000 + Math.random() * 90000)
      .toString()
      .substring(0, 5);
    existingUser.otp = verificationCode;
    await existingUser.save();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: "hammaddeveloper189@gmail.com",
        pass: "vvleopeoptowobxn",
      },
      secure: true,
    });

    const mailData = {
      from: '"Audtik" <hammaddeveloper189@gmail.com>',
      to: email,
      subject: "One Time OTP",
      text: "Forget Password",
      html: ` <!DOCTYPE html>
      <html>
      <head>
          <title>Password Reset</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
    
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
    
              h2 {
                  color: #0056b3;
              }
    
              p {
                  color: #777777;
              }
    
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
              }
    
              .otp {
                  font-size: 24px;
                  color: #333333;
                  margin: 20px 0;
              }
    
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Your One-Time Password (OTP) is:</p>
              <div class="otp">${verificationCode}</div>
              <p>Please use this OTP to reset your password. If you did not request this reset, please ignore this email.</p>
              <p>Best regards,</p>
              <p>The Chainwork Developer Team</p>
          </div>
          <div class="footer">
              <p>This email was sent to you as part of our security measures.</p>
              <p>&copy; 2023 Audtik. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    const info = await transporter.sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Revision Send Email
export const sendRevisionEmail = async (req, res, next) => {
  try {
    const { email, name, projectTitle, buyerRevisionDes } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new ErrorHandler("User Not Found", 409));
    }

    const verificationCode = Math.floor(10000 + Math.random() * 90000)
      .toString()
      .substring(0, 5);
    existingUser.otp = verificationCode;
    await existingUser.save();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: "hammaddeveloper189@gmail.com",
        pass: "vvleopeoptowobxn",
      },
      secure: true,
    });

    const mailData = {
      from: '"Audtik" <hammaddeveloper189@gmail.com>',
      to: email,
      subject: "Request for Project Revision",
      text: "Project Revision",
      html: ` <!DOCTYPE html>
      <html>
      <head>
          <title>Request for Project Revision</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }

              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }

              h2 {
                  color: #0056b3;
              }

              p {
                  color: #777777;
              }

              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
              }

              .otp {
                  font-size: 24px;
                  color: #333333;
                  margin: 20px 0;
              }

              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Dear ${name}</h2>
              <p>I hope this message finds you well. We wanted to inform you that the buyer has requested a revision for the project named ${projectTitle}.</p>
              <p>Project Name: ${projectTitle}</p>
              <h2>${buyerRevisionDes}</h2>
              <p>We appreciate your dedication to delivering excellence. We are confident that your expertise will be a valuable asset in addressing the revision and ensuring the buyer's satisfaction.</p>
              <p>We will keep you updated as the revision process unfolds, and we thank you for your cooperation in making this project a success.</p>
              <p>Best regards,</p>
              <p>The Chainwork Developer Team</p>
          </div>
          <div class="footer">
              <p>This email was sent to you as part of our security measures.</p>
              <p>&copy; 2023 Audtik. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    const info = await transporter.sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Send Confirm Email
export const sendConfirmEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: "hammaddeveloper189@gmail.com",
        pass: "vvleopeoptowobxn",
      },
      secure: true,
    });

    const mailData = {
      from: '"Audtik" <hammaddeveloper189@gmail.com>',
      to: email,
      subject: "Welcome!",
      text: "We Noticed a New Login",
      html: ` <!DOCTYPE html>
      <html>
      <head>
          <title>We Noticed a New Login</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
    
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
    
              h2 {
                  color: #0056b3;
              }
    
              p {
                  color: #777777;
              }
    
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
              }
    
              .otp {
                  font-size: 24px;
                  color: #333333;
                  margin: 20px 0;
              }
    
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>We Noticed a New Login</h2>
          </div>
          <div class="footer">
              <p>This email was sent to you as part of our security measures.</p>
              <p>&copy; 2023 Audtik. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    const info = await transporter.sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Send Confirm Email
export const acceptEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: "hammaddeveloper189@gmail.com",
        pass: "vvleopeoptowobxn",
      },
      secure: true,
    });

    const mailData = {
      from: '"Audtik" <hammaddeveloper189@gmail.com>',
      to: email,
      subject: "Congratulations!",
      text: "Order Accepted",
      html: ` <!DOCTYPE html>
      <html>
      <head>
          <title>Order Complete</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
    
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
    
              h2 {
                  color: #0056b3;
              }
    
              p {
                  color: #777777;
              }
    
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
              }
    
              .otp {
                  font-size: 24px;
                  color: #333333;
                  margin: 20px 0;
              }
    
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Order Complete</h2>
          </div>
          <div class="footer">
              <p>This email was sent to you as part of our security measures.</p>
              <p>&copy; 2023 Audtik. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    const info = await transporter.sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }

    if (user.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    // // Hash the new password
    // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // // Update the user's password to the hashed new password
    // user.password = hashedPassword;

    // Clear the stored OTP since it has been used
    user.otp = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Update the user's password to the hashed new password
    user.password = hashedPassword;

    // Clear the stored OTP since it has been used
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Update Profile
export const UpdateProfile = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    username,
    email,
    companyname,
    ownerName,
    skills,
    bio,
    phoneNumber,
    country,
    role,
    profilImage,
    companyImage,
    freelancerTitle,
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("No User Found", 401));
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (freelancerTitle !== undefined) user.freelancerTitle = freelancerTitle;
    if (companyname !== undefined) user.companyname = companyname;
    if (ownerName !== undefined) user.ownerName = ownerName;
    if (skills !== undefined) user.skills = skills;
    if (bio !== undefined) user.bio = bio;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (country !== undefined) user.country = country;
    if (profilImage !== undefined) user.profilImage = profilImage;
    if (companyImage !== undefined) user.companyImage = companyImage;
    if (role !== undefined) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Post Job
export const PostJob = catchAsyncError(async (req, res, next) => {
  try {
    const {
      title,
      category,
      specialty,
      skills,
      estimateTime,
      budget,
      description,
      projectPdf,
      // type,
    } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (!title) {
      return next(new ErrorHandler("Please Write Title", 409));
    }
    if (!category) {
      return next(new ErrorHandler("Please Add Category", 409));
    }
    // if (!type) {
    //   return next(new ErrorHandler("Please Add Type", 409));
    // }
    if (!specialty) {
      return next(new ErrorHandler("Please Add Specialty", 409));
    }
    if (!skills) {
      return next(new ErrorHandler("Please Add Skills", 409));
    }
    if (!estimateTime) {
      return next(new ErrorHandler("Please Add Time", 409));
    }
    if (!budget) {
      return next(new ErrorHandler("Please Add Cost", 409));
    }
    if (!description) {
      return next(new ErrorHandler("Please Add Description", 409));
    }

    const newJob = await Job.create({
      title,
      category,
      specialty,
      skills,
      estimateTime,
      budget,
      projectPdf,
      description,
      projectPdf,
      // type,
      postedBy: id,
    });
    await newJob.save();

    // Update the user's postedJobs field
    await User.findByIdAndUpdate(
      id,
      { $push: { postedJobs: newJob._id } },
      { new: true }
    );

    res.json({
      message: "Job posted successfully",
      job: newJob,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
});

// Get User Jobs
export const UserJobs = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler("No User Found", 409));
  }
  // const userJobs = await Job.find({ postedBy: id });
  const userJobs = await Job.find({ postedBy: id }).sort({ createdAt: -1 });

  res.json({ message: "All Jobs", job: userJobs });
});

// // Add User Images
export const UploadImage = async (req, res, next) => {
  let images = [];
  if (req.files && req.files.avatars) {
    if (!Array.isArray(req.files.avatars)) {
      images.push(req.files.avatars);
    } else {
      images = req.files.avatars;
    }
  }
  let responce = [];
  for (const image of images) {
    try {
      const result = await cloudinary.v2.uploader.upload(image.tempFilePath);
      console.log(result);
      const publidId = result.public_id;
      const url = result.url;
      let data = {
        publidId,
        url,
      };
      //  console.log(data);
      responce.push(data);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Error uploading file", success: false });
    }
  }
  // console.log("-->1",responce);
  //     res.json{responce , result}
  // res.send(responce);
  res.json({ success: true, data: responce });
};

// export const UploadDocument = async (req, res, next) => {
//   let documents = [];
//   if (req.files && req.files.documents) {
//     if (!Array.isArray(req.files.documents)) {
//       documents.push(req.files.documents);
//     } else {
//       documents = req.files.documents;
//     }
//   }
//   let response = [];
//   for (const document of documents) {
//     try {
//       const result = await cloudinary.v2.uploader.upload(
//         document.tempFilePath,
//         {
//           resource_type: "raw", // Upload as raw file type
//         }
//       );

//       const publicId = result.public_id;
//       const url = result.url;
//       let data = {
//         publicId,
//         url,
//       };
//       response.push(data);
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({ error: "Error uploading documents" });
//     }
//   }

//   res.json({ success: true, data: response });
// };

// User Profile
export const UploadDocument = async (req, res, next) => {
  let pdfDocuments = [];
  if (req.files && req.files.documents) {
    if (!Array.isArray(req.files.documents)) {
      pdfDocuments.push(req.files.documents);
    } else {
      pdfDocuments = req.files.documents;
    }
  }
  let response = [];
  for (const pdfDocument of pdfDocuments) {
    // Check if the uploaded file is a PDF (you can modify this check as needed)
    if (
      pdfDocument.mimetype !== "application/pdf" ||
      !pdfDocument.originalname.endsWith(".pdf")
    ) {
      return res.status(400).json({ error: "Uploaded file is not a PDF" });
    }

    try {
      const result = await cloudinary.v2.uploader.upload(
        pdfDocument.tempFilePath,
        {
          resource_type: "raw", // Upload as raw file type
        }
      );

      const publicId = result.public_id;
      const url = result.url;
      let data = {
        publicId,
        url,
      };
      response.push(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error uploading PDF documents" });
    }
  }

  res.json({ success: true, data: response });
};

export const UserProfile = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.params.id; // Get the user ID from the route parameter
    const user = await User.findById(userId).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
});

// All the proposal sended by freelancers
export const ProposalSendbyFreelancers = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params; // Job Id
    const proposals = await Bids.find({ job: id }).populate("bidder");

    res.status(200).json({
      success: true,
      message: "Proposals Fetched Successfully",
      proposals,
    });
  }
);

// Get All Freelancer
export const getAllFreelancers = catchAsyncError(async (req, res, next) => {
  try {
    const { skills, title } = req.query; // Get the skills filter from the query parameter

    let filters = { role: "freelancer" }; // Start with the basic filter for freelancers
    if (skills) {
      const regexSkills = skills
        .split(",")
        .map((skill) => new RegExp(skill, "i")); // Create a case-insensitive regex for each skill
      filters.skills = { $all: regexSkills }; // Use the $all operator to filter freelancers with all of the specified skills
    }
    if (title) {
      const regexTitle = title
        .split(",")
        .map((title) => new RegExp(title, "i"));
      filters.freelancerTitle = regexTitle; // Use the regex to filter freelancers by title
    }

    const freelancers = await User.find(filters);

    if (freelancers.length === 0) {
      // If no freelancers match the filter criteria, return an empty response
      return res.status(200).json({ success: true, freelancers: [] });
    }

    res.status(200).json({ success: true, freelancers });
  } catch (error) {
    next(error);
  }
});

// Get All My Proposals
export const getAllMyProposals = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const jobs = await Job.find({ postedBy: id }).populate({
    path: "bids",
    populate: { path: "bidder", select: "username email phoneNumber" }, // Include bidder's basic details
  });

  // console.log(jobs);

  // Extract and format the necessary information from each job
  const jobProposals = jobs.map((job) => ({
    jobDetails: {
      title: job.title,
      category: job.category,
      id: job._id,
      // Add other job details as needed
    },
    proposals: job.bids.map((bid) => ({
      id: bid._id,
      bidderDetails: {
        id: bid._id,
        username: bid.username,
        email: bid.email,
        phoneNumber: bid.phoneNumber,
      },
      bidPrice: bid.bidPrice,
      projectTimePeriod: bid.projectTimePeriod,
      additionalInfo: bid.additionalInfo,
      createdAt: bid.createdAt,
      // Add other proposal details as needed
    })),
  }));

  res.status(200).json({ success: true, jobProposals });
});

// Payment Using Stripe
export const stripe_payment = async (req, res, next) => {
  try {
    const { total_amount, card_number, exp_month, exp_year, user_id, cvv } =
      req.body;

    const token = await stripeInstance.tokens.create({
      card: {
        number: card_number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvv,
      },
    });

    const charge = await stripeInstance.charges.create({
      amount: Math.floor(total_amount * 100), // Convert amount to cents
      currency: "USD",
      source: token.id,
      description: "Elemed Payment",
    });

    if (charge.status === "succeeded") {
      const payment = {
        user_id: user_id, // Set user ID
        amount: total_amount,
        status: "paid",
        transaction_id: charge.id,
        receipt_url: charge.receipt_url,
      };

      return res.json({ success: true, data: payment, message: "Amount Paid" });
    } else {
      return res.status(400).json({ success: false, error: "Payment failed" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Send Offer To Freelancer with Proposal Check
export const sendOfferToFreelancer = async (req, res, next) => {
  const {
    jobId,
    freelancerId,
    offerDetails,
    offerAmount,
    deadline,
    senderId,
    proposalId,
  } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  const freelancer = await User.findById(freelancerId);
  if (!freelancer) {
    return next(new ErrorHandler("Freelancer not found", 404));
  }

  const proposal = await Bids.findById(proposalId);
  if (!proposal) {
    return next(new ErrorHandler("Proposal not found", 404));
  }

  if (proposal.status === "accept") {
    return res.status(400).json({
      success: false,
      message: "Proposal has already been accepted.",
    });
  }

  // Send the offer to the client
  const newOffer = new Offer({
    job: jobId,
    freelancer: freelancerId,
    sender: senderId,
    details: offerDetails,
    amount: offerAmount,
    deadline: deadline,
  });

  // Save the offer to the database
  await newOffer.save();

  // Update the proposal's status to "accept"
  proposal.status = "accept";
  await proposal.save();

  res.status(201).json({
    success: true,
    message: "Offer sent successfully",
    offer: newOffer,
  });
};

// Get All My Running Projects
export const getRunningProjectsForBuyer = catchAsyncError(
  async (req, res, next) => {
    const { buyerId } = req.params; // Byer Id

    try {
      // Find all projects where the buyer ID matches the specified buyer's ID
      const projects = await Project.find({
        postedBy: buyerId,
        projectStatus: {
          $in: [
            "Submitted",
            "UnderReview",
            "Completed",
            "Rejected",
            "Progress",
          ],
        },
      })
        .populate("job") // Populate the 'job' field
        .populate("freelancer"); // Populate the 'freelancer' field

      res.status(200).json({ success: true, projects });
    } catch (error) {
      next(error);
    }
  }
);

// Accept Project
export const acceptProject = catchAsyncError(async (req, res, next) => {
  const { projectId } = req.params;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);

    // console.log(project.freelancer);
    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }

    // Check if the project is already marked as "Complete"
    // if (project.projectStatus === "Completed") {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Project is already completed" });
    // }

    // Update the project's status to "Complete" (or any appropriate status)
    project.projectStatus = "Completed";

    // Find the buyer's user record based on their ID
    const buyer = await User.findById(project.postedBy);
    const job = await Job.findById(project.job);
    // console.log(project);
    const freelancer = await User.findById(project.freelancer);
    // console.log(freelancer);
    // console.log(buyer);
    // console.log(job.budget);
    // Check if the buyer record is found
    if (buyer) {
      // Add the project's cost to the buyer's totalSpent field
      buyer.totalSpent = buyer.totalSpent + job.budget;

      // Save the updated buyer record
      await buyer.save();
    }

    if (freelancer) {
      // Add the project's budget to the freelancer's totalEarned field
      const twentyPercent = job.budget * 0.2;
      const amount = job.budget - twentyPercent;
      // freelancer.totalEarned = freelancer.totalEarned + job.budget;
      freelancer.totalEarned = freelancer.totalEarned + amount;
      freelancer.totalJob = freelancer.totalJob + 1;

      // Save the updated freelancer record
      await freelancer.save();
    }
    // console.log(freelancer);
    // Save the updated project to the database
    await project.save();

    res
      .status(200)
      .json({ success: true, message: "Project accepted successfully", buyer });
  } catch (error) {
    next(error);
  }
});

// Request Revision
export const requestRevision = catchAsyncError(async (req, res, next) => {
  const { projectId, revisionDetails } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);
    console.log(revisionDetails);
    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }

    // Check if the project status is "Review"
    if (project.projectStatus === "Completed") {
      return next(new ErrorHandler("The Project is already Delivered", 400));
    }

    // Check if the project status is "Review"
    if (project.projectStatus === "Rejected") {
      return next(new ErrorHandler("The Project is Cancel", 400));
    }

    // Add revision details to the project (you can have a dedicated field for this)
    project.projectDetails = revisionDetails;

    // Update the project's status back to "Progress" (or any appropriate status)
    project.projectStatus = "UnderReview";

    // Save the updated project to the database
    await project.save();

    res.status(200).json({
      success: true,
      message: "Revision requested successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
});

// Project Cancel API
export const cancelProject = catchAsyncError(async (req, res, next) => {
  const { projectId } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }

    // Check if the project is already completed
    if (project.projectStatus === "Complete") {
      return next(new ErrorHandler("Project is already completed", 400));
    }

    // Update the project's status to "Canceled"
    project.projectStatus = "Rejected";

    // Save the updated project to the database
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project canceled successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
});

// Create Chat
export const CreateChat = catchAsyncError(async (req, res, next) => {
  let { user, other } = req.body;
  try {
    // Validate that the user and other user IDs exist
    const userExists = await User.findById(user);
    const otherUserExists = await User.findById(other);

    if (!userExists || !otherUserExists) {
      return res.json({
        status: "error",
        message: "User not found",
      });
    }

    let chat = await Chat.findOne({
      $or: [
        { user, other },
        { user: other, other: user },
      ],
    });

    if (chat) {
      // If a chat already exists, return the existing chat
      return res.json({
        status: "success",
        data: chat,
      });
    }

    // If no chat exists, create a new chat
    chat = await Chat.create({
      user,
      other,
    });

    res.json({
      status: "success",
      data: chat,
    });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error", message: "Something went wrong" });
  }
});

// Send Message
export const SendMessage = catchAsyncError(async (req, res, next) => {
  const { chatId, sender, text } = req.body;
  const message = new Message({
    chatId,
    sender,
    text,
    receiver,
  });
  let olgMesg = await Message.find({
    _id: { $ne: message._id },
    receiver: sender,
    chatId: chatId,
    is_seen: false,
  });
  olgMesg.forEach((message) => {
    message.is_seen = true;
    message.save();
  });
  try {
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Message
export const GetMessage = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.body;
  try {
    const result = await Message.find({ chatId });
    result.forEach((message) => {
      if (message.is_seen === false) {
        message.is_seen = true;
        message.save();
      }
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Single Project by ID
export const getSingleProject = catchAsyncError(async (req, res, next) => {
  const { projectId } = req.params;

  try {
    // Find the project by its ID
    const project = await Project.findById(projectId).populate({
      path: "freelancer",
      select: "username email phoneNumber", // Include freelancer's basic details
    });

    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }

    // You can add more fields to populate as needed

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
});

// Get All Chats for a User (Only This is Use)
export const getAllChatsForUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;
  const userChats = await Chat.find({
    $or: [{ user: userId }, { other: userId }],
  }).sort({ _id: -1 });

  let isSeen = [];
  const populatedChats = await Promise.all(
    userChats.map(async (data) => {
      let dynamicChatId = `${data._id}`; // getting chat id from user chats

      if (data.user == userId) {
        const findPerson1 = await User.findById(data.other);
        isSeen = await Message.aggregate([
          {
            $match: {
              chatId: dynamicChatId,
              is_seen: false,
            },
          },
          {
            $group: {
              _id: "$chatId",
              unreadMessages: { $sum: 1 },
            },
          },
        ]);
        const chatWithPersonData = {
          chatId: data._id,
          userId: data.user,
          other: findPerson1,
          lastMessage: data.lastMessage,
          unread: isSeen.length > 0 ? isSeen[0].unreadMessages : 0,
        };
        return chatWithPersonData;
      } else {
        const findPerson1 = await User.findById(data.user);
        isSeen = await Message.aggregate([
          {
            $match: {
              chatId: dynamicChatId,
              is_seen: false,
            },
          },
          {
            $group: {
              _id: "$chatId",
              unreadMessages: { $sum: 1 },
            },
          },
        ]);
        const chatWithPersonData = {
          chatId: data._id,
          userId: data.other,
          other: findPerson1,
          lastMessage: data.lastMessage,
          unread: isSeen.length > 0 ? isSeen[0].unreadMessages : 0,
        };
        return chatWithPersonData;
      }
    })
  );

  res.status(200).json({
    success: true,
    chats: populatedChats,
  });
});

// Get All Chats for a Buyer
export const getAllChatsForBuyer = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;
  const userChats = await Chat.find({
    $or: [{ user: userId }, { other: userId }],
  }).populate("user");
  console.log(userChats);
  res.status(200).json({
    success: true,
    chats: userChats,
  });
});

// Edit Job
export const editJob = catchAsyncError(async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const updatedData = req.body;

    // Find the job by ID
    const job = await Job.findById(jobId);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    // Update only the fields that are provided in the request body
    if (updatedData.title) {
      job.title = updatedData.title;
    }
    if (updatedData.category) {
      job.category = updatedData.category;
    }
    if (updatedData.specialty) {
      job.specialty = updatedData.specialty;
    }
    if (updatedData.skills) {
      job.skills = updatedData.skills;
    }
    if (updatedData.estimateTime) {
      job.estimateTime = updatedData.estimateTime;
    }
    if (updatedData.budget) {
      job.budget = updatedData.budget;
    }
    if (updatedData.description) {
      job.description = updatedData.description;
    }
    if (updatedData.projectPdf) {
      job.projectPdf = updatedData.projectPdf;
    }

    // Save the updated job
    await job.save();

    res.json({
      message: "Job updated successfully",
      job,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
});

// Delete Proposal by ID
export const deleteProposalById = catchAsyncError(async (req, res, next) => {
  const { proposalId } = req.params;

  try {
    // Use the .deleteOne() method to remove the proposal
    const result = await Bids.deleteOne({ _id: proposalId });

    if (result.deletedCount === 0) {
      return next(new ErrorHandler("Proposal not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting proposal", 500));
  }
});

// Add Review
export const addReview = catchAsyncError(async (req, res, next) => {
  try {
    const { userId, targetId, rating, comment, budget } = req.body;

    // Validate the incoming data (e.g., check if userId and targetId exist)

    // Create a new review
    const newReview = new Review({
      userId,
      targetId,
      rating,
      comment,
      budget,
    });

    // Save the review to the database
    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the review",
      error,
    });
  }
});

// Get All Reviews for User
export const getAllReviewsForUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Find all reviews for the specified user and populate the 'userId' field
    const reviews = await Review.find({ targetId: userId }).populate("userId");

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An error occurred", error });
  }
});

// Add Job Category
export const addJobCategory = catchAsyncError(async (req, res, next) => {
  try {
    // Get the category name from the request body
    const { name } = req.body;

    // Check if the category name already exists
    const existingCategory = await JobCategory.findOne({ name });

    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    // Create a new job category
    const newCategory = new JobCategory({ name });

    // Save the new category to the database
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding category", error });
  }
});

// Add Job Category
export const getAllCategory = catchAsyncError(async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {}; // Initialize an empty filter

    if (search) {
      // If a search query is provided, use a regular expression for case-insensitive search
      filter.name = new RegExp(search, "i");
    }

    // Find categories based on the filter, or return all categories if no filter is provided
    const categories = await JobCategory.find(filter);

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories",
      error,
    });
  }
});
