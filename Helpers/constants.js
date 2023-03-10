const handleResponse = async (res, status, code, message) => {
  return res.status(code).json({
    status,
    message,
  });
};

const error = "error";
const success = "success";
const NO_IMG = "https://res.cloudinary.com/moneybizz/image/upload/v1675363539/Images/zl1wmpqhl5wwzwsyjnow.png";

module.exports = { handleResponse, success, error, NO_IMG };
