const express =
    require("express");

const router =
    express.Router();

const {

    getStudentCourses,
    buyCourse,
    enrollCourse

} = require(
    "../controllers/student-courses.controller"
);

/* GET */

router.get(
    "/:studentId",
    getStudentCourses
);

/* BUY */

router.post(
    "/buy",
    buyCourse
);

module.exports =
    router;

/* ENROLL */
router.post(
    "/enroll",
    enrollCourse
);