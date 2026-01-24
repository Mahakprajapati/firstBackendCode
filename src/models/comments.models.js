import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    context: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = new mongoose.model("Comment", commentSchema);

export default Comment;
