require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const { handleResponse } = require("./constants");

cloudinary.config({
  cloud_name: `${process.env.cloudinaryName}`,
  api_key: `${process.env.cloudinaryApiKey}`,
  api_secret: `${process.env.cloudinarySecretKey}`,
  secure: true,
});

const uploadFromBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream({ folder: "Images" }, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    streamifier.createReadStream(data).pipe(cld_upload_stream);
  });
};

const uploadImageCloudinary = async (file) => {
  const result = await uploadFromBuffer(file.data);
  return result.url;
};

const getPhotoUrl = async (req, res) => {
  const reqFiles = [];
  const prefferedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (req.files && req.files.banterImage) {
    const image = req.files.banterImage;
    if (!Array.isArray(image)) {
      if (!prefferedTypes.includes(image.mimetype))
        return handleResponse(res, error, 400, "Please select a valid photo");
      const url = await uploadImageCloudinary(image);
      reqFiles.push(url);
    } else {
      for (var i = 0; i < req.files.banterImage.length; i++) {
        if (!prefferedTypes.includes(image[i].mimetype))
          return handleResponse(res, error, 400, "Please select a valid photo");
        const url = await uploadImageCloudinary(image[i]);
        reqFiles.push(url);
      }
    }
  }
  return reqFiles;
};

module.exports = {
  getPhotoUrl,
  uploadImageCloudinary,
};
