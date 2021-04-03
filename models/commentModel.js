const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    banterId: {
      type: String,
      required: true,
    },
    banter: {
      type: String,
      required: true,
    },
    banterHandle: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    banterImage: {
      type: Array,
    },
    likeCount: {
      type: Number,
    },
    commentCount: {
      type: Number,
    },
    rebantCount: {
      type: Number,
    },
    userImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
