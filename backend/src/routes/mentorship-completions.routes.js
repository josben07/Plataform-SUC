const express = require("express");
const router = express.Router();

const {
    mentorComplete,
    studentComplete,
    getCompletionStatus
} = require("../controllers/mentorship-completions.controller");

router.post("/mentor-complete", mentorComplete);
router.post("/student-complete", studentComplete);
router.get("/status/:sessionId", getCompletionStatus);

module.exports = router;
