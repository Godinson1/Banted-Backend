import util from "util";
import { storage } from "../config";
import { UploadedFile } from "express-fileupload";

const bucket = storage.bucket("bizz_bucket");

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   name of file and buffer
 */

export const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    const { name, data } = file;

    const blob = bucket.file(name.replace(/ /g, "_"));
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
