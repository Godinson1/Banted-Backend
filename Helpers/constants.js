const handleResponse = async (res, status, code, message) => {
  return res.status(code).json({
    status,
    message,
  });
};

const error = "error";
const success = "success";
const NO_IMG = "https://storage.googleapis.com/banted-storage/mmm.jpg";

module.exports = { handleResponse, success, error, NO_IMG };
