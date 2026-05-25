const express =
require("express");

const router =
express.Router();

const {

    getCourses,
    createCourse,
    updateCourse,
    deleteCourse

} = require(
    "../controllers/courses.controller"
);

/* GET COURSES */

router.get(
    "/",
    getCourses
);

/* CREATE COURSE */

router.post(
    "/",
    createCourse
);

module.exports =
router;

/* UPDATE */

router.put(
    "/:id",
    updateCourse
);

/* DELETE */

router.delete(
    "/:id",
    deleteCourse
);