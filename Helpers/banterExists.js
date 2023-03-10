const Banter = require("../models/bantModel");

const banterExist = async (res, id) => {
  let banterData;
  const banter = await Banter.findById(id);
  if (banter) {
    banterData = banter;
    banterData.banterId = banter._id;
    return banterData;
  } else {
    return res.status(404).json({ banter: "Banter not found!" });
  }
};

module.exports = banterExist;
