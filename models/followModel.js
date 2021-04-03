const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new Schema(
  {
    handle: {
      type: String,
    },
    name: {
      type: String,
    },
    userId: {
      type: String,
    },
    followerId: {
      type: String,
    },
    followerHandle: {
      type: String,
    },
    followerName: {
      type: String,
    },
    followerImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
