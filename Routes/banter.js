const router = require("express").Router();
const Banter = require("../models/bantModel");
const auth = require("../middleware/auth");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const { uploadMultiple } = require("../Helpers/multer");

//To upload banter
router.post(
  "/banter",
  uploadMultiple.array("banterImage", 4),
  auth,
  (req, res) => {
    const reqFiles = [];

    //If empty field - return eror
    if (req.body.banter === "")
      return res.status(400).json({ msg: "Banter cannot be empty" });

    //Map through each file and push customize path to Array - reqFiles
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push("/BantedImages/BanterImages/" + req.files[i].filename);
    }

    //Create new banter
    const newBanter = {
      banter: req.body.banter,
      banterHandle: req.user.handle,
      name: req.user.name,
      banterImage: reqFiles,
      likeCount: 0,
      commentCount: 0,
      rebantCount: 0,
      userImage: req.user.userImage,
    };
    const newBant = new Banter(newBanter);

    //Save bant to database
    newBant
      .save()
      .then((data) =>
        res.json({
          data,
          message: "Banter uploaded successfully",
          status: "success",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ msg: "Something went Wrong" });
      });
  }
);

//To get all banters
router.route("/").get(async (req, res) => {
  try {
    //Get length of all banter
    const bantLength = await Banter.countDocuments({});

    //Sort banter randomly and return banter
    const randomBanter = await Banter.aggregate([
      { $sample: { size: bantLength } },
    ]);
    return res.status(200).json(randomBanter);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//For Comments on Banter
router
  .route("/:id/comment")
  .post(uploadMultiple.array("banterImage", 4), auth, async (req, res) => {
    const reqFiles = [];

    //If empty field - return eror
    if (req.body.banter === "")
      return res.status(400).json({ msg: "Banter cannot be empty" });

    //Map through each file and push customize path to Array - reqFiles
    for (var i = 0; i < req.files.length; i++) {
      reqFiles.push("/BantedImages/BanterImages/" + req.files[i].filename);
    }

    try {
      //Check if banter exist
      const bant = await Banter.findById(req.params.id);
      if (!bant) {
        return res.status(404).json({ error: "Banter not found" });
      }

      //Create new comment on banter
      const newComment = new Comment({
        banter: req.body.banter,
        banterHandle: req.user.handle,
        name: req.user.name,
        banterImage: reqFiles,
        likeCount: 0,
        commentCount: 0,
        rebantCount: 0,
        banterId: req.params.id,
        userImage: req.user.userImage,
      });

      //Save comment to database
      const comment = await newComment.save();
      bant.commentCount++;
      const data = await bant.save();
      return res.json({
        status: "success",
        data: {
          data,
          comment,
        },
        message: `You commented on ${bant.banterHandle}'s banter..`,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });

///For Liking a banter
router.route("/:id/like").get(auth, async (req, res) => {
  let banterData;

  try {
    //Check for banter
    const banter = await Banter.findById(req.params.id);

    if (banter) {
      banterData = banter;
      banterData.banterId = banter._id;
    } else {
      return res.status(404).json({ banter: "Banter not found!" });
    }

    //Check if liked
    const likeDocument = await Like.findOne({
      $and: [
        { userHandle: { $eq: req.user.handle } },
        { banterId: { $eq: req.params.id } },
      ],
    });

    if (likeDocument === null) {
      const likes = new Like({
        banterId: req.params.id,
        userHandle: req.user.handle,
      });
      const likeData = await likes.save();
      banterData.likeCount++;
      await banterData.save();
      return res.status(200).json({
        status: "success",
        message: "Banter liked successfully",
        data: {
          data: banterData,
          like: likeData,
        },
      });
    } else {
      return res.status(400).json({ error: "Banter already liked" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//For unliking banter
router.route("/:id/unlike").get(auth, async (req, res) => {
  let banterData;
  try {
    //Check for banter
    const banter = await Banter.findById(req.params.id);
    if (banter) {
      banterData = banter;
      banterData.banterId = banter._id;
    } else {
      return res.status(404).json({ banter: "Banter not found!" });
    }

    //Check for like document and delete (unlike)
    const like = await Like.find({
      $and: [
        { userHandle: { $eq: req.user.handle } },
        { banterId: { $eq: req.params.id } },
      ],
    });
    if (like === "") {
      return res.status(400).json({ error: "Banter not liked" });
    } else {
      await Like.deleteOne({ userHandle: { $eq: req.user.handle } });
      banterData.likeCount--;
      await banterData.save();
      return res.status(200).json({
        status: "success",
        message: "Banter unliked successfully",
        data: {
          data: banterData,
        },
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//Get each Banter with comments
router.route("/:id").get(auth, async (req, res) => {
  let banterData;
  try {
    //Check for banter
    const banter = await Banter.findById(req.params.id);
    if (banter) {
      banterData = banter;
      banterData.banterId = banter._id;
    } else {
      return res.status(404).json({ banter: "Banter not found!" });
    }

    //Check for comments
    const comments = await Comment.find({
      banterId: { $eq: req.params.id },
    }).sort({ createdAt: -1 });
    return res.status(200).json({ banterData, comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//Delete a Banter
router.route("/:id").delete(auth, async (req, res) => {
  try {
    const bant = await Banter.findById(req.params.id);
    if (!bant) {
      return res.status(404).json({ error: "Banter not found" });
    }

    if (bant.banterHandle !== req.user.handle) {
      res.status(403).json({ error: "Unauthorised" });
    } else {
      await Banter.deleteOne({ _id: { $eq: req.params.id } });
      return res.status(200).json({
        status: "success",
        data: bant,
        message: "Banter deleted successfully!",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

module.exports = router;
