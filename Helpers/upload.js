const util = require("util");
const { storage } = require("../config");
const bucket = storage.bucket("banted-storage");

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   name of file and buffer
 */

const uploadImage = (file, type) =>
  new Promise((resolve, reject) => {
    const { name, data } = file;

    const blob = bucket.file(
      type === "profile"
        ? "profile/" + name.replace(/ /g, "_")
        : "banterImages/" + name.replace(/ /g, "_")
    );
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = util.format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on("error", (err) => {
        console.log(err);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(data);
  });

module.exports = {
  uploadImage,
};
