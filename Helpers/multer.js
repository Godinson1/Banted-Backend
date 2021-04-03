const multer = require("multer");
const uuidv4 = require("uuidv4");

const DIR = "../public/BantedImages/profileImages/";
const DIR2 = "../public/BantedImages/BanterImages/";

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + filename);
  },
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR2);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + filename);
  },
});

const upload = multer({
  storage: storage1,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif"
    ) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

const uploadMultiple = multer({
  storage: storage2,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif"
    ) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
  limits: { fieldSize: 25 * 1024 * 1024 },
});

module.exports = {
  upload,
  uploadMultiple,
};
