const express =
    require("express");

const router =
    express.Router();

const {

    getMentorSessions,
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