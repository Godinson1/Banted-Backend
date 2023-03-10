const router = require("express").Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let User = require("../models/userModels");
const auth = require("../middleware/auth");
const Follow = require("../models/followModel");
const Banter = require("../models/bantModel");
const Like = require("../models/likeModel");

const { isEmail, jwtSignUser, uploadImageCloudinary } = require("../Helpers");
const { success, error, handleResponse, NO_IMG } = require("../Helpers");

//Get authenticated user
router.route("/").get(auth, async (req, res) => {
  let userData = {};
  try {
    const user = await User.find({ handle: { $eq: req.user.handle } }).select("-password");
    userData.credentials = user;

    const followers = await Follow.find({ handle: { $eq: req.user.handle } }).sort({ createdAt: -1 });
    userData.followers = followers;

    const following = await Follow.find({ followerHandle: { $eq: req.user.handle } });
    userData.following = following;

    const banters = await Banter.find({ banterHandle: { $eq: req.user.handle } }).sort({ createdAt: -1 });
    userData.banters = banters;

    const likes = await Like.find({ userHandle: { $eq: req.user.handle } }).sort({ createdAt: -1 });
    userData.likes = likes;
    return res.status(200).json(userData);
  } catch (err) {
    console.log(err);
    return res.json(500).json({ message: "Something went Wrong!" });
  }
});

//All users
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

//Register User
router.route("/register").post(async (req, res) => {
  const { name, handle, email, password } = req.body;
  if (!isEmail(email)) return res.status(400).json({ error: "Must be a valid email address!" });

  try {
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).json({ error: `User with ${email} already exist!` });

    const user = await User.findOne({ handle });
    if (user) return res.status(400).json({ error: `@${handle} is already taken. Try another!` });

    const userDetails = new User({
      name,
      handle,
      email,
      password,
      followers: 0,
      following: 0,
      userImage: NO_IMG,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userDetails.password, salt, async (err, hash) => {
        if (err) throw err;
        userDetails.password = hash;
        const user = await userDetails.save();
        const token = await jwtSignUser(user);
        const { id: userId, name, handle, email, followers, following } = user;
        return res.json({ token, user: { userId, name, handle, email, followers, following } });
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

//Login User
router.route("/login").post(async (req, res) => {
  const { data, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: { $eq: data } }, { handle: { $eq: data } }] });
    if (!user) return res.status(400).json({ error: "User does not exist.." });

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(400).json({ error: "Invalid credentials.." });

    const token = await jwtSignUser(user);
    const { id: userId, name, handle, email } = user;
    return res.json({ token, user: { userId, name, handle, email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong.." });
  }
});

//Follow a User
router.route("/follow/:handle").get(auth, async (req, res) => {
  let userData;

  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ message: "User not found" });
    userData = user;

    const isFollowed = await Follow.findOne({
      $and: [{ handle: { $eq: userData.handle } }, { followerId: { $eq: req.user.id } }],
    });

    if (isFollowed) return res.status(400).json({ message: "User already followed.." });
    else {
      const newFollowed = new Follow({
        name: userData.name,
        handle: userData.handle,
        userId: userData._id,
        followerName: req.user.name,
        followerImage: req.user.userImage,
        followerId: req.user.id,
        followerHandle: req.user.handle,
      });

      const isFollowed = await newFollowed.save();
      userData.followers++;
      await userData.save();

      const userFollowing = await User.findById(req.user.id);
      userFollowing.following++;
      await userFollowing.save();

      const followers = await Follow.find({ handle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
      const following = await Follow.find({ followerHandle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
      return res.status(200).json({ isFollowed, user, followers, following });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

//Get Authenticated User
router.get("/:handle", auth, async (req, res) => {
  let userData = {};

  try {
    const user = await User.find({ handle: { $eq: req.params.handle } }).select("-password");
    if (user === "") return res.status(400).json({ message: `User with @${req.params.handle} not found` });

    userData.userInformation = user;
    const followers = await Follow.find({ handle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
    userData.followers = followers;

    const following = await Follow.find({ followerHandle: { $eq: req.params.handle } });
    userData.following = following;

    const banters = await Banter.find({ banterHandle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
    userData.banters = banters;

    const likes = await Like.find({ userHandle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
    userData.likes = likes;
    return res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong.." });
  }
});

//Unfollow User
router.route("/unfollow/:handle").get(auth, async (req, res) => {
  let userData;

  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ message: "User not found" });

    userData = user;
    const isFollowed = await Follow.find({
      $and: [{ handle: { $eq: req.params.handle } }, { followerId: { $eq: req.user.id } }],
    });

    if (isFollowed === "") return res.status(400).json({ message: "User not followed.." });

    userData.followers--;
    await userData.save();
    const users = await User.findById(req.user.id).select("-password");
    users.following--;
    await users.save();

    await Follow.deleteOne({ $and: [{ handle: { $eq: req.params.handle } }, { followerId: { $eq: req.user.id } }] });
    const followers = await Follow.find({ handle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
    const following = await Follow.find({ followerHandle: { $eq: req.params.handle } }).sort({ createdAt: -1 });
    return res.status(200).json({ isFollowed, user, followers, following });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

//Get Banters for Authenticated User's timeline
router.route("/user/timeline").get(auth, async (req, res) => {
  try {
    let followerHandle = [];
    const follow = await Follow.find({ followerId: { $eq: req.user.id } });
    follow.forEach((handle) => followerHandle.push(handle.handle));

    const associatedBanters = await Banter.find({
      $or: [{ banterHandle: { $eq: req.user.handle } }, { banterHandle: { $in: followerHandle } }],
    }).sort({ createdAt: -1 });

    if (associatedBanters === "")
      return res.status(400).json({
        message: "No banters Yet!.. Create one or follow other banted users to see banters..",
      });
    return res.status(200).json(associatedBanters);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong.." });
  }
});

/*
 * NAME - updateProfilePhoto
 * @REQUEST METHOD - PUT
 * AIM - Update user's profile photo
 * Confirm authenticated user and update profile photo
 */
router.post("/:id/profile-image", auth, async (req, res) => {
  let userData;
  const prefferedTypes = ["image/jpeg", "image/jpg", "image/png"];
  try {
    if (!req.files || req.files === null || Object.keys(req.files).length === 0)
      return handleResponse(res, error, 400, `Please select a photo`);

    if (req.files.profile_image) {
      const image = req.files.profile_image;
      if (!prefferedTypes.includes(image.mimetype))
        return handleResponse(res, error, BAD_REQUEST, "Please select a valid photo");

      const url = await uploadImageCloudinary(image);
      userData = await User.findById(req.params.id);
      userData.userImage = url;
      const data = await userData.save();
      return res.status(200).json({ status: success, message: "Profile photo updated successfully..", data });
    } else {
      return handleResponse(res, error, 400, `Please select a photo`);
    }
  } catch (err) {
    console.log(err);
    return handleResponse(res, error, 500, "Something went wrong");
  }
});

module.exports = router;
