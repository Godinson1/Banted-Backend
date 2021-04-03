const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BanterSchema = new Schema(
  {
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

const Banter = mongoose.model("Banter", BanterSchema);
module.exports = Banter;
