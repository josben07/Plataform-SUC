const express =
    require("express");

const router =
    express.Router();

const {

    getStudentStats,
    getStudentMentors

} = require(
    "../controllers/student.controller"
);

router.get(
    "/stats/:userId",
    getStudentStats
);

router.get(
    "/mentors/:userId",
    getStudentMentors
);

module.exports =
    router;