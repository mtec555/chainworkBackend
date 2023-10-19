import express from "express";
import {
  acceptOffer,
  getAllJobs,
  getAllProposals,
  getSingleJob,
  getSingleProposal,
  submitProposal,
  myAllOffers,
  singleOffer,
  jobSearch,
  getMyAllProjects,
  submitProjectWork,
  removeOffer,
  getAllMyMessage,
  favorites,
  getMyFavorites,
  sendNotification,
  getAllNotification,
  removeFavoriteJob,
} from "../controller/FreelancerController.js";

const router = express.Router();

router.route("/getAllJobs").get(getAllJobs);
router.route("/getSingleJob/:id").get(getSingleJob);
router.route("/submitProposal").post(submitProposal);
router.route("/acceptOffer").post(acceptOffer);
router.route("/getSingleProposal/:id").get(getSingleProposal);
router.route("/getAllProposals/:id").get(getAllProposals);
router.route("/myAllOffers/:freelancerId").post(myAllOffers);
router.route("/singleOffer/:offerId").post(singleOffer);
router.route("/jobSearch").post(jobSearch);
router.route("/submitProjectWork").post(submitProjectWork);
router.route("/getMyAllProjects/:id").post(getMyAllProjects);
router.route("/removeOffer/:offerId").post(removeOffer);
router.route("/getAllMyMessage/:userId").post(getAllMyMessage);
router.route("/favorites/:userId").post(favorites);
router.route("/removeFavoriteJob/:userId").post(removeFavoriteJob);
router.route("/sendNotification").post(sendNotification);
router.route("/getMyFavorites/:userId").post(getMyFavorites);
router.route("/getAllNotification/:userId").post(getAllNotification);

export default router;
