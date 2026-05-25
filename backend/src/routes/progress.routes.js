const express = require("express");

const router = express.Router();

const {
    getProgress,
    completeLesson
} = require("../controllers/progress.controller");

router.get(
    "/:userId/:courseId",
    getProgress
);

router.post(
    "/complete",
    completeLesson
);

module.exports = router;