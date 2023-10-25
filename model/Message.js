import mongoose from "mongoose";

const msgSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      // required: true,
    },
    sender: {
      type: String,
      required: true,
    },

    chatId: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      default: "",
    },
    is_seen: {
      type: Boolean,
      defaultValue: false
    },
  },
  {
    timestamps: true,
  },
  {
    collection: "messages",
  }
);

export default mongoose.model("message", msgSchema);
