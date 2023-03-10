const { EventEmitter } = require("node:events");
const { LIKE_EVENT, COMMENT_EVENT, CREATE_EVENT } = require("./constants");
const sse = require("./sse.event");

class BanterEmitter extends EventEmitter {
  constructor() {
    super();
  }

  createBanter(data) {
    sse.send(data, CREATE_EVENT);
  }

  likeBanter(data) {
    sse.send(data, LIKE_EVENT);
  }

  commentOnBanter(data) {
    sse.send(data, COMMENT_EVENT);
  }
}
const banterEmitter = new BanterEmitter();

banterEmitter.on("create", (data) => {
  banterEmitter.createBanter(data);
});

banterEmitter.on("like", (data) => {
  banterEmitter.likeBanter(data);
});

banterEmitter.on("comment", (data) => {
  banterEmitter.commentOnBanter(data);
});

module.exports = {
  banterEmitter,
};
