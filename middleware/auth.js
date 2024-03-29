const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("banted-token");
  if (!token) return res.status(401).json({ status: "error", message: "Sorry, No Authorization!" });

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ status: "error", message: "Invalid Token" });
  }
};

module.exports = auth;
