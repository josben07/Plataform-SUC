const express =
    require("express");

const router =
    express.Router();

const {

    getMentorsWithProfiles,
    upsertMentorProfile

} = require(
    "../controllers/mentor-profiles.controller"
);

router.get(
    "/",
    getMentorsWithProfiles
);

router.post(
    "/",
    upsertMentorProfile
);

module.exports =
    router;