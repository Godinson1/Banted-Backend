const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    userHandle: {
      type: String,
    },
    banterId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
