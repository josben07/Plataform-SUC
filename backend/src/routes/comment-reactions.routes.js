const express =
    require("express");

const router =
    express.Router();

const {

    reactToComment,
    getCommentReactions

} = require(
    "../controllers/comment-reactions.controller"
);

router.get(
    "/:commentId",
    getCommentReactions
);

router.post(
    "/",
    reactToComment
);

module.exports =
    router;