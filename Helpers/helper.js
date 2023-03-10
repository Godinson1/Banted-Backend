const jwt = require("jsonwebtoken");

//Empty validation
const isEmpty = (data) => {
  if (data.trim() === "") return true;
  else return false;
};

//Email Validation
const isEmail = (email) => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const jwtSignUser = (user) => {
  const userData = { id: user.id, name: user.name, handle: user.handle, userImage: user.userImage };
  return jwt.sign(userData, `${process.env.jwt_secret}`, {
    expiresIn: 36000,
  });
};

module.exports = {
  isEmail,
  isEmpty,
  jwtSignUser,
};
