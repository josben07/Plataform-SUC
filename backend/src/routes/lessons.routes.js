const express =
require("express");

const router =
express.Router();

const {

    getLessons,
    createLesson,
    updateLesson,
    deleteLesson

} = require(
    "../controllers/lessons.controller"
);

/* GET */

router.get(
    "/:moduleId",
    getLessons
);

/* CREATE */

router.post(
    "/",
    createLesson
);

/* EDIT */
router.put(
    "/:id",
    updateLesson
);

/* DELETE */

router.delete(
    "/:id",
    deleteLesson
);

module.exports =
router;