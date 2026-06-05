const express =
    require("express");

const router =
    express.Router();

const {

    getStudentCourses,
    buyCourse,
    enrollCourse,
    completeCourse

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

/* ENROLL */
router.post(
    "/enroll",
    enrollCourse
);

/* COMPLETE */
router.post(
    "/complete",
    completeCourse
);

module.exports =
    router;
