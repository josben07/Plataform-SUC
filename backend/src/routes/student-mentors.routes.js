const express =
    require("express");

const router =
    express.Router();

const {

    getMentors,
    assignMentor,
    getStudentMentors

} = require(
    "../controllers/student-mentors.controller"
);

router.get(
    "/mentors",
    getMentors
);

router.get(
    "/:studentId",
    getStudentMentors
);

router.post(
    "/assign",
    assignMentor
);

module.exports =
    router;