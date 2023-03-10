const router = require("express").Router();
const Banter = require("../models/bantModel");
const auth = require("../middleware/auth");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const { banterEmitter, LIKE_EVENT } = require("../events/");
const { success, getPhotoUrl } = require("../Helpers");

//To upload banter
router.post("/banter", auth, async (req, res) => {
  if (req.body.banter === "") return res.status(400).json({ msg: "Banter cannot be empty" });

  const banterImageUrl = await getPhotoUrl(req, res);
  const newBant = new Banter({
    banter: req.body.banter,
    banterHandle: req.user.handle,
    name: req.user.name,
    banterImage: banterImageUrl,
    likeCount: 0,
    commentCount: 0,
    rebantCount: 0,
    userImage: req.user.userImage,
  });

  try {
    const data = await newBant.save();
    banterEmitter.emit("create", JSON.stringify(data));
    res.json({ data, message: "Banter uploaded successfully", status: success });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went Wrong" });
  }
});

//To get all banters
router.route("/").get(async (req, res) => {
  try {
    const bantLength = await Banter.countDocuments({});
    const randomBanter = await Banter.aggregate([{ $sample: { size: bantLength } }]);
    return res.status(200).json(randomBanter);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//For Comments on Banter
router.route("/:id/comment").post(auth, async (req, res) => {
  if (req.body.banter === "") return res.status(400).json({ msg: "Banter cannot be empty" });

  try {
    const bant = await Banter.findById(req.params.id);
    if (!bant) return res.status(404).json({ error: "Banter not found" });

    const banterImage = await getPhotoUrl(req, res);
    const newComment = new Comment({
      banter: req.body.banter,
      banterHandle: req.user.handle,
      name: req.user.name,
      banterImage,
      likeCount: 0,
      commentCount: 0,
      rebantCount: 0,
      banterId: req.params.id,
      userImage: req.user.userImage,
    });

    const comment = await newComment.save();
    bant.commentCount++;
    const data = await bant.save();
    banterEmitter.emit("comment", JSON.stringify(data));
    return res.json({
      status: success,
      data: { data, comment },
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
    const banter = await Banter.findById(req.params.id);
    if (!banter) return res.status(404).json({ banter: "Banter not found!" });

    banterData = banter;
    banterData.banterId = banter._id;

    const likeDocument = await Like.findOne({
      $and: [{ userHandle: { $eq: req.user.handle } }, { banterId: { $eq: req.params.id } }],
    });
    if (likeDocument) return res.status(400).json({ error: "Banter already liked" });

    const like = new Like({ banterId: req.params.id, userHandle: req.user.handle });
    const likeData = await like.save();
    banterData.likeCount++;
    await banterData.save();
    banterEmitter.emit(LIKE_EVENT, { data: banterData, like: likeData });
    return res.status(200).json({ status: success, message: "Banter liked successfully", data: { data: banterData, like: likeData } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//For unliking banter
router.route("/:id/unlike").get(auth, async (req, res) => {
  let banterData;
  try {
    const banter = await Banter.findById(req.params.id);
    if (!banter) return res.status(404).json({ banter: "Banter not found!" });

    banterData = banter;
    banterData.banterId = banter._id;

    const like = await Like.find({
      $and: [{ userHandle: { $eq: req.user.handle } }, { banterId: { $eq: req.params.id } }],
    });

    if (like === "" || banterData.likeCount <= 0) {
      return res.status(400).json({ error: "Banter not liked" });
    } else {
      await Like.deleteOne({ userHandle: { $eq: req.user.handle } });
      banterData.likeCount--;
      await banterData.save();
      return res.status(200).json({ status: success, message: "Banter unliked successfully", data: { data: banterData } });
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
    const banter = await Banter.findById(req.params.id);
    if (!banter) return res.status(404).json({ banter: "Banter not found!" });

    banterData = banter;
    banterData.banterId = banter._id;

    const comments = await Comment.find({ banterId: { $eq: req.params.id } }).sort({ createdAt: -1 });
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
    if (!bant) return res.status(404).json({ error: "Banter not found" });

    if (bant.banterHandle !== req.user.handle) return res.status(403).json({ error: "Unauthorised" });
    else {
      await Banter.deleteOne({ _id: { $eq: req.params.id } });
      return res.status(200).json({ status: success, data: bant, message: "Banter deleted successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

module.exports = router;
