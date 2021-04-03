const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      unique: true,
      minlength: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
    },
    bio: {
      type: String,
    },
    website: {
      type: String,
    },
    followers: {
      type: Number,
    },
    following: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
