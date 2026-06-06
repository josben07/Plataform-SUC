const express =
    require("express");

const router =
    express.Router();

const {

    getMentorSessions,
    getMentorSessionsByMentor,
    createMentorSession,
    updateMentorSession,
    deleteMentorSession,
    requestMentorship,
    cancelMentorship

} = require(
    "../controllers/mentor.controller"
);

/* GET */

router.get(
    "/",
    getMentorSessions
);

router.get(
    "/sessions/:mentorId",
    getMentorSessionsByMentor
);

/* CREATE */

router.post(
    "/",
    createMentorSession
);

/* UPDATE */

router.put(
    "/:id",
    updateMentorSession
);

/* DELETE */

router.delete(
    "/:id",
    deleteMentorSession
);

router.put(
    "/request/:id",
    requestMentorship
);

router.put(
    "/cancel/:id",
    cancelMentorship
);

module.exports =
    router;
