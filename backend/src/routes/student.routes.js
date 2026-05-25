const express =
    require("express");

const router =
    express.Router();

const {

    getStudentStats

} = require(
    "../controllers/student.controller"
);

router.get(
    "/stats/:userId",
    getStudentStats
);

module.exports =
    router;