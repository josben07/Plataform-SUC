const express = require("express");
const router = express.Router();

const {
    getCourseMentors,
    getMentorsByCourse,
    assignMentorToCourse,
    removeCourseMentor
} = require("../controllers/course-mentors.controller");

router.get("/", getCourseMentors);
router.get("/course/:courseId", getMentorsByCourse);
router.post("/", assignMentorToCourse);
router.delete("/:id", removeCourseMentor);

module.exports = router;
