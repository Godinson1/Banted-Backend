const handleResponse = async (res, status, code, message) => {
  return res.status(code).json({
    status,
    message,
  });
};

const error = "error";
const success = "success";

module.exports = { handleResponse, success, error };
