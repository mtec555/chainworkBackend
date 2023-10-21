import express from "express";
import {
  RegisterBuyer,
  LoginBuyer,
  UpdateProfile,
  PostJob,
  UserJobs,
  UploadDocument,
  UserProfile,
  ProposalSendbyFreelancers,
  getAllFreelancers,
  getAllMyProposals,
  stripe_payment,
  sendOfferToFreelancer,
  getRunningProjectsForBuyer,
  acceptProject,
  requestRevision,
  cancelProject,
  CreateChat,
  GetMessage,
  SendMessage,
  getSingleProject,
  getAllChatsForUser,
  editJob,
  getAllChatsForBuyer,
  deleteProposalById,
  sendEmail,
  verifyOTP,
  sendConfirmEmail,
  // uploadImages,
  UploadImage,
  changePassword,
  acceptEmail,
  addReview,
  getAllReviewsForUser,
  addJobCategory,
  getAllCategory,
} from "../controller/BuyerController.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" }); // Make sure to specify the destination directory

const router = express.Router();

router.route("/RegisterBuyer").post(RegisterBuyer);
router.route("/LoginBuyer").post(LoginBuyer);
router.route("/getAllFreelancers").post(getAllFreelancers);
router.route("/UpdateProfile/:id").post(UpdateProfile);
router.route("/getAllMyProposals/:id").post(getAllMyProposals);
router.route("/PostJob/:id").post(PostJob);
router.route("/ProposalSendbyFreelancers/:id").post(ProposalSendbyFreelancers);
router.route("/UserJobs/:id").post(UserJobs);
router.route("/acceptProject/:projectId").post(acceptProject);
router.route("/requestRevision").post(requestRevision);
router.route("/changePassword").post(changePassword);
router.route("/cancelProject").post(cancelProject);
router.route("/sendEmail").post(sendEmail);
router.route("/verify").post(verifyOTP);
router.route("/createChat").post(CreateChat);
router.route("/sendConfirmEmail").post(sendConfirmEmail);
router.route("/acceptEmail").post(acceptEmail);
router.route("/sendMessage").post(SendMessage);
router.route("/getMessage").post(GetMessage);
router.route("/UserProfile/:id").get(UserProfile);
router.route("/deleteProposalById/:proposalId").post(deleteProposalById);
router.route("/editJob/:jobId").post(editJob);
router.route("/getAllChatsForUser/:userId").get(getAllChatsForUser);
router.route("/getAllReviewsForUser/:userId").get(getAllReviewsForUser);
router.route("/addReview").post(addReview);
router.route("/addJobCategory").post(addJobCategory);
router.route("/getAllCategory").post(getAllCategory);
router.route("/getAllChatsForBuyer/:userId").get(getAllChatsForBuyer);
router.route("/getSingleProject/:projectId").get(getSingleProject);
router.route("/stripe_payment").post(stripe_payment);
router.route("/sendOfferToFreelancer").post(sendOfferToFreelancer);
router.route("/UploadImage", upload.array("avatars")).post(UploadImage);
// router.post(
//   "/upload",
//   upload.array([
//     { name: "companyImage", maxCount: 1 },
//     { name: "profileImage", maxCount: 1 },
//     { name: "backgroundImage", maxCount: 1 },
//   ]),
//   uploadImages
// );

router
  .route("/UploadDocument", upload.single("documents"))
  .post(UploadDocument);
router
  .route("/getRunningProjectsForBuyer/:buyerId")
  .get(getRunningProjectsForBuyer);

export default router;
