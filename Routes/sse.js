const { Router } = require("express");
const sse = require("../events/sse.event");

const router = Router();

router.get("/stream", sse.init);

module.exports = router;
