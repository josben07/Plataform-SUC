const express =
    require("express");

const router =
    express.Router();

const {
    getCommentsByLesson,
    createComment
} = require("../controllers/comments.controller");

router.get(
    "/:lessonId",
    getCommentsByLesson
);

router.post(
    "/",
    createComment
);

module.exports =
    router;