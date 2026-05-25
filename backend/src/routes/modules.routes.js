const express =
require("express");

const router =
express.Router();

const {

    getModules,
    createModule,
    updateModule,
    deleteModule

} = require(
    "../controllers/modules.controller"
);

/* GET */

router.get(
    "/:courseId",
    getModules
);

/* CREATE */

router.post(
    "/",
    createModule
);

/* EDIT */

router.put(
    "/:id",
    updateModule
);

/* DELETE */

router.delete(
    "/:id",
    deleteModule
);

module.exports =
router;